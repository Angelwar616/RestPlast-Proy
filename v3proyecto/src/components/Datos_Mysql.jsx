import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { ArrowLeft, Home, CheckSquare, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const DatosMysql = () => {
  const { id } = useParams();
  const [datosProceso, setDatosProceso] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [datosProcesoSecundario, setDatosProcesoSecundario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState({
    temperatura: true,
    humedad: false,
    peso: false,
    termocupla1: false,
    termocupla2: false,
    gas1: false,
    gas2: false,
    llama1: false,
    llama2: false,
  });

  // Función para formatear fechas corrigiendo el huso horario
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Ajustar al huso horario local
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toLocaleDateString('es-ES');
  };

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        console.log('Solicitando datos para ID:', id);
        
        const response = await axios.get(`http://localhost:5000/proceso_principal/${id}`);
        const responseSec = await axios.get(`http://localhost:5000/proceso_secundario/${id}`);
        
        console.log('Respuesta proceso principal:', response.data);
        console.log('Respuesta proceso secundario:', responseSec.data);

        if (response.data) {
          setDatosProceso(response.data);
        } else {
          setErrorMessage('No se encontraron datos para este proceso');
        }

        if (responseSec.data && Array.isArray(responseSec.data)) {
          setDatosProcesoSecundario(responseSec.data);
          console.log('Datos secundarios cargados:', responseSec.data.length, 'registros');
          console.log('Campos disponibles:', Object.keys(responseSec.data[0]));
        } else {
          setErrorMessage('No se encontraron datos secundarios');
        }
      } catch (error) {
        setErrorMessage('Error al cargar los datos');
        console.error('Error detallado:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDatos();
  }, [id]);

  const handleCheckboxChange = (field) => {
    setSelectedData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const prepareChartData = () => {
    console.log('Preparando datos para gráfico...');
    console.log('Datos secundarios disponibles:', datosProcesoSecundario);

    const datasets = [];
    const labels = datosProcesoSecundario.map((_, index) => `${index * 30} min`);

    if (selectedData.temperatura && datosProcesoSecundario.length > 0) {
      const temperaturaData = datosProcesoSecundario.map(item => item.temp);
      console.log('Datos de temperatura:', temperaturaData);
      
      datasets.push({
        label: 'Temperatura (°C)',
        data: temperaturaData,
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.humedad && datosProcesoSecundario.length > 0) {
      const humedadData = datosProcesoSecundario.map(item => item.hum);
      
      datasets.push({
        label: 'Humedad (%)',
        data: humedadData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.peso && datosProcesoSecundario.length > 0) {
      const pesoData = datosProcesoSecundario.map(item => item.Peso_pr);
      
      datasets.push({
        label: 'Peso (kg)',
        data: pesoData,
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.termocupla1 && datosProcesoSecundario.length > 0) {
      const termocupla1Data = datosProcesoSecundario.map(item => item.termocupla1);
      
      datasets.push({
        label: 'Termocupla 1 (°C)',
        data: termocupla1Data,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.termocupla2 && datosProcesoSecundario.length > 0) {
      const termocupla2Data = datosProcesoSecundario.map(item => item.termocupla2);
      
      datasets.push({
        label: 'Termocupla 2 (°C)',
        data: termocupla2Data,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.gas1 && datosProcesoSecundario.length > 0) {
      const gas1Data = datosProcesoSecundario.map(item => item.gas1);
      
      datasets.push({
        label: 'Gas 1 (ppm)',
        data: gas1Data,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.gas2 && datosProcesoSecundario.length > 0) {
      const gas2Data = datosProcesoSecundario.map(item => item.gas2);
      
      datasets.push({
        label: 'Gas 2 (ppm)',
        data: gas2Data,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.llama1 && datosProcesoSecundario.length > 0) {
      const llama1Data = datosProcesoSecundario.map(item => item.llama1);
      
      datasets.push({
        label: 'Llama 1',
        data: llama1Data,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    if (selectedData.llama2 && datosProcesoSecundario.length > 0) {
      const llama2Data = datosProcesoSecundario.map(item => item.llama2);
      
      datasets.push({
        label: 'Llama 2',
        data: llama2Data,
        borderColor: 'rgb(132, 204, 22)',
        backgroundColor: 'rgba(132, 204, 22, 0.2)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
      });
    }

    const chartData = {
      labels,
      datasets
    };

    console.log('Datos finales para el gráfico:', chartData);
    return chartData;
  };

  const chartData = useMemo(() => prepareChartData(), [datosProcesoSecundario, selectedData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          },
          usePointStyle: true,
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(156, 163, 175, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo (minutos)',
          color: '#E5E7EB'
        },
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Valores',
          color: '#E5E7EB'
        },
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        beginAtZero: false
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-300">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4">
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-6 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
            Detalles del Proceso
          </h1>
          <div className="flex space-x-3">
            <Link 
              to="/GrPr" 
              className="flex items-center text-gray-400 hover:text-gray-300 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="mr-2" size={18} />
              Volver
            </Link>
            <Link 
              to="/" 
              className="flex items-center text-gray-400 hover:text-gray-300 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Home className="mr-2" size={18} />
              Inicio
            </Link>
          </div>
        </div>

        {/* Información del proceso */}
        {datosProceso && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
                <p className="text-gray-100 font-medium">
                  {/* Usar la función corregida para mostrar la fecha */}
                  {formatDate(datosProceso.createdAt)}
                </p>
              </div>
              
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Hora de inicio</label>
                <p className="text-gray-100 font-medium">
                  {datosProceso.hora_inicio || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Hora final</label>
                <p className="text-gray-100 font-medium">
                  {datosProceso.hora_fin || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Peso inicial</label>
                <p className="text-gray-100 font-medium">
                  {datosProceso.peso_inicio || 'N/A'} kg
                </p>
              </div>
              
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Peso final</label>
                <p className="text-gray-100 font-medium">
                  {datosProceso.peso_final || 'N/A'} kg
                </p>
              </div>
            </div>
          </>
        )}

        {errorMessage && (
          <div className="flex items-center bg-red-900/30 text-red-400 p-3 rounded-lg mb-6">
            <AlertCircle className="mr-2" size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Selectores de datos */}
        <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
            <CheckSquare className="mr-2" size={20} />
            Datos a graficar ({datosProcesoSecundario.length} registros)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.temperatura}
                onChange={() => handleCheckboxChange('temperatura')}
                className="rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-300 text-sm">Temperatura</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.humedad}
                onChange={() => handleCheckboxChange('humedad')}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm">Humedad</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.peso}
                onChange={() => handleCheckboxChange('peso')}
                className="rounded text-green-500 focus:ring-green-500"
              />
              <span className="text-gray-300 text-sm">Peso</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.termocupla1}
                onChange={() => handleCheckboxChange('termocupla1')}
                className="rounded text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300 text-sm">Termocupla 1</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.termocupla2}
                onChange={() => handleCheckboxChange('termocupla2')}
                className="rounded text-pink-500 focus:ring-pink-500"
              />
              <span className="text-gray-300 text-sm">Termocupla 2</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.gas1}
                onChange={() => handleCheckboxChange('gas1')}
                className="rounded text-red-500 focus:ring-red-500"
              />
              <span className="text-gray-300 text-sm">Gas 1</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.gas2}
                onChange={() => handleCheckboxChange('gas2')}
                className="rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-300 text-sm">Gas 2</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.llama1}
                onChange={() => handleCheckboxChange('llama1')}
                className="rounded text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-gray-300 text-sm">Llama 1</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.llama2}
                onChange={() => handleCheckboxChange('llama2')}
                className="rounded text-lime-500 focus:ring-lime-500"
              />
              <span className="text-gray-300 text-sm">Llama 2</span>
            </label>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 h-96">
          <h2 className="text-lg font-medium text-gray-300 mb-4">
            Evolución del proceso 
            {datosProcesoSecundario.length > 0 && ` - ${datosProcesoSecundario.length} puntos de datos`}
          </h2>
          {datosProcesoSecundario.length > 0 ? (
            <Line 
              key={`chart-${JSON.stringify(selectedData)}-${datosProcesoSecundario.length}`}
              data={chartData} 
              options={options} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <AlertCircle size={48} className="mb-4" />
              <p>No hay datos disponibles para graficar</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DatosMysql;