import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute'; 
import Register from './pages/Register';
import UsersList from './pages/UserList';
import EditUser from './pages/EditUser';
import AssignProjectPage from './pages/AssignProjectPage';
import AssignedProjects from './pages/AssignedProjectsPage';
import EditorUIPage from './pages/EditorUIPage'
// 👉 Importa el nuevo componente para crear UI
import CreateProjectUI from './pages/CreateProjectUI';
import ProjectsList from './pages/ProjectsList'; // Asegúrate de que la ruta sea correcta.
import CrearProyectoClase from './pages/CrearProyectoClase'; // IMPORTANTE: Añade la nueva página aquí.
import ProyectosClase from './pages/ProyectosClase'; 
import AsignarProyectoUML from './pages/AsignarProyectoUML';
import ProyectoAsignadoUML from './pages/MisProyectosUML';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserRole(decodedToken.role);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserRole(decodedToken.role);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  const handleRegisterSuccess = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserRole(decodedToken.role);
    navigate('/dashboard');
  };

  return (
    <div>
      {isAuthenticated && <Navbar onLogout={handleLogout} role={userRole} />}
      
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route 
          path="/users" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <UsersList /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

        <Route 
          path="/edit-user/:id" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <EditUser /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

        <Route 
          path="/assign-project" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <AssignProjectPage /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />

        <Route 
          path="/assigned-projects" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AssignedProjects />
            </PrivateRoute>
          }
        />

        {/* 👉 NUEVA RUTA para crear UI de proyecto */}
        <Route 
          path="/crear-proyecto" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <CreateProjectUI /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        /><Route
        path="/edit-ui/:id"
        element={
         
            <EditorUIPage />
        }
      />
      <Route 
  path="/projects" 
  element={
    <PrivateRoute isAuthenticated={isAuthenticated}>
      {userRole === 'admin' ? <ProjectsList /> : <Navigate to="/dashboard" />}
    </PrivateRoute>
  }
/>  <Route 
          path="/crear-proyecto-clase" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <CrearProyectoClase /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />
        <Route 
          path="/proyectos-clase" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <ProyectosClase /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />
        <Route 
          path="/asignar-proyecto-clase" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              {userRole === 'admin' ? <AsignarProyectoUML /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }
        />
        <Route 
          path="/mis-proyectos-uml" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              < ProyectoAsignadoUML/>
            </PrivateRoute>
          }
        />
       
      </Routes>
      
    </div>
  );
};

export default App;
