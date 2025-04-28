import React, { useState, useEffect } from 'react';
import './ProyectosClase.css';

const ProyectosClase = () => {
  const [proyectos, setProyectos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchProyectos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensaje('Debes iniciar sesión para ver los proyectos');
        return;
      }

      try {
        const response = await fetch('https://backend-sockets-production.up.railway.app/api/proyecto-clase/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProyectos(data);
        } else {
          setMensaje('Error al obtener los proyectos');
        }
      } catch (error) {
        console.error('Error:', error);
        setMensaje('Error al conectarse al servidor');
      }
    };

    fetchProyectos();
  }, []);

  const eliminarProyecto = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('Debes iniciar sesión para eliminar un proyecto');
      return;
    }

    try {
      const response = await fetch(`https://backend-sockets-production.up.railway.app/api/proyecto-clase/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setProyectos(proyectos.filter(proyecto => proyecto.id !== id));
        setMensaje('Proyecto eliminado correctamente');
      } else {
        setMensaje('Error al eliminar el proyecto');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al eliminar el proyecto');
    }
  };

  return (
    <div className="proyectos-container">
      <h2>Proyectos Diagrama de Clase</h2>
      {mensaje && <div className="mensaje">{mensaje}</div>}

      {proyectos.length === 0 ? (
        <div className="no-proyectos">No hay proyectos disponibles</div>
      ) : (
        <ul className="proyectos-list">
          {proyectos.map(proyecto => (
            <li key={proyecto.id}>
              <h3>{proyecto.nombre}</h3>
              <p>{proyecto.descripcion}</p>
              <small>Creado el: {new Date(proyecto.createdAt).toLocaleString()}</small>
              <button onClick={() => eliminarProyecto(proyecto.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProyectosClase;
