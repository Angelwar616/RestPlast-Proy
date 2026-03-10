import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { getDatabase, ref, set, onValue } from 'firebase/database';

const Tiempo = () => {
  const LIMITE_TIEMPO = 4000 * 60 * 60 ; 
  const [tiempoRestante, setTiempoRestante] = useState(LIMITE_TIEMPO);
  const [procesoIniciado, setProcesoIniciado] = useState(false);
  const [tiempoIniciado, setTiempoIniciado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [procesoTerminado, setProcesoTerminado] = useState(false);
  const isTabActiveRef = useRef(true);
  const lastUpdateRef = useRef(Date.now());

  const progress = ((LIMITE_TIEMPO - tiempoRestante) / LIMITE_TIEMPO) * 100;

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (!document.hidden) {
        updateTimeAfterBackground();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const updateTimeAfterBackground = () => {
    if (procesoTerminado || !procesoIniciado) return;
    
    const now = Date.now();
    const elapsedMilliseconds = now - lastUpdateRef.current;
    
    if (elapsedMilliseconds > 0) {
      setTiempoRestante(prev => {
        const newTime = Math.max(prev - elapsedMilliseconds, 0);
        if (newTime === 0) {
          handleProcessCompletion();
        }
        return newTime;
      });
      lastUpdateRef.current = now;
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const tiempoRef = ref(db, 'Tiempo/inicio');
    const operacionRef = ref(db, 'Control/ContP');
    const estadoRef = ref(db, 'Control/Estado1');

    const unsubscribeOperacion = onValue(operacionRef, (snapshot) => {
      const estadoOperacion = snapshot.val();
      const nuevoEstado = estadoOperacion === 1;
      
      setProcesoIniciado(nuevoEstado);
      setLoading(false);

      if (nuevoEstado) {
        reiniciarContador();
      } else {
        setProcesoTerminado(false);
      }
    });

    const reiniciarContador = () => {
      const tiempoActual = Date.now();
      set(tiempoRef, tiempoActual)
        .then(() => {
          setTiempoRestante(LIMITE_TIEMPO);
          setTiempoIniciado(true);
          setProcesoTerminado(false);
          lastUpdateRef.current = tiempoActual;
        })
        .catch(error => console.error('Error al reiniciar contador:', error));
    };

    if (procesoIniciado && !procesoTerminado) {
      onValue(tiempoRef, (snapshot) => {
        const tiempoGuardado = snapshot.val();
        if (tiempoGuardado) {
          const tiempoPasado = Date.now() - tiempoGuardado;
          if (tiempoPasado < LIMITE_TIEMPO) {
            setTiempoRestante(LIMITE_TIEMPO - tiempoPasado);
            setTiempoIniciado(true);
          } else {
            handleProcessCompletion();
          }
        }
      });
    }

    return () => {
      unsubscribeOperacion();
    };
  }, [procesoIniciado, tiempoIniciado, procesoTerminado]);

  useEffect(() => {
    if (!procesoIniciado || procesoTerminado) return;

    const timer = setInterval(() => {
      if (isTabActiveRef.current) {
        setTiempoRestante(prev => {
          const newTime = prev > 0 ? prev - 1000 : 0;
          if (newTime === 0) {
            handleProcessCompletion();
          }
          return newTime;
        });
        lastUpdateRef.current = Date.now();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [procesoIniciado, procesoTerminado]);

  const handleProcessCompletion = () => {
    const db = getDatabase();
    Promise.all([
      set(ref(db, 'Control/ContP'), 4),
      set(ref(db, 'Control/Estado1'), 5)
    ])
    .then(() => {
      setProcesoTerminado(true);
      setProcesoIniciado(false);
    })
    .catch(error => console.error('Error al actualizar Firebase:', error));
  };

  const formatearTiempo = (milisegundos) => {
    const totalSeconds = Math.floor(milisegundos / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  if (loading) {
    return (
      <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl text-center">
        <p className="text-gray-400">Cargando estado del proceso...</p>
      </div>
    );
  }

  if (procesoTerminado) {
    return (
      <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Clock className="text-red-400" size={28} />
          <h3 className="text-xl font-semibold text-red-400">Proceso Terminado</h3>
        </div>
        <p className="text-gray-400 text-sm">
          El proceso ha finalizado correctamente después de 4 horas
        </p>
        <div className="mt-4 bg-gray-700 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  if (!procesoIniciado) {
    return (
      <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Clock className="text-gray-500" size={28} />
          <h3 className="text-xl font-semibold text-gray-400">Proceso Inactivo</h3>
        </div>
        <p className="text-gray-500 text-sm">
          El contador se activara cuando empiece el proceso
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Clock className="text-purple-400" size={28} />
          <h3 className="text-xl font-semibold text-gray-100">Tiempo de Proceso (4h)</h3>
        </div>
        <div className={`font-mono text-2xl font-bold ${tiempoRestante <= 5 * 60 * 1000 ? 'text-red-400' : 'text-purple-300'}`}>
          {formatearTiempo(tiempoRestante)}
        </div>
      </div>

      <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
        />
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>Inicio</span>
        <span>{progress.toFixed(0)}% completado</span>
        <span>Final</span>
      </div>

      <div className="mt-4 flex justify-center">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          tiempoRestante <= 0 ? 'bg-red-900/50 text-red-300' : 
          tiempoRestante <= 5 * 60 * 1000 ? 'bg-yellow-900/50 text-yellow-300' : 
          'bg-green-900/50 text-green-300'
        }`}>
          {tiempoRestante <= 0 ? 'Finalizando...' : 
           tiempoRestante <= 5 * 60 * 1000 ? 'Finalizando (últimos 5m)...' : 'En progreso'}
        </span>
      </div>
    </motion.div>
  );
};

export default Tiempo;