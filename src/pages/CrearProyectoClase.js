import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import './CrearProyectoClase.css';

const DiagramaClase = () => {
  const canvasRef = useRef(null);
  const [nombreClase, setNombreClase] = useState('');
  const [atributos, setAtributos] = useState('');
  const [metodos, setMetodos] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modo, setModo] = useState('select');
  const [claseOrigen, setClaseOrigen] = useState(null);
  const [pasoRelacion, setPasoRelacion] = useState(null);
  const [nombreProyecto, setNombreProyecto] = useState('');
const [descripcionProyecto, setDescripcionProyecto] = useState('');
  const [proyectoIdGuardado] = useState(null);
  const [idGuardado, setIdGuardado] = useState(null);

  const guardarProyecto = async () => {
    try {
      const token = localStorage.getItem('token'); // 🔑 Asegurate de tenerlo guardado al iniciar sesión
  
      if (!token) {
        console.error('Token no encontrado. Inicia sesión.');
        setMensaje('Error: Debes iniciar sesión para guardar el proyecto.');
        return;
      }
  
      const json = canvasRef.current.toJSON();
  
      const response = await fetch('http://localhost:4000/api/proyecto-clase/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🛡️ Aquí va el token
        },
        body: JSON.stringify({
          nombre: nombreProyecto,  // Usar el nombre ingresado
          descripcion: descripcionProyecto,  
          fabricJson: JSON.stringify(json)
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Guardado exitoso:', data);
        setMensaje('Proyecto guardado correctamente.');
        setIdGuardado(data.id); // 👈 Asegurate de tener este `useState`
      } else {
        console.error('Respuesta del servidor con error:', data);
        setMensaje('Error al guardar: ' + (data?.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje('Error al guardar el proyecto');
    }
  };
  
  
  // Función para actualizar conexiones
  const updateConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.forEachObject(obj => {
      if (obj.type === 'relation') {
        const { class1Id, class2Id } = obj;
        const class1 = canvas.getObjects().find(o => o.id === class1Id);
        const class2 = canvas.getObjects().find(o => o.id === class2Id);

        if (class1 && class2) {
          // Calcular puntos de conexión que eviten superponerse con los rectángulos
          const start = class1.getBoundingRect();
          const end = class2.getBoundingRect();
          
          // Calcular puntos de intersección con los bordes de los rectángulos
          const angle = Math.atan2(end.top - start.top, end.left - start.left);
          const startPoint = getIntersectionPoint(start, angle);
          const endPoint = getIntersectionPoint(end, angle + Math.PI);
          
          obj.set({ 
            x1: startPoint.x, 
            y1: startPoint.y, 
            x2: endPoint.x, 
            y2: endPoint.y 
          });
        }
      }
    });
    canvas.renderAll();
  }, []);

  // Función para calcular puntos de intersección con los bordes
  const getIntersectionPoint = (rect, angle) => {
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    // Calcular punto de intersección con el borde del rectángulo
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    
    const scaleX = 1 / Math.abs(dx);
    const scaleY = 1 / Math.abs(dy);
    
    const scale = Math.min(scaleX, scaleY);
    
    return {
      x: center.x + dx * scale * halfWidth,
      y: center.y + dy * scale * halfHeight
    };
  };

  // Inicializar canvas
  useEffect(() => {
    const canvas = new fabric.Canvas('diagramaCanvas', {
      width: 1200,
      height: 700,
      backgroundColor: '#f8f9fa',
      selection: true,
    });

    canvasRef.current = canvas;
    canvas.on('object:moving', updateConnections);

    return () => {
      canvas.off('object:moving', updateConnections);
      canvas.clear();  // Limpia objetos sin tocar el DOM

      canvas.dispose();
    };
  }, [updateConnections]);

  // Manejar selección de clase
  const handleSeleccionarClase = () => {
    const canvas = canvasRef.current;
    const activeObject = canvas.getActiveObject();
    
    if (!activeObject || activeObject.type !== 'class') {
      setMensaje('Seleccione una clase en el canvas primero');
      return;
    }

    if (!pasoRelacion) {
      // Primer paso: seleccionar origen
      setClaseOrigen(activeObject);
      setPasoRelacion('destino');
      setMensaje('Clase origen seleccionada. Ahora seleccione la clase destino');
      activeObject.set('stroke', 'red');
      activeObject.set('strokeWidth', 3);
      canvas.discardActiveObject();
      canvas.renderAll();
    } else if (pasoRelacion === 'destino') {
      // Segundo paso: seleccionar destino y crear relación
      if (activeObject.id === claseOrigen.id) {
        setMensaje('No puede relacionar una clase consigo misma');
        return;
      }
      
      crearRelacion(claseOrigen, activeObject);
    }
  };

  // Crear una nueva clase
  const crearClase = () => {
    if (!nombreClase) {
      setMensaje('Ingrese un nombre para la clase');
      return;
    }

    const canvas = canvasRef.current;
    const id = `class-${Date.now()}`;
    
    const nombreText = new fabric.Textbox(nombreClase, {
      fontSize: 16,
      fontWeight: 'bold',
      left: 10,
      top: 10,
      width: 180,
      textAlign: 'center',
      editable: true
    });

    const atributosText = new fabric.Textbox(atributos || 'atributos', {
      fontSize: 14,
      left: 10,
      top: 40,
      width: 180,
      editable: true
    });

    const metodosText = new fabric.Textbox(metodos || 'metodos()', {
      fontSize: 14,
      left: 10,
      top: 70,
      width: 180,
      editable: true
    });

    const rect = new fabric.Rect({
      width: 200,
      height: 110,
      fill: '#e3f2fd',
      stroke: '#2196f3',
      strokeWidth: 2,
      rx: 5,
      ry: 5
    });

    const grupo = new fabric.Group([rect, nombreText, atributosText, metodosText], {
      left: 100,
      top: 100,
      hasControls: true,
      hasBorders: true,
      lockUniScaling: true,
      id: id,
      type: 'class'
    });

    canvas.add(grupo);
    canvas.setActiveObject(grupo);
    canvas.renderAll();

    setNombreClase('');
    setAtributos('');
    setMetodos('');
    setMensaje('Clase creada');
  };

  // Crear relación entre clases
  const crearRelacion = useCallback((class1, class2) => {
    const canvas = canvasRef.current;
    
    const start = class1.getBoundingRect();
    const end = class2.getBoundingRect();

    // Calcular puntos de conexión en los bordes
    const angle = Math.atan2(
      end.top + end.height/2 - (start.top + start.height/2),
      end.left + end.width/2 - (start.left + start.width/2)
    );
    
    const startPoint = getIntersectionPoint(start, angle);
    const endPoint = getIntersectionPoint(end, angle + Math.PI);

    // Crear línea con z-index más bajo
    const line = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
      stroke: '#333',
      strokeWidth: 2,
      selectable: true,
      class1Id: class1.id,
      class2Id: class2.id,
      type: 'relation',
      relationType: 'association',
     
      evented: true,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true
    });

    canvas.add(line);
    canvas.sendToBack(line);

    // Restablecer estilos
    class1.set('stroke', '#2196f3');
    class1.set('strokeWidth', 2);
    canvas.renderAll();
    
    setClaseOrigen(null);
    setPasoRelacion(null);
    setMensaje(`Asociación creada entre ${class1._objects[0].text} y ${class2._objects[0].text}`);
  }, []);

  const cancelarSeleccion = () => {
    const canvas = canvasRef.current;
    if (claseOrigen && canvas) {
      claseOrigen.set('stroke', '#2196f3');
      claseOrigen.set('strokeWidth', 2);
      canvas.renderAll();
    }
    setClaseOrigen(null);
    setPasoRelacion(null);
    setMensaje('Selección cancelada');
  };

  const eliminarSeleccion = () => {
    const canvas = canvasRef.current;
    const activeObject = canvas.getActiveObject();
    
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      setMensaje('Elemento eliminado');
    } else {
      setMensaje('Nada seleccionado');
    }
    
  };

  return(
    <div className="diagrama-container">
      <br />
      <h2>Crear Diagramas de Clase</h2>

      <div className="toolbar">
        <button
          className={modo === 'select' ? 'active' : ''}
          onClick={() => {
            cancelarSeleccion();
            setModo('select');
          }}
        >
          Seleccionar
        </button>
        <button
          className={modo === 'class' ? 'active' : ''}
          onClick={() => {
            cancelarSeleccion();
            setModo('class');
          }}
        >
          Crear Clase
        </button>

        <button
          className={modo === 'association' ? 'active' : ''}
          onClick={() => {
            cancelarSeleccion();
            setModo('association');
          }}
        >
          Asociación
        </button>
    
        <button
          onClick={handleSeleccionarClase}
          disabled={modo !== 'association'}
          className="select-btn"
        >
          Seleccionar Clase
        </button>

        <button onClick={eliminarSeleccion} className="delete-btn">
          Eliminar
        </button>

        {(claseOrigen || pasoRelacion) && (
          <button onClick={cancelarSeleccion} className="cancel-btn">
            Cancelar
          </button>
        )}

    
      </div>

      {modo === 'class' && (
        <div className="class-form">
          <input
            type="text"
            placeholder="Nombre de la clase"
            value={nombreClase}
            onChange={(e) => setNombreClase(e.target.value)}
          />
          <textarea
            placeholder="Atributos (ej: -nombre: String)"
            value={atributos}
            onChange={(e) => setAtributos(e.target.value)}
          />
          <textarea
            placeholder="Métodos (ej: +getNombre(): String)"
            value={metodos}
            onChange={(e) => setMetodos(e.target.value)}
          />
          <button onClick={crearClase}>Crear Clase</button>
        </div>
      )}

      <div className="save-form">
        <h3>Guardar Proyecto</h3>
        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={nombreProyecto}
          onChange={(e) => setNombreProyecto(e.target.value)} // Almacena el nombre del proyecto
        />
        <textarea
          placeholder="Descripción del proyecto"
          value={descripcionProyecto}
          onChange={(e) => setDescripcionProyecto(e.target.value)} // Almacena la descripción del proyecto
        />
        <button onClick={guardarProyecto}>Guardar Proyecto</button>
      </div>
 {/* Mostrar ID guardado si existe */}
 {idGuardado && (
      <div className="info">
        <p>ID del proyecto guardado: <strong>{idGuardado}</strong></p>
      </div>
    )}
      <div className="canvas-container">
        <canvas id="diagramaCanvas" ref={canvasRef} />
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('error') ? 'error' : 'info'}`}>
          {mensaje}
        </div>
      )}

      {proyectoIdGuardado && (
        <div className="info">
          ID del proyecto guardado: <strong>{proyectoIdGuardado}</strong>
        </div>
      )}
    </div>
  );
  
};

export default DiagramaClase;