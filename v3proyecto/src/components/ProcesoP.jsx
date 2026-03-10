import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Power, Home, User, AlertCircle, Clock, Thermometer, Droplet, Flame, Scale } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { getDatabase, onValue, ref, set } from 'firebase/database';
import { app } from '../firebase';
import { firestore, db } from '../firebase';
import AlertaOperacion from './Notificacion';
import Tiempo from './Tiempo';
import AlertasSensor from './AlertaSensor';
import GuardarProcesoSecundario from './GrdProcSec';
import EnvID from './EnvID';
import BtnHome from './BtnHome';
import ObsMd from './ObsMd';
import SensoresGauges from './Gauges';
import ControlVentiladoresAutomatico from './Ventautm';

function Mostrar() {
  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(10);
  const [gas, setGas] = useState(30);
  const [gas1, setGas1] = useState(30);
  const [flame, setFlame] = useState(30);
  const [flame1, setFlame1] = useState(30);
  const [termo1, setTermo1] = useState(26);
  const [termo2, setTermo2] = useState(26);
  const [peso, setPeso] = useState(0); 
  const [alertags, setAlertags] = useState('');
  const [alertallm, setAlertallm] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [startTime] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState(4 * 60 * 60);
  const [firebaseId, setFirebaseId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const sensorLlamaRef = ref(db, 'Alertas/Sensor-Flama');
    const sensorGasRef = ref(db, 'Alertas/Sensor-Gas');
    const idRef = ref(db, 'Control/idp');
    const pesoRef = ref(db, 'Sensor/Peso_pr'); 

    const unsubscribe = onValue(idRef, (snapshot) => {
      const fetchedId = snapshot.val();
      setFirebaseId(fetchedId);
    });
    
    onValue(sensorLlamaRef, (snapshot) => {
      setAlertallm(snapshot.val());
    });

    onValue(sensorGasRef, (snapshot) => {
      setAlertags(snapshot.val());
    });

    onValue(pesoRef, (snapshot) => {
      const value = snapshot.val();
      setPeso(isNaN(Number(value)) ? 0 : Number(value));
    });

    const fetchUserData = async () => {
      try {
        let userData;
        const roles = ['Administrador', 'Operador', 'Invitado'];

        for (const role of roles) {
          const collectionRef = collection(firestore, role);
          const q = query(collectionRef, where('email', '==', user.email));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            userData = snapshot.docs[0].data();
            break;
          }
        }

        setUserData(userData || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    const interval = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime <= 1 ? 0 : prevTime - 1));
    }, 1000);

    const fetchSensorData = () => {
      const database = getDatabase(app);
      const sensors = {
        'Sensor/temp': setTemperature,
        'Sensor/hum': setHumidity,
        'Sensor/gas-MQ4': setGas,
        'Sensor/llama-S1': setFlame,
        'Sensor/termocupla1': setTermo1,
        'Sensor/termocupla2': setTermo2,
        'Sensor/gas-MQ5': setGas1,
        'Sensor/llama-S2': setFlame1,
        'Alertas/Sensores-Gas': setAlertags,
        'Alertas/Sensores-Flama': setAlertallm
      };

      Object.entries(sensors).forEach(([path, setter]) => {
        onValue(ref(database, path), (snapshot) => {
          const value = snapshot.val();
          setter(isNaN(Number(value)) ? 0 : Number(value));
        });
      });

      onValue(ref(database, 'Sensor/Estado'), (snapshot) => {
        setIsChecked(snapshot.val() == 1);
      });
    };

    if (user?.email) fetchUserData();
    fetchSensorData();

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user.email]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { nombre, apellido } = userData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 overflow-hidden">
      <ObsMd/>
      <motion.div 
        className="bg-gray-800 bg-opacity-70 backdrop-blur-md border-b border-gray-700 p-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
          whileHover={{ scale: 1.02 }}
        >
          PROCESO DE PIROLISIS
        </motion.h1>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-gray-700 bg-opacity-50 px-4 py-2 rounded-lg">
            <User className="text-blue-400" size={20} />
            <span className="font-medium">
              {nombre ? `${nombre} ${apellido}` : 'Invitado'}
            </span>
          </div>

          <button>
            <BtnHome />
          </button>
        </div>
      </motion.div>

      {/* Contenedor principal con scroll controlado */}
      <div className="h-[calc(100vh-80px)] p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-full">
              <SensoresGauges 
                temperature={temperature}
                humidity={humidity}
                gas={gas}
                flame={flame}
                termo1={termo1}
                termo2={termo2}
                gas1={gas1}
                flame1={flame1}
                peso={peso} 
              />
            </div>
          </div>

          <div className="space-y-6">
            <motion.div 
              className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-400 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Alertas del Sistema</h3>
              </div>
              <div className="max-h-48 overflow-y-auto pr-2">
                <AlertasSensor />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <Clock className="text-blue-400 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Tiempo de Proceso</h3>
              </div>
              <Tiempo />
              <div className="py-4">
                <ControlVentiladoresAutomatico/>  
              </div>
            </motion.div>        

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GuardarProcesoSecundario/>
              <EnvID/>     
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mostrar;