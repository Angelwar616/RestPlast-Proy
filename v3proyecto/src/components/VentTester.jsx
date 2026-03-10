import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fan, Gauge, Sliders, RefreshCw } from 'lucide-react';
import { db } from '../firebase';
import { ref, set, onValue, off } from 'firebase/database';

const VentTester = () => {
  const [fanSpeeds, setFanSpeeds] = useState({ fan1: 0, fan2: 0 });
  const [activeFan, setActiveFan] = useState('fan1');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const firebaseToUI = (firebaseValue) => {
    if (firebaseValue === 0) return 0;
    if (firebaseValue < 81) return 0;
    return Math.round(((firebaseValue - 81) / (255 - 81)) * 100);
  };

  const uiToFirebase = (uiValue) => {
    if (uiValue === 0) return 0;
    return Math.round(81 + ((uiValue - 1) / 99) * (255 - 81));
  };

  const resetAllFans = async () => {
    setIsResetting(true);
    try {
      await Promise.all([
        set(ref(db, 'Ventilador/vent1'), 0),
        set(ref(db, 'Ventilador/vent2'), 0)
      ]);
      setFanSpeeds({ fan1: 0, fan2: 0 });
    } catch (error) {
      console.error("Error al resetear ventiladores:", error);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const vent1Ref = ref(db, 'Ventilador/vent1');
    const vent2Ref = ref(db, 'Ventilador/vent2');

    const vent1Listener = onValue(vent1Ref, (snapshot) => {
      setFanSpeeds(prev => ({ ...prev, fan1: firebaseToUI(snapshot.val()) }));
    });

    const vent2Listener = onValue(vent2Ref, (snapshot) => {
      setFanSpeeds(prev => ({ ...prev, fan2: firebaseToUI(snapshot.val()) }));
    });

    return () => {
      off(vent1Ref);
      off(vent2Ref);
      resetAllFans(); 
    };
  }, []);

  const handleSpeedChange = async (e) => {
    const uiSpeed = parseInt(e.target.value);
    setFanSpeeds(prev => ({ ...prev, [activeFan]: uiSpeed }));
    
    try {
      setIsLoading(true);
      await set(ref(db, `Ventilador/${activeFan === 'fan1' ? 'vent1' : 'vent2'}`), uiToFirebase(uiSpeed));
    } catch (error) {
      console.error("Error al cambiar velocidad:", error);
    } finally {
      setIsLoading(false);
    }
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
          CONTROL DE VENTILADORES
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
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Fan className="text-blue-400" />
            Control de Ventiladores
          </h2>

          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Gauge className="text-blue-300" size={20} />
              Seleccionar Ventilador
            </h3>
            <div className="flex gap-4">
              {['fan1', 'fan2'].map(fan => (
                <button
                  key={fan}
                  onClick={() => setActiveFan(fan)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                    activeFan === fan 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Fan size={18} />
                  Ventilador {fan.charAt(3)}
                  {isLoading && activeFan === fan && (
                    <span className="ml-2 inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Sliders className="text-blue-300" size={20} />
              Control de Velocidad
            </h3>
            <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4 border border-gray-600">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-3/4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fanSpeeds[activeFan]}
                    onChange={handleSpeedChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    disabled={isLoading}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="w-full sm:w-1/4 flex justify-center items-center gap-2">
                  <div className="text-2xl font-bold text-white bg-gray-800 px-4 py-2 rounded-lg min-w-[80px] text-center">
                    {fanSpeeds[activeFan]}%
                  </div>
                  <button
                    onClick={resetAllFans}
                    disabled={isResetting}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800"
                    title="Reiniciar ambos ventiladores"
                  >
                    <RefreshCw size={20} className={isResetting ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Fan className="text-blue-300" size={20} />
              Estado de Ventiladores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['fan1', 'fan2'].map(fan => (
                <motion.div 
                  key={fan}
                  className={`rounded-xl p-6 border shadow-md ${
                    fanSpeeds[fan] > 0 ? 'border-green-600 bg-green-900 bg-opacity-20' : 'border-gray-600 bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex items-center gap-3">
                        <Fan size={24} className={fanSpeeds[fan] > 0 ? "text-green-400" : "text-gray-400"} />
                        <span className="font-medium text-white text-lg">Ventilador {fan.charAt(3)}</span>
                      </div>
                      <span className={`text-xl font-bold ${
                        fanSpeeds[fan] > 0 ? "text-green-400" : "text-gray-400"
                      }`}>
                        {fanSpeeds[fan]}%
                      </span>
                    </div>
                    
                    <div className="relative w-40 h-40 my-4">
                      <div className={`absolute inset-0 rounded-full border-4 ${
                        fanSpeeds[fan] > 0 ? "border-green-500 animate-spin" : "border-gray-500"
                      }`} style={{
                        animationDuration: `${Math.max(1000 - (fanSpeeds[fan] * 8), 200)}ms`,
                        borderTopColor: 'transparent'
                      }}></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-32 h-32 flex items-center justify-center ${
                          fanSpeeds[fan] > 0 ? "animate-spin" : ""
                        }`} style={{
                          animationDuration: `${Math.max(1000 - (fanSpeeds[fan] * 8), 200)}ms`
                        }}>
                          <div className="w-full h-1 bg-gray-400 absolute rounded-full" style={{ transform: 'rotate(0deg)' }}></div>
                          <div className="w-full h-1 bg-gray-400 absolute rounded-full" style={{ transform: 'rotate(120deg)' }}></div>
                          <div className="w-full h-1 bg-gray-400 absolute rounded-full" style={{ transform: 'rotate(240deg)' }}></div>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-600 z-10"></div>
                      </div>
                    </div>
                    
                    <div className={`text-sm mt-2 ${
                      fanSpeeds[fan] > 0 ? "text-green-400" : "text-gray-400"
                    }`}>
                      {fanSpeeds[fan] > 0 ? "En funcionamiento" : "Detenido"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VentTester;