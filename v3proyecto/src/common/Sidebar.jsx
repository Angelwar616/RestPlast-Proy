import { BarChart2, CirclePower, Menu, Settings, Users, House } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; 
import { signOut } from "firebase/auth";
import { useAuth } from "../Context/AuthContext"; // Ajusta la ruta
import { collection, getDocs, where, query } from 'firebase/firestore';
import { firestore } from "../firebase"; // Ajusta la ruta

// Items base del sidebar
const BASE_SIDEBAR_ITEMS = [
  {
    name: "Menu principal",
    icon: House,
    color: "#6366f1",
    href: "/",
  },  
  { name: "Control pirolisis", icon: Settings, color: "#6EE7B7", href: "/Control" },
  { name: "Persona", icon: Users, color: "#EC4899", href: "/users" },
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarItems, setSidebarItems] = useState(BASE_SIDEBAR_ITEMS);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userData = null;
        let userRole = null;
        const roles = ['Administrador', 'Operador', 'Invitado'];

        for (const role of roles) {
          const collectionRef = collection(firestore, role);
          const q = query(collectionRef, where('email', '==', user.email));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            userData = snapshot.docs[0].data();
            userRole = role;
            break;
          }
        }

        setUserData(userData);

        // Filtrar items del sidebar basado en el rol
        if (userRole === 'Invitado') {
          // Remover la opción "Persona" para invitados
          const filteredItems = BASE_SIDEBAR_ITEMS.filter(item => item.name !== "Persona");
          setSidebarItems(filteredItems);
        } else {
          // Para Administrador y Operador, mostrar todos los items
          setSidebarItems(BASE_SIDEBAR_ITEMS);
        }

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Si está cargando, mostrar sidebar básico
  if (loading) {
    return (
      <motion.div
        className="relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 w-20"
        animate={{ width: 80 }}
      >
        <div className='h-[1000px] bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
          >
            <Menu size={24} />
          </motion.button>
          
          {/* Solo mostrar botón de salir durante carga */}
          <nav className='mt-8 flex-grow'>
            <motion.button
              onClick={handleLogout}
              className='w-full flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'
            >
              <CirclePower size={20} style={{ color: "#eb2b0d", minWidth: "20px" }} />
            </motion.button>
          </nav>
        </div>
      </motion.div>
    );
  }

  // Verificar si el usuario está confirmado
  const isConfirmed = userData?.confirmacion === true;

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className='h-[1000px] bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700 '>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
        >
          <Menu size={24} />
        </motion.button>

        <nav className='mt-8 flex-grow'>
          {/* Mostrar items del sidebar solo si el usuario está confirmado */}
          {isConfirmed ? (
            <>
              {sidebarItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'>
                    <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          className='ml-4 whitespace-nowrap'
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, delay: 0.3 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              ))}
            </>
          ) : (
            // Mensaje de acceso restringido cuando no está confirmado
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  className="p-4 text-center text-red-400 text-sm mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Acceso restringido
                </motion.div>
              )}
            </AnimatePresence>
          )}
          
          {/* Botón de Salir (siempre visible) */}
          <motion.button
            onClick={handleLogout}
            className='w-full flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'
          >
            <CirclePower size={20} style={{ color: "#eb2b0d", minWidth: "20px" }} />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  className='ml-4 whitespace-nowrap'
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  Salir
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;