import React, { useEffect, useState, useCallback } from 'react';
import { getDatabase, ref, onValue, off } from "firebase/database";

const AlertaSensor = () => {
  const [alertas, setAlertas] = useState([]);

  const verificarAlertas = useCallback((valores) => {
    const nuevasAlertas = [];
    
    if (valores.gasMQ4 !== null && valores.gasMQ4 > 300) {
      nuevasAlertas.push('Fuga de gas detectada en calentamiento');
    }
    if (valores.gasMQ5 !== null && valores.gasMQ5 > 150) {
      nuevasAlertas.push('Fuga de gas detectada en enfriamiento');
    }
    if (valores.llamaS1 !== null && valores.llamaS1 < 400) {
      nuevasAlertas.push('Fuego detectado en calentamiento (llama-S1)');
    }
    if (valores.llamaS2 !== null && valores.llamaS2 < 400) {
      nuevasAlertas.push('Fuego detectado en enfriamiento (llama-S2)');
    }
    if (valores.temp !== null && valores.temp > 38) {
      nuevasAlertas.push('Temperatura de componentes muy alta');
    }
    // Nueva alerta para temperatura > 390°C
    if (valores.temp !== null && valores.termocupla1 > 390) {
      nuevasAlertas.push('Llegando a temperatura máxima, cortando suministro de fuego');
    }

    setAlertas(nuevasAlertas);
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const listeners = [];
    const valores = {
      gasMQ4: null,
      gasMQ5: null,
      llamaS1: null,
      llamaS2: null,
      temp: null,
      termocupla1: null,
    };

    const sensores = {
      gasMQ4: ref(db, 'Sensor/gas-MQ4'),
      gasMQ5: ref(db, 'Sensor/gas-MQ5'),
      llamaS1: ref(db, 'Sensor/llama-S1'),
      llamaS2: ref(db, 'Sensor/llama-S2'),
      temp: ref(db, 'Sensor/temp'),
      termocupla1: ref(db, 'Sensor/termocupla1'),
    };

    Object.entries(sensores).forEach(([nombre, refSensor]) => {
      const listener = onValue(refSensor, (snapshot) => {
        valores[nombre] = snapshot.val();
        verificarAlertas(valores);
      });
      listeners.push({ ref: refSensor, listener });
    });

    return () => {
      listeners.forEach(({ ref, listener }) => {
        off(ref, listener);
      });
    };
  }, [verificarAlertas]);

  return (
    <div className="w-full bg-[#424150] rounded-lg p-4 shadow-md">
      <h3 className="text-white font-semibold mb-3">📊 Alertas del Sistema</h3>
      
      {alertas.length > 0 ? (
        <div className="space-y-2">
          {alertas.map((alerta, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm ${
                alerta.includes('🚨 Llegando a temperatura máxima') 
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white animate-pulse' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {alerta}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#9fd85c] text-white p-3 rounded-lg text-sm">
          Todo en condiciones normales
        </div>
      )}
      
      {alertas.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="text-xs text-gray-300 text-center">
            {alertas.length} alerta(s) activa(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertaSensor;