import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Timer, Clock, Hourglass, History } from 'lucide-react';
import { motion } from 'framer-motion';

const URI = 'http://localhost:5000/proceso_principal';

function Tmuestra() {
    const [procesos, setProcesos] = useState([]);
    const [ultimosProcesos, setUltimosProcesos] = useState([]);
    const [promedioTotal, setPromedioTotal] = useState(0);

    useEffect(() => {
        const obtenerProcesos = async () => {
            try {
                const res = await axios.get(URI);
                const datosConDuracion = res.data.map(proceso => {
                    const inicio = new Date(`1970-01-01T${proceso.hora_inicio}`);
                    const fin = new Date(`1970-01-01T${proceso.hora_fin}`);
                    let duracionMin = (fin - inicio) / 60000;

                    // Ajuste para duración cruzando medianoche
                    if (duracionMin < 0) {
                        duracionMin += 24 * 60;
                    }

                    return {
                        id: proceso.id,
                        fecha: proceso.createdAt,
                        duracion: parseFloat((duracionMin / 60).toFixed(2)) // en horas
                    };
                });

                // Ordenar por ID de forma descendente (los más recientes primero)
                const procesosOrdenados = datosConDuracion.sort((a, b) => b.id - a.id);
                
                // Tomar solo los últimos 3 procesos
                const ultimosTres = procesosOrdenados.slice(0, 3);
                
                // Calcular promedio de todos los procesos
                const promedio = procesosOrdenados.length > 0 
                    ? parseFloat((procesosOrdenados.reduce((acc, curr) => acc + curr.duracion, 0) / procesosOrdenados.length).toFixed(2))
                    : 0;

                setProcesos(procesosOrdenados);
                setUltimosProcesos(ultimosTres);
                setPromedioTotal(promedio);
            } catch (error) {
                console.error('Error al obtener procesos:', error);
            }
        };

        obtenerProcesos();
    }, []);

    if (procesos.length === 0) return (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 w-full border border-gray-700">
            <p className="text-center text-gray-300">Cargando duraciones de procesos...</p>
        </div>
    );

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center justify-center gap-3 mb-4">
                <History className="text-blue-400" size={28} />
                <h2 className="text-xl font-bold text-white">Últimos 3 Procesos</h2>
                <Hourglass className="text-teal-400" size={28} />
            </div>
            
            <p className="text-sm text-gray-300 mb-4 text-center flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                Mostrando los 3 procesos más recientes
            </p>

            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={ultimosProcesos}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
                    >
                        <XAxis
                            type="number"
                            stroke="#9ca3af"
                            label={{
                                value: 'Duración (h)',
                                position: 'insideBottom',
                                dy: 10,
                                fill: '#e5e7eb'
                            }}
                        />
                        <YAxis
                            type="category"
                            dataKey="id"
                            stroke="#9ca3af"
                            label={{
                                value: 'ID Proceso',
                                angle: -90,
                                position: 'insideLeft',
                                dx: -10,
                                fill: '#e5e7eb'
                            }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} horas`, "Duración"]}
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Bar dataKey="duracion" fill="#60a5fa" radius={[0, 4, 4, 0]}>
                            <LabelList
                                dataKey="duracion"
                                position="right"
                                fill="#e5e7eb"
                                formatter={(value) => `${value}h`}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex justify-center items-center space-x-3 bg-gray-700 bg-opacity-50 py-2 px-4 rounded-lg">
                    <Timer className="w-6 h-6 text-blue-400" />
                    <div className="text-center">
                        <span className="text-sm font-medium text-gray-300 block">
                            Promedio total
                        </span>
                        <span className="text-lg font-bold text-white">
                            {promedioTotal} horas
                        </span>
                    </div>
                </div>
                
                <div className="flex justify-center items-center space-x-3 bg-gray-700 bg-opacity-50 py-2 px-4 rounded-lg">
                    <History className="w-6 h-6 text-green-400" />
                    <div className="text-center">
                        <span className="text-sm font-medium text-gray-300 block">
                            Total procesos
                        </span>
                        <span className="text-lg font-bold text-white">
                            {procesos.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-4 text-xs text-gray-400 text-center">
                Mostrando {ultimosProcesos.length} de {procesos.length} procesos totales
            </div>
        </motion.div>
    );
}

export default Tmuestra;