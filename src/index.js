// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Importar BrowserRouter
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Envolver la aplicación con BrowserRouter
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
