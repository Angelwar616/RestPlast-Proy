import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Power, Gauge, Flame, Thermometer, Zap, Droplets, Waves } from 'lucide-react';

const iconos = {
  "gas-MQ4": <Zap size={28} className="text-yellow-400" />,
  "gas-MQ5": <Zap size={28} className="text-yellow-400" />,
  "llama-S1": <Flame size={28} className="text-orange-400" />,
  "llama-S2": <Flame size={28} className="text-orange-400" />,
  "temp": <Thermometer size={28} className="text-red-400" />,
  "hum": <Droplets size={28} className="text-blue-300" />,
  "Peso_pr": <Gauge size={28} className="text-blue-400" />,
  "termocupla1": <Waves size={28} className="text-purple-400" />,
  "termocupla2": <Waves size={28} className="text-purple-400" />
};

const VistaSensorDetalle = ({ sensor, onClose }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [valor, setValor] = useState(0);
  const [alerta, setAlerta] = useState(null);

  const umbrales = {
    "gas-MQ4": 200, "gas-MQ5": 100, "llama-S1": 400, 
    "llama-S2": 400, "temp": 38, "hum": 70, 
    "Peso_pr": 500, "termocupla1": 300, "termocupla2": 300
  };

  useEffect(() => {
    const esTemperatura = sensor === 'temp' || sensor.includes('termocupla');
    const condicionAlerta = esTemperatura ? 
      valor > umbrales[sensor] : 
      valor < umbrales[sensor];
    
    setAlerta(condicionAlerta ? `Valor fuera de rango en ${sensor}` : null);
  }, [valor, sensor]);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-[#424150] rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">
            {iconos[sensor] || <Gauge size={28} />}
          </div>
          <h2 className="text-xl font-bold text-white">
            {sensor.replace(/([A-Z])/g, ' $1')}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Valor simulado</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-gray-300">Notificaciones</span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                notificationsEnabled ? 'bg-green-600' : 'bg-gray-600'
              } text-white`}
            >
              <Power size={18} />
              {notificationsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="min-h-[100px] bg-gray-800 rounded-lg p-4">
            {notificationsEnabled ? (
              alerta ? (
                <div className="bg-red-500 text-white p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{alerta}</p>
                    <p className="text-xs opacity-80 mt-1">Valor actual: {valor}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-6">
                  No hay alertas activas
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-6">
                Notificaciones desactivadas
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VistaSensorDetalle;