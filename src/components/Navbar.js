import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;

  // Función para alternar el estado del menú (abrir/cerrar)
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para cerrar el menú cuando se hace clic en un enlace
  const closeMenuOnClick = () => {
    setIsMenuOpen(false);  // Cierra el menú
  };

  return (
    <nav className="navbar">
      {/* Botón de menú visible siempre */}
      <div className="menu-icon" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Overlay para oscurecer el fondo */}
      <div className={`overlay ${isMenuOpen ? 'show' : ''}`} onClick={toggleMenu}></div>

      {/* Menú desplegable */}
      <ul className={`menu ${isMenuOpen ? 'open' : ''}`}>
        {/* Enlace para el dashboard */}
        <li><Link to="/dashboard" onClick={closeMenuOnClick}>Dashboard</Link></li>

        {/* Mostrar el botón de "Mis Proyectos" para todos los usuarios */}
        <li><Link to="/assigned-projects" onClick={closeMenuOnClick}>Mis Proyectos</Link></li>
        <li><Link to="/mis-proyectos-uml" onClick={closeMenuOnClick}>Mis Proyectos UML</Link></li>

        {/* Enlaces exclusivos para administradores */}
        {userRole === 'admin' && (
          <>
            <li><Link to="/users" onClick={closeMenuOnClick}>Usuarios</Link></li>
            <li><Link to="/assign-project" onClick={closeMenuOnClick}>Asignar Proyecto</Link></li>
            <li><Link to="/crear-proyecto" onClick={closeMenuOnClick}>Crear Proyecto</Link></li>
            <li><Link to="/projects" onClick={closeMenuOnClick}>Proyectos</Link></li>
            <li><Link to="/crear-proyecto-clase" onClick={closeMenuOnClick}>Crear Diagrama de Clase</Link></li>
            <li><Link to="/proyectos-clase" onClick={closeMenuOnClick}>Proyectos UML</Link></li>
            <li><Link to="/asignar-proyecto-clase" onClick={closeMenuOnClick}>Asignar Proyecto UML</Link></li>

          </>
        )}

        {/* Botón para cerrar sesión */}
        <li><button onClick={onLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
