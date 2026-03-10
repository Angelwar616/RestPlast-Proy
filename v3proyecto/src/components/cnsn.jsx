import { useEffect } from 'react';
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";

const ESP32ConnectionManager = () => {
    useEffect(() => {
        const connectionRef = ref(db, 'Control/Conn');
        let activityTimeout;

        // Rutas de sensores a monitorear
        const sensorPaths = [
            'Sensor/Temperatura',
            'Sensor/Humedad',
            'Sensor/Presion', 
            'Sensor/Peso',
            'Procesos/ultimo',
            'Control/Comandos'
        ];

        const updateConnectionStatus = async (isOnline) => {
            try {
                await set(connectionRef, isOnline); // Ya es boolean (true/false)
                console.log(`ESP32 status: ${isOnline}`);
            } catch (error) {
                console.error('Error updating status:', error);
            }
        };

        const handleSensorActivity = () => {
            // Cuando hay actividad, marcar como true
            updateConnectionStatus(true);
            
            // Resetear el timeout
            clearTimeout(activityTimeout);
            
            // Si pasa 15 segundos sin actividad, marcar como false
            activityTimeout = setTimeout(() => {
                updateConnectionStatus(false);
            }, 15000); // 15 segundos
        };

        // Configurar listeners para cada sensor
        const unsubscribeFunctions = sensorPaths.map(path => {
            const sensorRef = ref(db, path);
            return onValue(sensorRef, (snapshot) => {
                if (snapshot.exists() && snapshot.val() !== null) {
                    console.log(`Activity detected: ${path}`);
                    handleSensorActivity();
                }
            });
        });

        // Inicializar como false
        updateConnectionStatus(false);

        // Cleanup
        return () => {
            unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
            clearTimeout(activityTimeout);
        };
    }, []);

    return null;
};

export default ESP32ConnectionManager;