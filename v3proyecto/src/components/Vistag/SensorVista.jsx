import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import {
    Thermometer,
    Flame,
    Waves,
    Droplets,
    Gauge,
    Wind,
    AlertTriangle,
    Zap,
    Wifi
} from "lucide-react";

const iconMap = {
    "Peso_pr": <Gauge size={28} />,
    "gas-MQ4": <Zap size={28} />,
    "gas-MQ5": <Zap size={28} />,
    "hum": <Droplets size={28} />,
    "llama-S1": <Flame size={28} />,
    "llama-S2": <Flame size={28} />,
    "temp": <Thermometer size={28} />,
    "termocupla1": <Waves size={28} />,
    "termocupla2": <Waves size={28} />
};

const labelMap = {
    "Peso_pr": "Sensor de Peso",
    "gas-MQ4": "Gas MQ4",
    "gas-MQ5": "Gas MQ5",
    "hum": "Humedad (DHT11)",
    "llama-S1": "Llama S1",
    "llama-S2": "Llama S2",
    "temp": "Temperatura (DHT11)",
    "termocupla1": "Termocupla 1",
    "termocupla2": "Termocupla 2"
};

const SensorVista = () => {
    const [sensorData, setSensorData] = useState({});

    useEffect(() => {
        const sensorRef = ref(db, "Sensor/");
        const unsubscribe = onValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            setSensorData(data || {});
        });
        return () => unsubscribe();
    }, []);

    const isValid = (value) => value !== null && value !== undefined && !isNaN(value);

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 w-full border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Wifi className="text-blue-400" />
                Conexión con Sensores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {Object.entries(labelMap).map(([key, label]) => {
                    const value = sensorData[key];
                    const valid = isValid(value);
                    return (
                        <motion.div
                            key={key}
                            className={`rounded-xl p-4 border shadow-md bg-gray-900 border-gray-700 flex flex-col items-center text-center space-y-2 w-full max-w-xs ${
                                valid ? "text-green-400" : "text-red-500"
                            }`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="text-3xl">
                                {iconMap[key] || <AlertTriangle />}
                            </div>
                            <div className="text-sm font-semibold text-gray-200">{label}</div>
                            <div className="text-lg font-bold">
                                {valid ? "Funcionando" : "Sin conexión"}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default SensorVista;