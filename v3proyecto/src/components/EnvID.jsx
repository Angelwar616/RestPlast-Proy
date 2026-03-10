import { useEffect } from 'react';
import axios from 'axios';
import { getDatabase, ref, set } from 'firebase/database';

const URI = 'http://localhost:5000/api/datos';

function EnvID() {
    useEffect(() => {
        const obtenerUltimoID = async () => {
            try {
                const respuesta = await axios.get(URI);
                const id = respuesta.data[0].id; 

                enviarIDaFirebase(id);
            } catch (error) {
                console.error('Error al recuperar el último ID:', error);
            }
        };

        obtenerUltimoID();
    }, []);

    const enviarIDaFirebase = async (id) => {
        try {
            const db = getDatabase(); 
            await set(ref(db, 'Control/idp'), id);
            console.log('ID enviado a Firebase:', id);
        } catch (error) {
            console.error('Error al enviar ID a Firebase:', error);
        }
    };

    return null;
}
export default EnvID;