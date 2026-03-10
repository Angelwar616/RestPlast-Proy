import { motion } from "framer-motion";
import { Thermometer, GaugeCircle, Eye, Activity } from "lucide-react";
import SensorVista from "./Vistag/SensorVista";
import ResumenUltimoProceso from "./Vistag/ResumePeso";
import Tmuestra from "./Vistag/Tmuestra";
import React, { useState, useEffect } from 'react';
import { useAuth } from "../Context/AuthContext"; // Ajusta la ruta según tu estructura
import { collection, getDocs, where, query } from 'firebase/firestore';
import { firestore } from "../firebase"; // Ajusta la ruta según tu estructura

const MainIoTView = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let userData = null;
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

                setUserData(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

    if (loading) {
        return <h1 className="text-white text-center">Cargando...</h1>;
    }

    if (!userData || !userData.confirmacion) {
        return (
            <div className="min-h-screen bg-[#1e1e2f] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
                    <p className="text-white">Tu cuenta no tiene acceso a esta sección.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#1e1e2f] p-8 space-y-8">
            <SensorVista/>

            <div className="flex space-x-6">
                <ResumenUltimoProceso/>
                <Tmuestra/>
            </div>
        </div>
    );
};

export default MainIoTView;