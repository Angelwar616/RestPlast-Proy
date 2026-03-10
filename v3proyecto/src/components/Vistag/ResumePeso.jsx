import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Scale, Weight, Gauge, Zap, AlertTriangle } from 'lucide-react';

const URI = 'http://localhost:5000/api/datos';

function ResumenUltimoProceso() {
    const [proceso, setProceso] = useState(null);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const res = await axios.get(URI);
                const procesosOrdenados = res.data
                    .filter(p => p.peso_inicio !== null && p.peso_final !== null)
                    .sort((a, b) => b.id - a.id);
                const ultimoCompleto = procesosOrdenados[0];
                setProceso(ultimoCompleto);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        obtenerDatos();
    }, []);

    if (!proceso) return <p className="text-center text-gray-300">Cargando datos del último proceso...</p>;

    const diferencia = proceso.peso_inicio - proceso.peso_final;
    const porcentaje = ((diferencia / proceso.peso_inicio) * 100).toFixed(2);

    const data = [
        {
            name: 'Peso Inicial',
            valor: proceso.peso_inicio,
            fill: '#60a5fa', // azul más claro
        },
        {
            name: 'Peso Final',
            valor: proceso.peso_final,
            fill: '#2dd4bf', // turquesa más claro
        },
    ];

    return (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 w-full max-w-2xl text-center mx-auto border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center justify-center gap-2">
                <Gauge className="text-blue-400" />
                Resumen del Último Proceso
            </h2>
            <div className="my-4" /> 
            <div className="w-full h-52" py-4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                    >
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Bar dataKey="valor">
                            <LabelList dataKey="valor" position="right" fill="#e5e7eb" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Peso Inicial: {proceso.peso_inicio} kg</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Weight className="w-5 h-5 text-teal-400" />
                    <span className="text-sm font-medium text-gray-300">Peso Final: {proceso.peso_final} kg</span>
                </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">
                Diferencia: {diferencia.toFixed(2)} kg ({porcentaje}%)
            </p>
        </div>
    );
}

export default ResumenUltimoProceso;