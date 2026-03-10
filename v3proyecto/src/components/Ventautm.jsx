import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fan } from 'lucide-react';
import { db } from '../firebase';
import { ref, set, onValue, off } from 'firebase/database';

const ControlVentiladoresAutomatico = () => {
  const [temperatura, setTemperatura] = useState(0);
  const [velocidadPorcentaje, setVelocidadPorcentaje] = useState(0);

  // Configuración fija
  const config = {
    tempMin: 20,    
    tempMax: 29,    
    minSpeed: 81,   
    maxSpeed: 255   
  };

  const porcentajeToPWM = (porcentaje) => {
    if (porcentaje === 0) return config.minSpeed;
    return Math.round(config.minSpeed + (porcentaje / 100) * (config.maxSpeed - config.minSpeed));
  };

  const calcularVelocidad = (temp) => {
    if (temp <= config.tempMin) return 0; 
    if (temp >= config.tempMax) return 100; 
    
    const porcentaje = ((temp - config.tempMin) / (config.tempMax - config.tempMin)) * 100;
    return Math.round(porcentaje);
  };

  const actualizarVentiladores = async (porcentaje) => {
    const velocidadPWM = porcentajeToPWM(porcentaje);
    
    try {
      await Promise.all([
        set(ref(db, 'Ventilador/vent1'), velocidadPWM),
        set(ref(db, 'Ventilador/vent2'), velocidadPWM)
      ]);
    } catch (error) {
      console.error("Error al actualizar ventiladores:", error);
    }
  };

  useEffect(() => {
    const tempRef = ref(db, 'Sensor/temp');

    const tempListener = onValue(tempRef, (snapshot) => {
      const tempActual = snapshot.val();
      if (tempActual !== null && !isNaN(tempActual)) {
        const tempNum = Number(tempActual);
        setTemperatura(tempNum);

        const nuevoPorcentaje = calcularVelocidad(tempNum);
        setVelocidadPorcentaje(nuevoPorcentaje);

        actualizarVentiladores(nuevoPorcentaje);
      }
    });

    return () => {
      off(tempRef);
    };
  }, []);

  const getColorVelocidad = () => {
    if (velocidadPorcentaje === 0) return 'text-green-400';
    if (velocidadPorcentaje < 33) return 'text-blue-400';
    if (velocidadPorcentaje < 66) return 'text-yellow-400';
    return 'text-red-400';
  };

  const ventiladores = [
    { id: 1, nombre: 'Ventilador 1' },
    { id: 2, nombre: 'Ventilador 2' }
  ];

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Fan className="text-blue-400" size={20} />
          <span className="text-white font-medium text-sm">Control Ventiladores</span>
        </div>
        <div className="text-xs text-gray-400">
          {temperatura.toFixed(1)}°C
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ventiladores.map((ventilador) => (
          <div key={ventilador.id} className="bg-gray-700 bg-opacity-30 rounded-lg p-3 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Fan 
                  className={`${getColorVelocidad()} ${velocidadPorcentaje > 0 ? 'animate-spin' : ''}`}
                  size={16}
                  style={{ 
                    animationDuration: velocidadPorcentaje > 0 ? `${1500 - (velocidadPorcentaje * 12)}ms` : '0s' 
                  }}
                />
                <span className="text-white text-xs font-medium">{ventilador.nombre}</span>
              </div>
              <div className={`text-sm font-bold ${getColorVelocidad()}`}>
                {velocidadPorcentaje}%
              </div>
            </div>
            
            <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  velocidadPorcentaje === 0 ? 'bg-green-500' :
                  velocidadPorcentaje < 33 ? 'bg-blue-500' :
                  velocidadPorcentaje < 66 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${velocidadPorcentaje}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-400 text-center">
        {velocidadPorcentaje === 0 ? 'Mínimo' : velocidadPorcentaje === 100 ? 'Máximo' : 'Control automático'}
      </div>
    </motion.div>
  );
};

export default ControlVentiladoresAutomatico;