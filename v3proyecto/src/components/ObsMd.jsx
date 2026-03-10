import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { getDatabase, ref, onValue, set } from "firebase/database";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ObsMd = () => {
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [horaFinalizacion, setHoraFinalizacion] = useState(null);
  const [mensajeEstado, setMensajeEstado] = useState(null);
  const [idProceso, setIdProceso] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const estadoRef = ref(db, 'Control/Estado1');
    const contPRef = ref(db, 'Control/ContP');
    const idProcesoRef = ref(db, 'Control/idp');

    const checkConditions = (estado, contP) => {
      if (estado === 5 && contP === 4) {
        const horaActual = new Date().toLocaleTimeString();
        setHoraFinalizacion(horaActual);
        setMostrarAdvertencia(true);
        setMensajeEstado(null);
      }
    };

    const unsubscribeEstado = onValue(estadoRef, (snapshot) => {
      const estado = snapshot.val();
      onValue(contPRef, (contPSnapshot) => {
        checkConditions(estado, contPSnapshot.val());
      });
    });

    const unsubscribeIdProceso = onValue(idProcesoRef, (snapshot) => {
      setIdProceso(snapshot.val());
    });

    return () => {
      unsubscribeEstado();
      unsubscribeIdProceso();
    };
  }, []);

  const actualizarProcesoPrincipal = async () => {
    setLoading(true);
    try {
      const db = getDatabase();
      const pesoFinalRef = ref(db, 'Peso/PesoIn');

      let pesoFinal;
      await new Promise((resolve) => {
        onValue(pesoFinalRef, (snapshot) => {
          pesoFinal = snapshot.val();
          resolve();
        }, { onlyOnce: true });
      });

      const horaFin = new Date().toLocaleTimeString();

      await axios.patch(`http://localhost:5000/proceso_principal/${idProceso}`, {
        peso_final: pesoFinal,
        hora_fin: horaFin,
      });

      setMensajeEstado("Proceso actualizado correctamente. Redirigiendo...");
      return true;
    } catch (error) {
      console.error("Error al actualizar en MySQL:", error);
      setMensajeEstado("Error al actualizar en MySQL. Por favor, inténtalo de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const manejarConfirmacion = async () => {
    const success = await actualizarProcesoPrincipal();
    
    if (success) {
      const db = getDatabase();
      try {
        await Promise.all([
          set(ref(db, 'Control/ContP'), 0),
          set(ref(db, 'Control/Estado1'), 0)
        ]);

        setTimeout(() => {
          setMostrarAdvertencia(false);
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error("Error al actualizar Firebase:", error);
        setMensajeEstado("Error al reiniciar controles. Contacte al administrador.");
      }
    }
  };

  return (
    <>
      {mostrarAdvertencia && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="text-yellow-400 mr-2" size={28} />
                <h3 className="text-xl font-semibold text-yellow-400">Proceso de Pirólisis Completado</h3>
              </div>
              
              <div className="w-full bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-gray-300 mb-2">Hora de finalización:</p>
                <p className="text-white font-mono text-lg">{horaFinalizacion}</p>
              </div>

              <button
                onClick={manejarConfirmacion}
                disabled={loading}
                className={`mt-4 px-6 py-2 rounded-full font-medium flex items-center ${
                  loading ? 'bg-purple-800/50 text-purple-300' : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Procesando...
                  </>
                ) : 'Confirmar Finalización'}
              </button>

              {mensajeEstado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 flex items-center text-sm px-4 py-2 rounded-full ${
                    mensajeEstado.includes("Error") ? 
                    'bg-red-900/30 text-red-300' : 
                    'bg-green-900/30 text-green-300'
                  }`}
                >
                  {mensajeEstado.includes("Error") ? (
                    <AlertTriangle className="mr-2" size={16} />
                  ) : (
                    <CheckCircle className="mr-2" size={16} />
                  )}
                  {mensajeEstado}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ObsMd;