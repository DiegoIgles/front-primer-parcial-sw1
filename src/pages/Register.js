// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('https://backend-sockets-production.up.railway.app/api/register', {
        username,
        password,
      });
      
      setMessage(response.data.message); // Mostrar el mensaje de éxito
      console.log(response.data.token); // Guarda el token si lo necesitas

      // Llamar a la función de redirección después del registro exitoso
      if (response.data.token) {
        onRegisterSuccess(response.data.token); // Pasamos el token al handler para manejar el estado
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Hubo un error al registrar el usuario');
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre de usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
