import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import axios from 'axios';
import './CreateProjectUI.css';

const CreateProjectUI = () => {
  const canvasRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('#000000'); // Color por defecto (negro)

  useEffect(() => {
    const canvas = new fabric.Canvas('fabricCanvas', {
      width: 1280,
      height: 600,
      backgroundColor: '#fff',
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  const addRectangle = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: color, // Usar el color seleccionado
      width: 120,
      height: 80,
      shadow: {
        color:  'rgba(0, 0, 0, 0.3)',  // Color de sombra
        blur: 10,                  // Difuminado
        offsetX: 5,                // Desplazamiento horizontal
        offsetY: 5,                // Desplazamiento vertical
      },
      hasControls: true,          // Permitir redimensionar
      hasBorders: true,
      selectable: true,
    });
  
    canvasRef.current.add(rect);
    canvasRef.current.setActiveObject(rect);
  };
  
  // Normalizar escala cuando el objeto es modificado
  useEffect(() => {
    if (!canvasRef.current) return;
  
    const canvas = canvasRef.current;
  
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
  }, []);
  

  const addText = () => {
    const text = new fabric.Textbox('Texto aquí', {
      left: 200,
      top: 150,
      fontSize: 20,
      fill: color, // Usar el color seleccionado
    });
    canvasRef.current.add(text);
  };

  const handleColorChange = (e) => {
    setColor(e.target.value); // Actualizar el color seleccionado
  };

  const handleSave = async () => {
    if (!nombre || !descripcion) {
      setMensaje('Completa el nombre y la descripción.');
      return;
    }

    const canvasJson = JSON.stringify(canvasRef.current.toJSON());
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('https://backend-sockets-production.up.railway.app/api/projects/create', {
        nombre,
        descripcion,
        fabricJson: canvasJson,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setMensaje('¡Proyecto creado con éxito!');
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      setMensaje('Hubo un error al guardar el proyecto.');
    }
  };

  return (
    <div className="ui-editor-container">
        <br></br>
      <h2>Crear Proyecto UI</h2>

      <div className="form">
        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <textarea
          placeholder="Descripción del proyecto"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="editor-toolbar">
        <button onClick={addRectangle}>Agregar Rectángulo</button>
        <button onClick={addText}>Agregar Texto</button>
        
        {/* Selector de color */}
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
      </div>

      <canvas id="fabricCanvas" className="editor-canvas"></canvas>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default CreateProjectUI;
