import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { useState } from 'react';
import axios from 'axios';

function BtnHome() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const actualizarProcesoPrincipal = async (idProceso) => {
        try {
            const db = getDatabase();
            
            // CAMBIADO: Obtener el peso final de Sensor/Peso_pr en lugar de Peso/PesoIn
            const pesoFinalRef = ref(db, 'Sensor/Peso_pr');

            // Obtener el peso final
            let pesoFinal;
            await new Promise((resolve) => {
                onValue(pesoFinalRef, (snapshot) => {
                    pesoFinal = snapshot.val();
                    resolve();
                }, { onlyOnce: true });
            });

            console.log('Peso final obtenido:', pesoFinal);

            // OBTENER LA HORA DESPUÉS DE OBTENER EL PESO, JUSTO ANTES DE ENVIAR
            const ahora = new Date();
            const horaFin = ahora.getHours().toString().padStart(2, '0') + ':' + 
                           ahora.getMinutes().toString().padStart(2, '0');

            console.log('Hora de finalización capturada:', horaFin);

            // Actualizar proceso_principal en MySQL
            await axios.patch(`http://localhost:5000/proceso_principal/${idProceso}`, {
                peso_final: pesoFinal,
                hora_fin: horaFin,
                estado: 'interrumpido'
            });

            console.log('Proceso principal actualizado en MySQL');
            return true;
        } catch (error) {
            console.error("Error al actualizar en MySQL:", error);
            return false;
        }
    };

    const limpiarPesosFirebase = async () => {
        try {
            const db = getDatabase();
            
            // Limpiar todas las rutas de peso en Firebase
            await Promise.all([
                set(ref(db, 'Peso/PesoGr'), 0),
                set(ref(db, 'Peso/PesoIn'), 0),
                set(ref(db, 'Sensor/Peso_pr'), 0)
            ]);
            
            console.log("Pesos limpiados en Firebase correctamente");
            return true;
        } catch (error) {
            console.error("Error al limpiar pesos en Firebase:", error);
            return false;
        }
    };

    const handleClick = async () => {
        const confirmar = window.confirm("Va a detener el proceso de pirolisis e ir a la pantalla principal, ¿está seguro?");
        
        if (confirmar) {
            setLoading(true);
            const horaInicio = new Date(); // Para debug
            console.log('Inicio del proceso de detención:', horaInicio.toLocaleTimeString());
            
            try {
                const db = getDatabase();
                
                // Obtener el ID del proceso actual
                const idProcesoRef = ref(db, 'Control/idp');
                let idProceso;
                
                await new Promise((resolve) => {
                    onValue(idProcesoRef, (snapshot) => {
                        idProceso = snapshot.val();
                        resolve();
                    }, { onlyOnce: true });
                });

                console.log('ID del proceso obtenido:', idProceso);

                // Si hay un proceso activo, actualizar MySQL
                if (idProceso) {
                    const success = await actualizarProcesoPrincipal(idProceso);
                    if (!success) {
                        alert("Error al guardar los datos del proceso. Contacte al administrador.");
                        setLoading(false);
                        return;
                    }
                } else {
                    console.log('No hay proceso activo para actualizar');
                }

                // Limpiar pesos en Firebase
                const pesosLimpios = await limpiarPesosFirebase();
                if (!pesosLimpios) {
                    console.warn("No se pudieron limpiar algunos pesos en Firebase, pero se continuará con el proceso");
                }

                // Reiniciar controles en Firebase
                await Promise.all([
                    set(ref(db, 'Control/ContP'), 0),
                    set(ref(db, 'Control/Estado1'), 0)
                ]);

                const horaFin = new Date(); // Para debug
                console.log('Fin del proceso de detención:', horaFin.toLocaleTimeString());
                console.log('Tiempo total transcurrido:', (horaFin - horaInicio) / 1000, 'segundos');

                console.log('Proceso detenido correctamente');
                navigate('/');
            } catch (error) {
                console.error("Error al actualizar Firebase:", error);
                alert("Error al detener el proceso. Contacte al administrador.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={loading}
            className={`bg-[#3d445d] hover:bg-[#66729b] text-[#cdd6f5] p-2 rounded-full focus:outline-none transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={loading ? "Deteniendo proceso..." : "Ir al inicio y detener proceso"}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : (
                <FiHome className="text-3xl" />
            )}
        </button>
    );
}

export default BtnHome;