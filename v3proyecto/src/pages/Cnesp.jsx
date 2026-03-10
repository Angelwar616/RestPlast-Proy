import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase"; 
import { ref, onValue, set } from "firebase/database";
import { CheckCircle, Play, Cog, Fan, Save, Eye, ShieldAlert, TriangleAlert, Signal, Unplug } from "lucide-react";
import { Link } from 'react-router-dom';

const ControlPanel = () => {
    const [isConnected, setIsConnected] = useState(false);

    // Efecto para inicializar el estado como false al entrar
    useEffect(() => {
        const initializeConnection = async () => {
            try {
                await set(ref(db, 'Control/Conn'), false);
                console.log('Estado de conexión inicializado: false');
            } catch (error) {
                console.error('Error inicializando estado:', error);
            }
        };

        initializeConnection();
    }, []);

    // Efecto para escuchar cambios en el estado de conexión
    useEffect(() => {
        const connRef = ref(db, "Control/Conn");
        const unsubscribe = onValue(connRef, (snapshot) => {
            const value = snapshot.val();
            setIsConnected(!!value); 
            console.log('Estado de conexión actualizado:', value);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className='space-y-8 pl-26'>
            <div className='space-y-4'>
                <h2 className='text-xl font-bold text-gray-100'>Proceso vista</h2>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                        <TriangleAlert className='text-green-400' size={24} />
                        <span className='text-gray-100 font-medium'>Conexión con dispositivo</span>
                    </div>
                    <div className='flex items-center space-x-3'>
                        <span className='text-gray-100 font-medium'>{isConnected ? "Establecida" : "Desconectada"}</span>
                        {isConnected ? (
                            <Signal className='text-green-400' size={24} />
                        ) : (
                            <Unplug className='text-red-500' size={24} />
                        )}
                    </div>
                </div>
                <motion.div
                    className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-12 w-[700px] h-[250px] border border-gray-700'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className='flex flex-col space-y-6'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                                <ShieldAlert className='text-green-400' size={24} />
                                <span className='text-gray-100 font-medium'>Proceso de pirolisis</span>
                            </div>
                            <Link to={'/PesajeRct'}>
                                <button 
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${isConnected ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`} 
                                    disabled={!isConnected}
                                >
                                    <Play size={20} />
                                    <span>Empezar proceso</span>
                                </button>
                            </Link>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                                <Save className='text-green-400' size={24} />
                                <span className='text-gray-100 font-medium'>Procesos guardados</span>
                            </div>
                            <Link to={'/GrPr'}>
                                <button 
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${isConnected ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`} 
                                    disabled={!isConnected}>
                                    <Eye size={20} />
                                    <span>Ver guardados</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className='space-y-4'>
                <h2 className='text-xl font-bold text-gray-100'>Pruebas de mantenimiento</h2>
                <motion.div
                    className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-12 w-[700px] h-[270px] border border-gray-700'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className='flex flex-col space-y-6'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                                <Cog className='text-[#606977]' size={24} />
                                <span className='text-gray-100 font-medium'>Prueba de sensores</span>
                            </div>
                            <Link to={'/SensorPrb'}>
                            <button 
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${isConnected ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`} 
                                disabled={!isConnected}
                            >
                                <Play size={20} />
                                <span>Realizar pruebas</span>
                            </button>
                            </Link>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                                <Fan className='text-[#606977]' size={24} />
                                <span className='text-gray-100 font-medium'>Prueba de ventilación</span>
                            </div>
                            <Link to={'/Ventest'}>
                            <button 
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold ${isConnected ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`} 
                                disabled={!isConnected}
                            >
                                <Play size={20} />
                                <span>Realizar pruebas</span>
                            </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ControlPanel;