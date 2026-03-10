import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { onValue, ref, off, set } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, XCircle, Clock, Scale, Lock } from 'lucide-react';
import GuardarProcesoPrincipal from './GrdProcPrin';

function PesajeRct() {
    const [pesoIn, setPesoIn] = useState('');
    const [pesoGr, setPesoGr] = useState('');
    const [horaIn, setHoraIn] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [hasSetPesoGr, setHasSetPesoGr] = useState(false);
    const [error, setError] = useState(null);
    const [showGuardarProceso, setShowGuardarProceso] = useState(false);
    const [guardadoExitoso, setGuardadoExitoso] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [frozenPesoValue, setFrozenPesoValue] = useState('');

    const navigate = useNavigate();

    // Función para congelar el peso actual
    const freezeCurrentPeso = useCallback(() => {
        if (pesoIn && !hasSetPesoGr && !isProcessing) {
            setIsProcessing(true);
            const pesoGrRef = ref(db, 'Peso/PesoGr');
            
            set(pesoGrRef, pesoIn)
                .then(() => {
                    setPesoGr(pesoIn);
                    setFrozenPesoValue(pesoIn);
                    setHasSetPesoGr(true);
                    console.log('Peso congelado:', pesoIn);
                    setIsProcessing(false);
                })
                .catch((error) => {
                    console.error('Error al congelar el peso:', error);
                    setError('Error al congelar el peso');
                    setIsProcessing(false);
                });
        }
    }, [pesoIn, hasSetPesoGr, isProcessing]);

    // Función para descongelar el peso
    const unfreezePeso = useCallback(() => {
        if (hasSetPesoGr) {
            setIsProcessing(true);
            const pesoGrRef = ref(db, 'Peso/PesoGr');
            
            set(pesoGrRef, '')
                .then(() => {
                    setPesoGr('');
                    setFrozenPesoValue('');
                    setHasSetPesoGr(false);
                    console.log('Peso descongelado');
                    setIsProcessing(false);
                })
                .catch((error) => {
                    console.error('Error al descongelar el peso:', error);
                    setError('Error al descongelar el peso');
                    setIsProcessing(false);
                });
        }
    }, [hasSetPesoGr]);

    // Escuchar cambios en Firebase
    useEffect(() => {
        // Cambiado de 'Peso/PesoIn' a 'Sensor/Peso_pr'
        const pesoInRef = ref(db, 'Sensor/Peso_pr');
        const pesoGrRef = ref(db, 'Peso/PesoGr');

        const pesoInListener = onValue(pesoInRef, (snapshot) => {
            const value = snapshot.val();
            console.log('Peso (Sensor/Peso_pr) actualizado:', value);
            setPesoIn(value);
            
            // Si está congelado y el peso inicial cambia, no hacemos nada
            // El peso congelado se mantiene en PesoGr
        });

        const pesoGrListener = onValue(pesoGrRef, (snapshot) => {
            const value = snapshot.val();
            console.log('PesoGr actualizado:', value);
            setPesoGr(value);
            if (value) {
                setFrozenPesoValue(value);
            }
        });

        const interval = setInterval(() => {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString();
            setHoraIn(formattedTime);
        }, 1000);

        return () => {
            off(pesoInRef);
            off(pesoGrRef);
            clearInterval(interval);
        };
    }, []);

    // Manejar cambio del switch de congelar
    const handleSwitchChange = () => {
        if (isProcessing) return;
        
        if (!isFrozen) {
            // Congelar
            if (!pesoIn) {
                setError('No hay peso inicial para congelar');
                return;
            }
            freezeCurrentPeso();
            setIsFrozen(true);
        } else {
            // Descongelar
            unfreezePeso();
            setIsFrozen(false);
        }
    };

    const handleStartProcess = () => {
        if (!pesoGr || !isFrozen || isProcessing) {
            setError('Debe congelar el peso primero');
            return;
        }
        setShowConfirmation(true);
        set(ref(db, 'Control/Estado1'), 1).catch(console.error);
    };

    const handleConfirm = () => {
        setShowConfirmation(false);
        setShowGuardarProceso(true);
        setIsProcessing(true);
        
        // Iniciar el proceso en Firebase
        set(ref(db, 'Control/Estado1'), 3)
            .then(() => set(ref(db, 'Control/ContP'), 1))
            .then(() => {
                console.log('Proceso iniciado correctamente');
            })
            .catch((error) => {
                console.error('Error al actualizar Firebase:', error);
                setError('Error al iniciar el proceso');
                setShowGuardarProceso(false);
                setIsProcessing(false);
            });
    };

    const handleReject = () => {
        setShowConfirmation(false);
        set(ref(db, 'Control/Estado1'), 2)
            .catch((error) => {
                console.error('Error al rechazar el proceso:', error);
                setError('Error al rechazar el proceso');
            });
    };

    const handleGuardadoCompleto = () => {
        setGuardadoExitoso(true);
        setIsProcessing(false);
        
        // Limpiar los pesos después de guardar
        const clearPesos = async () => {
            try {
                await set(ref(db, 'Sensor/Peso_pr'), ''); // Cambiado a Sensor/Peso_pr
                await set(ref(db, 'Peso/PesoGr'), '');
                console.log('Pesos limpiados después del guardado');
            } catch (error) {
                console.error('Error al limpiar pesos:', error);
            }
        };
        
        clearPesos();
        
        setTimeout(() => navigate('/Mostrar'), 1000);
    };

    const handleErrorGuardado = () => {
        setShowGuardarProceso(false);
        setIsProcessing(false);
        setError('Error al guardar los datos del proceso');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4">
            <motion.div
                className="w-full max-w-4xl bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center text-gray-400 hover:text-gray-300"
                        >
                            <ArrowLeft className="mr-2" size={20} />
                            Volver
                        </button>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
                            Registro de Peso
                        </h2>
                    </div>

                    {error && (
                        <div className="flex items-center bg-red-900/30 text-red-400 p-3 rounded-lg mb-6">
                            <AlertCircle className="mr-2" size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-gray-700 bg-opacity-30 rounded-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <Scale className="text-blue-400" size={24} />
                                <span className="text-lg font-medium text-gray-200">Congelar Pesaje</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFrozen}
                                    onChange={handleSwitchChange}
                                    disabled={isProcessing || !pesoIn}
                                    className="sr-only peer"
                                />
                                <div className={`w-14 h-7 ${(isProcessing || !pesoIn) ? 'bg-gray-600' : 'bg-gray-600 peer-focus:outline-none'} rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${(isProcessing || !pesoIn) ? '' : 'peer-checked:bg-blue-500'}`}></div>
                                <span className="ml-3 text-sm font-medium text-gray-300">
                                    {isProcessing ? 'Procesando...' : 
                                     !pesoIn ? 'Esperando peso...' :
                                     isFrozen ? 'Congelado' : 'No congelado'}
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Scale className="text-green-400" size={20} />
                                    <h3 className="text-lg font-medium text-gray-200">
                                        {isFrozen ? 'Peso Congelado' : 'Peso Inicial'}
                                    </h3>
                                </div>
                                <div className="text-3xl font-bold text-center py-4 bg-gray-600 rounded-lg">
                                    {isFrozen ? frozenPesoValue || pesoGr : pesoIn || '---'}
                                    <span className="text-lg ml-2">kg</span>
                                </div>
                                <div className="text-sm text-gray-400 text-center mt-2">
                                    {isFrozen ? 'Valor congelado' : 'Valor en tiempo real'}
                                </div>
                            </div>

                            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Clock className="text-purple-400" size={20} />
                                    <h3 className="text-lg font-medium text-gray-200">Hora Inicial</h3>
                                </div>
                                <div className="text-3xl font-bold text-center py-4 bg-gray-600 rounded-lg">
                                    {horaIn || '--:--:--'}
                                </div>
                            </div>
                        </div>

                        {/* Información de estado */}
                        <div className="mt-4 text-sm text-gray-400">
                            <p>• Peso Inicial (Sensor/Peso_pr): {pesoIn || 'No disponible'}</p> {/* Cambiado */}
                            <p>• Peso Congelado (PesoGr): {pesoGr || 'No congelado'}</p>
                            <p>• Estado: {isFrozen ? 'Congelado' : 'En tiempo real'}</p>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleStartProcess}
                            disabled={!isFrozen || !pesoGr || showGuardarProceso || isProcessing}
                            className={`flex items-center justify-center gap-2 ${
                                isFrozen && pesoGr && !showGuardarProceso && !isProcessing
                                    ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                                    : "bg-gray-600 cursor-not-allowed"
                            } text-white py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-green-500/20 font-medium`}
                        >
                            {showGuardarProceso || isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Iniciar Proceso
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            disabled={showGuardarProceso || isProcessing}
                            className={`flex items-center justify-center gap-2 ${
                                showGuardarProceso || isProcessing
                                    ? "bg-gray-600 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                            } text-white py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-red-500/20 font-medium`}
                        >
                            <XCircle size={18} />
                            Cancelar
                        </button>
                    </div>
                </div>

                {showConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                        <motion.div
                            className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-full max-w-md"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <div className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Lock className="text-yellow-400" size={24} />
                                    <h3 className="text-xl font-bold text-gray-100">Confirmar Pesaje</h3>
                                </div>
                                <p className="text-gray-300 mb-6">
                                    ¿Está seguro que el peso <span className="font-bold text-white">{pesoGr}</span> kg es correcto?
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center"
                                    >
                                        <XCircle className="mr-2" size={16} />
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                                    >
                                        <CheckCircle className="mr-2" size={16} />
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showGuardarProceso && (
                    <GuardarProcesoPrincipal 
                        onComplete={handleGuardadoCompleto}
                        onError={handleErrorGuardado}
                    />
                )}
            </motion.div>
        </div>
    );
}

export default PesajeRct;