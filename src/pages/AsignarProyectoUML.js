import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Importar axios
import './AsignarProyectoUML.css';

const AsignarProyectoUML = () => {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [error, setError] = useState('');
  
    // Obtener usuarios y proyectos al cargar la página
    useEffect(() => {
      fetchUsers();
      fetchProjects();
    }, []);
  
    // Función para obtener los usuarios usando axios
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
          },
        });
        setUsers(response.data); // Asignar los usuarios al estado
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('No se pudo obtener la lista de usuarios');
      }
    };
  
    // Función para obtener los proyectos usando axios
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/proyecto-clase', {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
          },
        });
        setProjects(response.data); // Asignar los proyectos al estado
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('No se pudo obtener la lista de proyectos');
      }
    };
  
    // Función para asignar un proyecto a un usuario
    const handleAssignProject = () => {
      if (!selectedUser || !selectedProject) {
        alert('Por favor selecciona un usuario y un proyecto');
        return;
      }
  
      axios
        .post(
          'http://localhost:4000/api/proyecto-clase/assign-user', 
          {
            userId: selectedUser,
            proyectoClaseId: selectedProject,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Incluir el token
            },
          }
        )
        .then((response) => {
          alert('Proyecto asignado con éxito');
          setSelectedUser('');
          setSelectedProject('');
        })
        .catch((error) => {
          console.error('Error al asignar el proyecto:', error);
          alert('Error al asignar el proyecto');
        });
    };
  
  return (
    <div className="assign-project-container">
        <br></br>
      <h2>Asignar Proyecto UML a Usuario</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="select-container">
        <label>Usuario:</label>
        <select 
          onChange={(e) => setSelectedUser(e.target.value)} 
          value={selectedUser}
          className="select-box"
        >
          <option value="">Selecciona un usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div className="select-container">
        <label>Proyecto:</label>
        <select 
          onChange={(e) => setSelectedProject(e.target.value)} 
          value={selectedProject}
          className="select-box"
        >
          <option value="">Selecciona un proyecto</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.nombre}
            </option>
          ))}
        </select>
      </div>

      <button className="assign-btn" onClick={handleAssignProject}>Asignar Proyecto</button>
    </div>
  );
};

export default AsignarProyectoUML;
