import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EditUser.css'; 
const EditUser = () => {
  const { id } = useParams(); // Obtén el ID del usuario desde la URL
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    role: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener los datos del usuario para editarlos
    axios
      .get(`http://localhost:4000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        // Asegúrate de que la respuesta tenga los datos esperados
        console.log('Datos del usuario:', response.data); // Verifica la respuesta
        setUser({
          username: response.data.username, // Asigna los datos del usuario al estado
          role: response.data.role,
        });
      })
      .catch((error) => {
        console.error('Error al obtener los datos del usuario', error);
        setError('No se pudo obtener los datos del usuario');
      });
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí realizamos la solicitud PUT para editar el usuario
    axios
      .put(
        `https://backend-sockets-production.up.railway.app/api/users/${id}`,
        {
          username: user.username,
          role: user.role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((response) => {
        // Si la actualización es exitosa, redirige al usuario o muestra un mensaje
        console.log('Usuario actualizado:', response.data);
        navigate('/users'); // O cualquier ruta de redirección que desees
      })
      .catch((error) => {
        console.error('Error al actualizar el usuario', error);
        setError('No se pudo actualizar el usuario');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

 return (
    <div>
      <h2>Editar Usuario</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />
        </div>
        <br></br>
        <div>
          <label>Role:</label>
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <br></br>
        <button type="submit">Actualizar Usuario</button>
      </form>
    </div>
  );
};


export default EditUser;
