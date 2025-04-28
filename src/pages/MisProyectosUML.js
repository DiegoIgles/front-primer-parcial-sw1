import { useEffect, useState } from 'react';
import axios from 'axios';
import './MisProyectosUML.css';

function ProyectoAsignadoUML() {
  const [proyecto, setProyecto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No hay token disponible. Inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userId = decoded.id;

      axios.get(`https://backend-sockets-production.up.railway.app/api/proyecto-clase/assigned-project/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.data.proyecto) {
          setProyecto(response.data.proyecto);
        } else {
          setError('No tienes proyectos asignados.');
        }
      })
      .catch(error => {
        console.error('Error al obtener el proyecto:', error);
        setError(error.response?.data?.message || 'No se pudo obtener el proyecto asignado.');
      })
      .finally(() => {
        setLoading(false);
      });
    } catch (e) {
      console.error('Error decodificando token:', e);
      setError('Token inválido.');
      setLoading(false);
    }
  }, []);

  const handleExportToAngular = async () => {
    if (!proyecto) return;
    
    setExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'post',
        url: `https://backend-sockets-production.up.railway.app/api/proyecto-clase/export-angular/${proyecto.id}`,
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${proyecto.nombre}-angular.zip`);
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setExportSuccess(true);
      }, 100);
    } catch (error) {
      console.error('Error al exportar:', error);
      
      // Manejar errores cuando el backend devuelve JSON
      if (error.response?.data?.type?.includes('application/json')) {
        const errorData = JSON.parse(await new Response(error.response.data).json());
        setError(errorData.message || 'Error al exportar el proyecto');
      } else {
        setError(error.message || 'Error al exportar el proyecto a Angular');
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!proyecto) {
    return <div className="text-center p-4">No se encontró ningún proyecto</div>;
  }

  return (
    <div className="card">
      <h1 className="card-title">{proyecto.nombre}</h1>
      <p className="card-description">{proyecto.descripcion}</p>
      
      <button 
        onClick={handleExportToAngular}
        disabled={exporting}
        className={`export-button ${exporting ? 'exporting' : ''}`}
      >
        {exporting ? (
          <>
            <span className="spinner"></span>
            Exportando...
          </>
        ) : (
          'Exportar a Angular'
        )}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      {exportSuccess && (
        <div className="success-message">
          ¡Proyecto exportado con éxito! El archivo se ha descargado automáticamente.
        </div>
      )}
    </div>
  );
}

export default ProyectoAsignadoUML;