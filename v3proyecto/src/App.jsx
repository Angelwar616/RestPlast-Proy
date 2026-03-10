import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { ProtectedRoute } from "./Protect/ProtectedRoutes";
import Sidebar from "./common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import { Login } from "./Persona/Login";
import { Home } from "./components/home";
import UserDetailsPage from "./Persona/UserDetailsPage";
import { Register } from "./Persona/Registrar";
import PesajeRct from "./components/PesajeRct";
import Mostrar from "./components/ProcesoP";
import GrPr from "./components/GrPr";
import DatosMysql from "./components/Datos_mysql";
import HomePageIoT from "./components/Pvista";
import Tmuestra from "./components/Vistag/Tmuestra";
import SensorTester from "./components/SensorPrb";
import VentTester from "./components/VentTester";
import SensorPage from "./components/sm";
import ControlVentiladoresAutomatico from "./components/Ventautm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen bg-gray-900 text-gray-100 overflow-hidden">
          
          <div className="">
            <div className=" bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
            
          </div>
          
          {/* Rutas sin sidebar (Login) */}
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>

          {/* Sección con Sidebar (Protegida) */}
          <ProtectedRoute>
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<HomePageIoT />} />
                  <Route path="/view" element={<Home />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/user-details/:uid" element={<UserDetailsPage />} />
                  <Route path="/registrar" element={<Register />} />
                  <Route path="/PesajeRct" element={<PesajeRct />} />
                  <Route path="/Mostrar" element={<Mostrar />} />
                  <Route path="/GrPr" element={<GrPr />} />
                  <Route path="/DatoMysql/:id" element={<DatosMysql />} />
                  <Route path="/Tm" element={<Tmuestra />} />
                  <Route path="/Control" element={<OverviewPage />} />
                  <Route path="/SensorPrb" element={<SensorTester />} />
                  <Route path="/Ventest" element={<VentTester/>}/>
                  <Route path="/sensor/:sensorKey" element={<SensorPage />} />
                  <Route path="/ventaut" element={<ControlVentiladoresAutomatico />} /> 
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
