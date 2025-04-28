import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verifica si hay un token en el almacenamiento local
  const location = useLocation();

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay token, renderiza el contenido protegido
  return children;
};

export default PrivateRoute;
