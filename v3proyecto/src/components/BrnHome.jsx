import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { getDatabase, ref, set } from 'firebase/database';

function BtnHome() {
    const navigate = useNavigate();
    const handleClick = async () => {
        const confirmar = window.confirm("Va a detener el proceso de pirolisis e ir a la pantalla principal, ¿está seguro?");
        
        if (confirmar) {
            try {
                const db = getDatabase();
                await set(ref(db, 'Control/ContP'), 0);
                await set(ref(db, 'Control/Estado1'), 0);

                navigate('/');
            } catch (error) {
                console.error("Error al actualizar Firebase:", error);
            }
        }
    };
    return (
        <button 
            onClick={handleClick} 
            className="bg-gray-300 hover:bg-gray-400 text-black p-2 rounded-full focus:outline-none"
        >
            <FiHome className="text-3xl" />
        </button>
    );
}

export default BtnHome;