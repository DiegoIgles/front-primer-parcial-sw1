import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProjectList.css'; // Importamos el archivo CSS

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para carga

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://backend-sockets-production.up.railway.app/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
        setIsLoading(false); // Fin de la carga
      } catch (err) {
        setError('No se pudieron cargar los proyectos');
        setIsLoading(false); // Fin de la carga aunque haya error
      }
    };
  
    fetchProjects();
  }, [token]);
  
  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este proyecto? Esto también desasignará a los usuarios.');
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://backend-sockets-production.up.railway.app/api/projects/delete/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects((prevProjects) => prevProjects.filter((p) => p.id !== projectId)); // Actualización del estado de proyectos
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el proyecto');
    }
  };

  if (isLoading) {
    return <div>Cargando proyectos...</div>; // Aquí podrías agregar un spinner o algo visual
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Lista de Proyectos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Fecha de creación</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.nombre}</td>
              <td>{project.descripcion}</td>
              <td>{new Date(project.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleDelete(project.id)}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'} // Hover color change
                  onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'} // Reset hover color
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsList;
