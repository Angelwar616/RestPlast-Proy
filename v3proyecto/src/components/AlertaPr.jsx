import React, { useEffect, useState } from 'react';

const AlertaSensorIndividual = ({ sensorKey, sensorValue }) => {
  const [alertas, setAlertas] = useState([]);

  const reglasAlertas = {
    'gas-MQ4': {
      condicion: (v) => v > 500,
      mensaje: 'Fuga de gas detectada en el contenedor de calentamiento (gas-MQ4).'
    },
    'gas-MQ5': {
      condicion: (v) => v > 600,
      mensaje: 'Fuga de gas detectada en el contenedor de enfriamiento (gas-MQ5).'
    },
    'llama-S1': {
      condicion: (v) => v < 400,
      mensaje: 'Fuego detectado en el contenedor de calentamiento (llama-S1).'
    },
    'llama-S2': {
      condicion: (v) => v < 400,
      mensaje: 'Fuego detectado en el contenedor de enfriamiento (llama-S2).'
    },
    'temp': {
      condicion: (v) => v > 38,
      mensaje: 'Temperatura de componentes electrónicos muy alta.'
    }
  };

  useEffect(() => {
    if (sensorKey === 'Peso_pr') {
      setAlertas([]); 
      return;
    }

    const regla = reglasAlertas[sensorKey];
    if (!regla || sensorValue === null || sensorValue < 0) {
      setAlertas([]);
      return;
    }

    if (regla.condicion(sensorValue)) {
      setAlertas([regla.mensaje]);
    } else {
      setAlertas([]);
    }
  }, [sensorKey, sensorValue]);

  return (
    <div className="w-full bg-[#424150] rounded-lg p-4 shadow-md flex flex-col space-y-2 max-h-40 overflow-y-auto">
      {alertas.length > 0 ? (
        alertas.map((alerta, index) => (
          <div
            key={index}
            className="bg-red-500 text-white p-3 rounded-lg shadow-lg text-sm animate-fade-in"
          >
            {alerta}
          </div>
        ))
      ) : (
        <div className="bg-[#9fd85c] text-white p-3 rounded-lg shadow-lg text-sm">
          Todo está en condiciones normales.
        </div>
      )}
    </div>
  );
};

export default AlertaSensorIndividual;
