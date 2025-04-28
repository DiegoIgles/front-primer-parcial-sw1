// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar para redireccionar

import './login.css'; // Importar los estilos para el navbar

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook de navegación

  const handleSubmit = (e) => {
    e.preventDefault();

    // Realizar la solicitud de login aquí
    fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          onLogin(data.token); // Pasa el token a la función onLogin del App.js
        } else {
          alert('Credenciales incorrectas');
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div className="login-container">
      {/* Aquí agregamos la imagen */}
      <img src="/logo192.png" alt="Logo" className="login-logo" />
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>¿No tienes cuenta?</p>
      <button onClick={() => navigate('/register')}>
        Ir a Registro
      </button>
    </div>
  );
};

export default Login;
