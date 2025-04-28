import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Aquí usamos useNavigate
import './UserList.css'; // Importar los estilos de la lista

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');

  const token = localStorage.getItem('token'); // Obtenemos el token del localStorage

  // Usamos el hook useNavigate
  const navigate = useNavigate();

  // Decodificar el token para obtener el rol
  useEffect(() => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificamos el token
      setUserRole(decodedToken.role); // Establecemos el rol en el estado
    }
  }, [token]);

  // Obtener los usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data); // Almacenar la lista de usuarios
      } catch (error) {
        setError('No se pudieron obtener los usuarios.');
      }
    };

    fetchUsers();
  }, [token]);

  // Eliminar usuario
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:4000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter(user => user.id !== userId)); // Actualizar la lista de usuarios
    } catch (error) {
      setError('No se pudo eliminar el usuario.');
    }
  };

  // Editar usuario (puedes redirigir a un formulario para editar o manejar en el mismo lugar)
  const handleEdit = (userId) => {
    console.log(`Editar usuario con ID: ${userId}`);
    // Redirigir a la página de edición de usuario
    navigate(`/edit-user/${userId}`);
  };

  return (
    <div className="users-list-container">
      <h2>Lista de Usuarios</h2>
      {error && <p className="error">{error}</p>}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Proyecto ID</th> {/* 👈 Añadido */}
            <th>Class ID</th> {/* 👈 Añadido */}
            {userRole === 'admin' && <th>Acciones</th>} {/* Solo los admins ven la columna de acciones */}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.proyectoId || '—'}</td> {/* 👈 Mostrar proyectoId o guión si null */}
              <td>{user.proyectoClaseId || '—'}</td> {/* 👈 Mostrar proyectoId o guión si null */}

              {userRole === 'admin' && (
                <td>
                  <button onClick={() => handleEdit(user.id)}>Editar</button>
                  <button onClick={() => handleDelete(user.id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
