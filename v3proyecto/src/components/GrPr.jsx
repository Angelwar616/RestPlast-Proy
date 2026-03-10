import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, ArrowLeft, BarChart2, AlertCircle } from 'lucide-react';

const GrPr = () => {
  const [procesos, setProcesos] = useState([]);
  const [filteredProcesos, setFilteredProcesos] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/proceso_principal/');
        setProcesos(response.data);
        setFilteredProcesos(response.data); 
      } catch (error) {
        console.error('Error al obtener los procesos:', error);
        setErrorMessage('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función corregida para formatear fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Ajustar al huso horario local
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    
    return adjustedDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener la fecha en formato YYYY-MM-DD para el filtro
  const getLocalDateString = (dateString) => {
    const date = new Date(dateString);
    // Ajustar al huso horario local
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toISOString().split('T')[0];
  };

  const handleClick = (id) => {
    navigate(`/DatoMysql/${id}`);
  };

  const handleSearch = () => {
    if (!selectedDate) {
      setErrorMessage('Por favor seleccione una fecha');
      setShowAll(true); 
      setFilteredProcesos(procesos);
      return;
    }

    const filtered = procesos.filter(proceso => {
      const processDate = getLocalDateString(proceso.createdAt);
      return processDate === selectedDate;
    });

    setShowAll(false); 
    
    if (filtered.length > 0) {
      setFilteredProcesos(filtered);
      setErrorMessage('');
    } else {
      setFilteredProcesos([]);
      setErrorMessage('No existen datos guardados en esta fecha');
    }
  };

  const handleShowAll = () => {
    setSelectedDate('');
    setShowAll(true);
    setFilteredProcesos(procesos);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Historial de Procesos
        </h1>
        <Link to="/" className="flex items-center text-gray-400 hover:text-gray-300">
          <ArrowLeft className="mr-2" size={20} />
          Volver
        </Link>
      </motion.div>

      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 p-6 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Seleccione una fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="date"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={handleSearch}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-6 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-blue-500/20 font-medium"
            >
              <Search size={18} />
              Buscar
            </button>
            {!showAll && (
              <button
                onClick={handleShowAll}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white py-2 px-6 rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all shadow-lg hover:shadow-gray-500/20 font-medium"
              >
                Mostrar todos
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {errorMessage && (
        <motion.div
          className="flex items-center bg-red-900/30 text-red-400 p-3 rounded-lg mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="mr-2" size={18} />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 p-6 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredProcesos.length > 0 ? (
            <>
              <div className="mb-4 text-gray-400">
                {showAll ? (
                  <p>Mostrando todos los procesos ({procesos.length})</p>
                ) : (
                  <p>Mostrando procesos para la fecha seleccionada ({filteredProcesos.length})</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProcesos.map((proceso) => (
                  <motion.div
                    key={proceso.id}
                    onClick={() => handleClick(proceso.id)}
                    className="bg-gray-700 bg-opacity-70 hover:bg-gray-600 rounded-xl border border-gray-600 p-6 cursor-pointer transition-all hover:shadow-lg hover:border-blue-400"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-400">
                          Proceso #{proceso.id}
                        </h3>
                        {/* Usar la función corregida para mostrar la fecha */}
                        <p className="text-sm text-gray-400">
                          {formatDate(proceso.createdAt)}
                        </p>
                      </div>
                      <div className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                        {proceso.peso_inicio} kg
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <div className="bg-gray-600 p-3 rounded-lg">
                        <BarChart2 className="text-blue-400" size={40} />
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center text-gray-300 text-sm">
                      Click para ver detalles
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {showAll ? (
                <>
                  <p>No hay procesos registrados</p>
                  <p className="text-sm mt-2">No se encontraron datos en la base de datos</p>
                </>
              ) : (
                <>
                  <p>No hay procesos para la fecha seleccionada</p>
                  <p className="text-sm mt-2">Intente con otra fecha o muestre todos los registros</p>
                  <button
                    onClick={handleShowAll}
                    className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white py-2 px-6 rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all shadow-lg hover:shadow-gray-500/20 font-medium mx-auto"
                  >
                    Mostrar todos los procesos
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default GrPr;