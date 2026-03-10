import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

const URI = 'http://localhost:5000/proceso_principal/';

function GuardarProcesoPrincipal({ onComplete, onError }) {
    const [pesoIn, setPesoIn] = useState(null);
    const [saveStatus, setSaveStatus] = useState('loading'); 
    const [errorMessage, setErrorMessage] = useState('');
    const hasSavedRef = useRef(false); 

    useEffect(() => {
        const pesoRef = ref(db, 'Peso/PesoGr');
        
        const fetchDataAndSave = async (peso) => {
            if (hasSavedRef.current) return;
            
            hasSavedRef.current = true;
            setSaveStatus('loading');

            try {
                const now = new Date();
                const horaActual = now.toTimeString().split(' ')[0];
                const fechaActual = now.toLocaleDateString('en-CA');

                await axios.post(URI, {
                    peso_inicio: peso,
                    hora_inicio: horaActual,
                    createdAt: fechaActual,
                    updatedAt: fechaActual,
                });

                setSaveStatus('success');
            } catch (error) {
                console.error('Error al guardar:', error);
                setErrorMessage('Error al guardar los datos');
                setSaveStatus('error');
                onError();
            }
        };

        const listener = onValue(pesoRef, (snapshot) => {
            const value = snapshot.val();
            setPesoIn(value);
            
            if (value !== null && !hasSavedRef.current) {
                fetchDataAndSave(value);
            }
        });

        return () => {
            off(pesoRef);
        };
    }, [onComplete, onError]);

    const handleAccept = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <motion.div 
                className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="mb-4">
                            {saveStatus === 'success' ? (
                                <CheckCircle className="text-green-400" size={48} />
                            ) : saveStatus === 'error' ? (
                                <AlertCircle className="text-red-400" size={48} />
                            ) : (
                                <div className="h-12 w-12 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-100 text-center">
                            {saveStatus === 'success' 
                                ? '¡Guardado correctamente!' 
                                : saveStatus === 'error' 
                                ? 'Error al guardar' 
                                : 'Guardando datos...'}
                        </h3>
                        
                        {saveStatus === 'error' && (
                            <p className="text-red-400 text-sm mt-2 text-center">{errorMessage}</p>
                        )}
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Peso registrado:</span>
                                <span className="font-medium">{pesoIn || '---'}</span>
                            </div>
                        </div>
                    </div>

                    {saveStatus === 'success' && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Aceptar
                            </button>
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={onError}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default GuardarProcesoPrincipal;