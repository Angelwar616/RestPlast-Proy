import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, set, onValue, off } from 'firebase/database';
import { 
    Gauge, 
    Zap, 
    Flame, 
    Thermometer, 
    Droplets, 
    Waves, 
    Wifi, 
    Play, 
    StopCircle,
    CheckCircle2,
    AlertTriangle,
    Power,
    Loader2
} from 'lucide-react';

const isNumeric = (v) => {
  if (v === null || v === undefined || v === 'NaN') return false;
  const n = Number(v);
  return !Number.isNaN(n) && Number.isFinite(n);
};

const SensorTester = () => {
  const [testingAll, setTestingAll] = useState(false);
  const [testingSingle, setTestingSingle] = useState(null); 
  const [testResults, setTestResults] = useState({
    "Peso_pr": undefined,
    "gas-MQ4": undefined,
    "gas-MQ5": undefined,
    "llama-S1": undefined,
    "llama-S2": undefined,
    "temp": undefined,
    "hum": undefined,
    "termocupla1": undefined,
    "termocupla2": undefined
  });

  const sensorKeys = [
    "Peso_pr", "gas-MQ4", "gas-MQ5", "llama-S1", 
    "llama-S2", "temp", "hum", "termocupla1", "termocupla2"
  ];

  // Mapeo de nombres React a nombres Arduino
  const sensorMapping = {
    // React -> Arduino
    "temp": "temp",
    "hum": "hum",
    "llama-S1": "llama1",
    "llama-S2": "llama2",
    "gas-MQ4": "mq4",
    "gas-MQ5": "mq5",
    "termocupla1": "termo1",
    "termocupla2": "termo2",
    "Peso_pr": "peso"
  };

  const cleanTestStates = async () => {
    try {
      await set(ref(db, 'Prueba/General'), "S/N");
      await set(ref(db, 'Prueba/Especifico'), "S/N");
      console.log("Estados de prueba limpiados");
    } catch (error) {
      console.error("Error al limpiar estados de prueba:", error);
    }
  };

  useEffect(() => {
    cleanTestStates();

    return () => {
      cleanTestStates();
    };
  }, []);

  const checkSensors = (sensorData) => {
    const results = {};
    sensorKeys.forEach(key => {
      const value = sensorData?.[key];
      results[key] = isNumeric(value);
    });
    return results;
  };

  const startAllTests = async () => {
    if (testingAll || testingSingle) return;
    setTestingAll(true);

    try {
      setTestResults(prev => {
        const clean = { ...prev };
        sensorKeys.forEach(k => { clean[k] = null; });
        return clean;
      });

      const generalRef = ref(db, 'Prueba/General');

      // En Arduino se espera "test" (no "Tst" o "WAIT")
      await set(generalRef, "test");

      // Esperar confirmación de Arduino
      const handleAck = (snapshot) => {
        const value = snapshot.val();
        console.log("General test response:", value);
        
        if (value === "S/N") {
          // Leer todos los sensores después del test
          const sensorsRef = ref(db, 'Sensor');
          onValue(sensorsRef, (sensorsSnapshot) => {
            const sensorData = sensorsSnapshot.val();
            if (sensorData) {
              setTestResults(checkSensors(sensorData));
            }
            setTestingAll(false);
            off(generalRef, handleAck);
            off(sensorsRef);
          }, { onlyOnce: true });
        }
      };

      onValue(generalRef, handleAck);

      // Timeout más largo para el test general (20 segundos)
      const timeoutId = setTimeout(() => {
        if (testingAll) {
          console.error("Timeout: El ESP32 no respondió en prueba general");
          setTestingAll(false);
          off(generalRef, handleAck);
        }
      }, 20000);

      return () => clearTimeout(timeoutId);

    } catch (error) {
      console.error('Error al iniciar pruebas:', error);
      setTestingAll(false);
    }
  };

  const testSingleSensor = async (sensorKey) => {
    if (testingAll || testingSingle) return;
    
    // Obtener el nombre que Arduino espera
    const arduinoSensorName = sensorMapping[sensorKey];
    if (!arduinoSensorName) {
      console.error(`Sensor ${sensorKey} no tiene mapeo a Arduino`);
      return;
    }
    
    setTestingSingle(sensorKey);
    setTestResults(prev => ({ ...prev, [sensorKey]: null }));

    try {
      const especificoRef = ref(db, 'Prueba/Especifico');
      
      // Enviar el nombre que Arduino reconoce
      await set(especificoRef, arduinoSensorName);
      console.log(`Solicitando test para: ${arduinoSensorName}`);

      const handleAck = (snapshot) => {
        const value = snapshot.val();
        console.log(`Especifico test response for ${sensorKey}:`, value);
        
        if (value === "S/N") {
          // Leer el sensor específico después del test
          const sensorRef = ref(db, `Sensor/${sensorKey}`);
          
          onValue(sensorRef, (sensorsSnapshot) => {
            const sv = sensorsSnapshot.val();
            const result = isNumeric(sv);
            setTestResults(prev => ({ ...prev, [sensorKey]: result }));
            setTestingSingle(null);
            off(especificoRef, handleAck);
            off(sensorRef);
          }, { onlyOnce: true });
        }
      };

      onValue(especificoRef, handleAck);

      // Timeout para el test específico
      const timeoutId = setTimeout(() => {
        if (testingSingle === sensorKey) {
          console.error(`Timeout: No se recibió respuesta para ${sensorKey}`);
          setTestResults(prev => ({ ...prev, [sensorKey]: false }));
          setTestingSingle(null);
          off(especificoRef, handleAck);
        }
      }, 10000);

      return () => clearTimeout(timeoutId);

    } catch (error) {
      console.error(`Error al probar sensor ${sensorKey}:`, error);
      setTestResults(prev => ({ ...prev, [sensorKey]: false }));
      setTestingSingle(null);
    }
  };

  const getSensorStatusDisplay = (key, value) => {
    if (value === null) {
      return (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Probando...
        </>
      );
    }
    
    if (value === true) {
      return (
        <>
          <CheckCircle2 className="w-3 h-3" />
          {key}
        </>
      );
    }
    
    if (value === false) {
      return (
        <>
          <AlertTriangle className="w-3 h-3" />
          {key}
        </>
      );
    }
    
    return (
      <>
        <StopCircle className="w-3 h-3" />
        {key}
      </>
    );
  };

  const getSensorStatusClass = (value) => {
    if (value === null) return 'bg-yellow-900/60 text-yellow-200';
    if (value === true) return 'bg-green-900 text-green-300';
    if (value === false) return 'bg-red-900 text-red-300';
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 overflow-hidden">
      <motion.div 
        className="bg-gray-800 bg-opacity-70 backdrop-blur-md border-b border-gray-700 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          PRUEBA DE SENSORES
        </h1>
      </motion.div>

      {/* Contenedor principal con scroll controlado */}
      <div className="h-[calc(100vh-80px)] p-6 overflow-auto">
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 w-full border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Wifi className="text-blue-400" />
              Prueba General de Sensores
            </h2>
            
            <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 border border-gray-600">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-gray-300 mb-2">Ejecuta pruebas en todos los sensores conectados</p>
                  <div className="flex flex-wrap gap-2">
                    {sensorKeys.map((key) => (
                      <span 
                        key={key} 
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getSensorStatusClass(testResults[key])}`}
                      >
                        {getSensorStatusDisplay(key, testResults[key])}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={startAllTests}
                  disabled={testingAll || testingSingle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    testingAll ? 'bg-yellow-800 text-yellow-200' : 
                    (testingSingle ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white')
                  }`}
                >
                  {testingAll ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Probando...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Iniciar Prueba Completa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Gauge className="text-blue-400" />
              Pruebas Individuales
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SensorTestCard 
                name="Sensor de Peso"
                sensorKey="Peso_pr"
                icon={<Gauge size={28} className="text-blue-400" />}
                status={testResults["Peso_pr"]}
                onTest={testSingleSensor}
                testing={testingSingle === "Peso_pr"}
                disabled={testingAll || (testingSingle && testingSingle !== "Peso_pr")}
              />
              
              <SensorTestCard 
                name="Gas MQ4"
                sensorKey="gas-MQ4"
                icon={<Zap size={28} className="text-yellow-400" />}
                status={testResults["gas-MQ4"]}
                onTest={testSingleSensor}
                testing={testingSingle === "gas-MQ4"}
                disabled={testingAll || (testingSingle && testingSingle !== "gas-MQ4")}
              />
              
              <SensorTestCard 
                name="Gas MQ5"
                sensorKey="gas-MQ5"
                icon={<Zap size={28} className="text-yellow-400" />}
                status={testResults["gas-MQ5"]}
                onTest={testSingleSensor}
                testing={testingSingle === "gas-MQ5"}
                disabled={testingAll || (testingSingle && testingSingle !== "gas-MQ5")}
              />
              
              <SensorTestCard 
                name="Sensor de Llama 1"
                sensorKey="llama-S1"
                icon={<Flame size={28} className="text-orange-400" />}
                status={testResults["llama-S1"]}
                onTest={testSingleSensor}
                testing={testingSingle === "llama-S1"}
                disabled={testingAll || (testingSingle && testingSingle !== "llama-S1")}
              />
              
              <SensorTestCard 
                name="Sensor de Llama 2"
                sensorKey="llama-S2"
                icon={<Flame size={28} className="text-orange-400" />}
                status={testResults["llama-S2"]}
                onTest={testSingleSensor}
                testing={testingSingle === "llama-S2"}
                disabled={testingAll || (testingSingle && testingSingle !== "llama-S2")}
              />
              
              <SensorTestCard 
                name="Temperatura (DHT11)"
                sensorKey="temp"
                icon={<Thermometer size={28} className="text-red-400" />}
                status={testResults["temp"]}
                onTest={testSingleSensor}
                testing={testingSingle === "temp"}
                disabled={testingAll || (testingSingle && testingSingle !== "temp")}
              />
              
              <SensorTestCard 
                name="Humedad (DHT11)"
                sensorKey="hum"
                icon={<Droplets size={28} className="text-blue-300" />}
                status={testResults["hum"]}
                onTest={testSingleSensor}
                testing={testingSingle === "hum"}
                disabled={testingAll || (testingSingle && testingSingle !== "hum")}
              />
              
              <SensorTestCard 
                name="Termocupla 1"
                sensorKey="termocupla1"
                icon={<Waves size={28} className="text-purple-400" />}
                status={testResults["termocupla1"]}
                onTest={testSingleSensor}
                testing={testingSingle === "termocupla1"}
                disabled={testingAll || (testingSingle && testingSingle !== "termocupla1")}
              />
              
              <SensorTestCard 
                name="Termocupla 2"
                sensorKey="termocupla2"
                icon={<Waves size={28} className="text-purple-400" />}
                status={testResults["termocupla2"]}
                onTest={testSingleSensor}
                testing={testingSingle === "termocupla2"}
                disabled={testingAll || (testingSingle && testingSingle !== "termocupla2")}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SensorTestCard = ({ name, sensorKey, icon, status, onTest, testing, disabled }) => {
  const navigate = useNavigate();

  const getStatusDisplay = () => {
    if (testing) {
      return (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Probando...
        </>
      );
    }
    
    if (status === true) return 'Funciona';
    if (status === false) return 'Falla';
    return 'No probado';
  };

  const getStatusClass = () => {
    if (testing) return 'bg-yellow-900/60 text-yellow-200';
    if (status === true) return 'bg-green-900 text-green-300';
    if (status === false) return 'bg-red-900 text-red-300';
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <motion.div 
      className={`rounded-xl p-4 border shadow-md bg-gray-900 relative ${
        disabled ? 'border-gray-800 opacity-70' : 
        testing ? 'border-yellow-700' : 
        status === true ? 'border-green-600' : 
        status === false ? 'border-red-600' : 'border-gray-700'
      }`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
    >
      {/* Flecha para simulaciones - MANTENIDA */}
      <button 
        onClick={() => navigate(`/sensor/${sensorKey}`)}
        className="absolute top-3 right-3 text-gray-400 hover:text-blue-400 transition-colors p-1"
        title="Ver simulaciones del sensor"
      >
        <Play size={16} className="rotate-90" />
      </button>

      <div className="text-3xl">
        {icon}
      </div>
      <div className="text-sm font-semibold text-gray-200 mt-2">{name}</div>
      
      <div className="flex items-center gap-2 mt-3">
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusClass()}`}>
          {getStatusDisplay()}
        </span>
        
        <button
          onClick={() => !disabled && onTest(sensorKey)}
          disabled={disabled}
          className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1 ${
            disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 
            'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {testing ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Probando...
            </>
          ) : (
            'Probar'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SensorTester;