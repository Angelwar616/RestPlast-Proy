import { useEffect, useState } from 'react';
import axios from 'axios';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase'; 

const URI_SECUNDARIO = 'http://localhost:5000/proceso_secundario/';
const INTERVALO_TIEMPO = 5 * 60; 

function GuardarProcesoSecundario() {
    const [lecturas, setLecturas] = useState({});
    const [ultimoId, setUltimoId] = useState(null); 
    const [tiempoRestante, setTiempoRestante] = useState(INTERVALO_TIEMPO);
    const [procesoActivo, setProcesoActivo] = useState(false); 

    useEffect(() => {
        const idRef = ref(db, 'Control/idp');
        const listener = onValue(idRef, (snapshot) => {
            setUltimoId(snapshot.val());
        });

        return () => {
            off(idRef);
        };
    }, []);

    useEffect(() => {
        const contPRef = ref(db, 'Control/ContP');
        const listener = onValue(contPRef, (snapshot) => {
            const valor = snapshot.val();
            if (valor === 1) {
                setProcesoActivo(true); 
            } else {
                setProcesoActivo(false); 
                console.log('Proceso inactivo');
            }
        });

        return () => {
            off(contPRef);
        };
    }, []);

    useEffect(() => {
        const rutasSensores = {
            gas1: 'Sensor/gas-MQ4',
            gas2: 'Sensor/gas-MQ5',
            hum: 'Sensor/hum',
            llama1: 'Sensor/llama-S1',
            llama2: 'Sensor/llama-S2',
            temp: 'Sensor/temp',
            termocupla1: 'Sensor/termocupla1',
            termocupla2: 'Sensor/termocupla2',
            Peso_pr: 'Sensor/Peso_pr',
        };

        const listeners = Object.entries(rutasSensores).map(([campo, ruta]) => {
            const refRuta = ref(db, ruta);
            return onValue(refRuta, (snapshot) => {
                setLecturas((prevLecturas) => ({
                    ...prevLecturas,
                    [campo]: snapshot.val(),
                }));
            });
        });

        return () => {
            // Cleanup de listeners
            listeners.forEach((offListener) => offListener());
        };
    }, []);

    useEffect(() => {
        const contadorRegresivo = setInterval(() => {
            setTiempoRestante((prev) => prev - 1);
        }, 1000);

        if (tiempoRestante <= 0 && procesoActivo) {
            guardarDatos();
            setTiempoRestante(INTERVALO_TIEMPO); 
        }

        return () => clearInterval(contadorRegresivo);
    }, [tiempoRestante, procesoActivo]);

    const guardarDatos = async () => {
        const now = new Date();
        const fechaActual = now.toISOString().split('T')[0]; 

        try {
            if (ultimoId !== null) {
                await axios.post(URI_SECUNDARIO, {
                    id: ultimoId,
                    gas1: lecturas.gas1 || 0,
                    gas2: lecturas.gas2 || 0,
                    hum: lecturas.hum || 0,
                    llama1: lecturas.llama1 || 0,
                    llama2: lecturas.llama2 || 0,
                    temp: lecturas.temp || 0,
                    termocupla1: lecturas.termocupla1 || 0,
                    termocupla2: lecturas.termocupla2 || 0,
                    Peso_pr: lecturas.Peso_pr || 0,
                    createdAt: fechaActual,
                    updatedAt: fechaActual,
                });

                console.log(`Datos guardados exitosamente en proceso_secundario para ID: ${ultimoId}`);
            } else {
                console.warn('No se ha definido un ID en Control/idp de Firebase.');
            }
        } catch (error) {
            console.error('Error al guardar los datos en proceso_secundario: ', error);
        }
    };

    return null;
}

export default GuardarProcesoSecundario;