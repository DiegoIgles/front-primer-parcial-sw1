import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { fabric } from 'fabric';
import io from 'socket.io-client';
import './EditorUIPage.css';

const socket = io('https://backend-sockets-production.up.railway.app'); // Asegúrate que apunte a tu backend

const EditUIPage = () => {
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [color, setColor] = useState('#000000');
  const { id } = useParams();
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado.');
      return;
    }

    axios.get(`https://backend-sockets-production.up.railway.app/api/projects/edit-ui/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const { proyecto } = response.data;

        if (!proyecto) {
          setError('No se encontró el proyecto.');
          return;
        }

        const { fabricJson, nombre, descripcion } = proyecto;

        if (!fabricJson) {
          setError('No se encontró diseño para este proyecto.');
          return;
        }

        const parsedFabricJson = typeof fabricJson === 'string'
          ? JSON.parse(fabricJson)
          : fabricJson;

        setProject({ nombre, descripcion, fabricJson: parsedFabricJson });
        setIsCanvasReady(true);
      })
      .catch(error => {
        console.error('Error al obtener el proyecto:', error);
        setError('No se pudo cargar el proyecto.');
      });
  }, [id]);

  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current || !project) return;
  
    const canvasElement = canvasRef.current;
    const newCanvas = new fabric.Canvas(canvasElement);
    setCanvas(newCanvas);
  
    const fabricData = typeof project.fabricJson === 'string'
      ? JSON.parse(project.fabricJson)
      : project.fabricJson;
  
    newCanvas.loadFromJSON(fabricData, newCanvas.renderAll.bind(newCanvas));
  
    let isRemoteUpdate = false; // 💡 NUEVO: bandera para saber si el cambio viene del socket
  
    // Unirse a la sala
    socket.emit('join-room', id);
  
    // Recibir actualizaciones del canvas
    socket.on('canvas-update', (data) => {
      if (data && data !== JSON.stringify(newCanvas.toJSON())) {
        isRemoteUpdate = true;
        newCanvas.loadFromJSON(JSON.parse(data), () => {
          newCanvas.renderAll();
          isRemoteUpdate = false; // 💡 Una vez cargado, desactivamos la bandera
        });
      }
    });
  
    const emitCanvasUpdate = () => {
      if (isRemoteUpdate) return; // 💡 No emitimos si vino del socket
      const json = JSON.stringify(newCanvas.toJSON());
      socket.emit('canvas-update', { roomId: id, json });
    };
  
    newCanvas.on('object:added', emitCanvasUpdate);
    newCanvas.on('object:modified', emitCanvasUpdate);
    newCanvas.on('object:removed', emitCanvasUpdate);
    newCanvas.on('object:moving', emitCanvasUpdate); // 💡 este es el nuevo

    return () => {
      newCanvas.dispose();
      socket.emit('leave-room', id);
      socket.off('canvas-update');
    };
  }, [isCanvasReady, project,id]);
  

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: color, // Color dinámico desde el picker
      width: 120,
      height: 80,
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',  // Color sombra
        blur: 10,                  // Difuminado
        offsetX: 5,                // Desplazamiento X
        offsetY: 5,                // Desplazamiento Y
      },
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };
  useEffect(() => {
    if (!canvas) return;
  
    const handleObjectModified = (e) => {
      const obj = e.target;
      if (obj.type === 'rect' && obj.shadow) {
        obj.set({
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY,
          scaleX: 1,
          scaleY: 1,
        });
        canvas.renderAll();
      }
    };
  
    canvas.on('object:modified', handleObjectModified);
  
    return () => {
      canvas.off('object:modified', handleObjectModified);
    };
  }, [canvas]);
  

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox('Texto aquí', {
      left: 200,
      top: 150,
      fontSize: 20,
      fill: color,
    });
    canvas.add(text);
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleSave = async () => {
    if (!canvas) return;
    const canvasJson = JSON.stringify(canvas.toJSON());
    const token = localStorage.getItem('token');

    try {
       await axios.put(`https://backend-sockets-production.up.railway.app/api/projects/update/${id}`, {
        fabricJson: canvasJson,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setError('¡Proyecto guardado con éxito!');
    } catch (error) {
      console.error(error);
      setError('Hubo un error al guardar el proyecto.');
    }
  };

  const deleteSelectedObject = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      setError('¡Objeto eliminado!');
    } else {
      setError('No hay objeto seleccionado para eliminar.');
    }
  };

  return (
    <div className="editor-ui-container">
      <h2>Editor de Interfaz: {project ? project.nombre : 'Cargando...'}</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="editor-toolbar">
        <button onClick={addRectangle}>Agregar Rectángulo</button>
        <button onClick={addText}>Agregar Texto</button>

        <div>
          <label htmlFor="colorPicker">Selecciona un color:</label>
          <input
            type="color"
            id="colorPicker"
            value={color}
            onChange={handleColorChange}
          />
        </div>

        <button onClick={handleSave}>Guardar Proyecto</button>
        <button onClick={deleteSelectedObject}>Eliminar Objeto</button>
      </div>

      <canvas ref={canvasRef} width="1280" height="600"></canvas>
    </div>
  );
};

export default EditUIPage;
