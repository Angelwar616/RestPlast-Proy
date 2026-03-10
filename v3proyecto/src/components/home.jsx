import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { firestore } from '../firebase';
import { getDatabase, ref, onValue } from 'firebase/database';
import { LogOut, User, LayoutDashboard, Settings, Users, Save, CheckCircle, ShieldCheck, Factory } from 'lucide-react';
import AlertaOperacion from './Notificacion';

export function Home() {
  const { user, logout, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [operacionEnCurso, setOperacionEnCurso] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const handleProcesoPirolisisClick = () => {
    navigate(operacionEnCurso === 1 ? '/Mostrar/' : '/PesajeRct');
  };

  useEffect(() => {
    const db = getDatabase();
    const operacionRef = ref(db, 'Control/ContP');

    onValue(operacionRef, (snapshot) => {
      setOperacionEnCurso(snapshot.val());
    });

    const fetchUserData = async () => {
      try {
        let userData;
        const roles = ['Administrador', 'Operador', 'Invitado'];
        for (const role of roles) {
          const collectionRef = collection(firestore, role);
          const userQuery = query(collectionRef, where('email', '==', user.email));
          const snapshot = await getDocs(userQuery);
          if (!snapshot.empty) {
            userData = snapshot.docs[0].data();
            setUserData(userData);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user.email]);

  if (loading || loadingData) return <h1 className="text-center text-lg font-semibold">Cargando...</h1>;

  const { rol, nombre, apellido, confirmacion } = userData || {};
  const isAdmin = rol === 'Administrador';
  const isOperator = rol === 'Operador';

  return (
    <div className="flex flex-col h-screen text-white">
      <header className="bg-[#041124] p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">ResPlast</h1>
        <div className="flex gap-4">
          {/* botones anteriores de usuario actual y logout
          <Link to='/Usuario_Actual'>
            <User className="text-white w-6 h-6" />
          </Link>
          <button onClick={handleLogout}>
            <LogOut className="text-white w-6 h-6" />
          </button>*/}
        </div>
      </header>
      <main className="flex-1 p-6">
        <AlertaOperacion />
        <div className="bg-[#152947] shadow-md p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Información de Usuario</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" className="border p-2 rounded w-full" value={nombre || ''} readOnly placeholder="Nombre" />
            <input type="email" className="border p-2 rounded w-full" value={user.email || ''} readOnly placeholder="Correo" />
            <input type="text" className="border p-2 rounded w-full" value={rol || ''} readOnly placeholder="Rol" />
            <input type="text" className="border p-2 rounded w-full" value={confirmacion ? 'Admitido' : 'Pendiente'} readOnly placeholder="Acceso" />
          </div>
        </div>
        {confirmacion ? (
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-[#152947] shadow-md p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Gestión de Cuentas</h3>
              {isAdmin && (
                <>
                  <Link to='/register' className="block py-2 border p-2 rounded  border-[#7b8ea8] items-center gap-2 text-[#d0def2] hover:text-black bg-[#193053] hover:bg-blue-500">
                    <Users /> Registrar Nueva Cuenta
                  </Link>
                  <Link to='/Confirmacion_pendientes' className="block py-2 border p-2 rounded  border-[#7b8ea8] items-center gap-2 text-[#d0def2] hover:text-black bg-[#193053]">
                    <ShieldCheck /> Cuentas por Confirmar
                  </Link>
                  <Link to='/Usuarios_permitidos' >
                    <button className="block py-2  items-center gap-2 text-[#d0def2] hover:text-black">
                      <CheckCircle /> Cuentas Registradas
                    </button>
                    
                  </Link>
                </>
              )}
              {isOperator && (
                <Link to='/RegistrOp' className="block py-2  items-center gap-2 text-gray-700 hover:text-black">
                  <ShieldCheck /> Registrar Nueva Cuenta
                </Link>
              )}
            </div>
            <div className="bg-[#152947] shadow-md p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Control de Procesos</h3>
              <button onClick={handleProcesoPirolisisClick} className="block py-2  items-center gap-2 text-gray-700 hover:text-black w-full">
                <Factory /> Proceso Pirolisis
              </button>
              <Link to='/GrPr' className="block py-2  items-center gap-2 text-gray-700 hover:text-black">
                <Save /> Procesos Guardados
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500 mt-6 font-semibold">Cuenta sin acceso</p>
        )}
      </main>
    </div>
  );
}
