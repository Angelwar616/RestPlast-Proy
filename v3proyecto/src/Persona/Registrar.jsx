import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

export function Register() {
  const [user, setUser] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    celular: '',
    rol: 'Invitado'
  });
  
  const { signup, user: currentAuthUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [celularExists, setCelularExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Obtener el rol del usuario actual
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      if (!currentAuthUser?.email) return;
      
      try {
        const roles = ['Administrador', 'Operador', 'Invitado'];
        for (const role of roles) {
          const collectionRef = collection(firestore, role);
          const q = query(collectionRef, where('email', '==', currentAuthUser.email));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            setCurrentUserRole(role);
            // Si es Operador, establecer rol por defecto como Invitado
            if (role === 'Operador') {
              setUser(prev => ({ ...prev, rol: 'Invitado' }));
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching current user role:", error);
      }
    };

    fetchCurrentUserRole();
  }, [currentAuthUser]);

  const validateNombre = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  const validateCelular = (value) => /^\d+$/.test(value);
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleChange = ({ target: { name, value } }) => {
    if (name === 'nombre' || name === 'apellido') {
      if (value === '' || validateNombre(value)) {
        setUser({ ...user, [name]: value });
      }
    } else if (name === 'celular') {
      if (value === '' || validateCelular(value)) {
        setUser({ ...user, [name]: value });
      }
    } else if (name === 'password') {
      setUser({ ...user, [name]: value });
      checkPasswordStrength(value);
    } else if (name === 'rol') {
      // Solo permitir cambiar el rol si es Administrador
      if (currentUserRole === 'Administrador') {
        setUser({ ...user, [name]: value });
      }
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  useEffect(() => {
    const checkCelularExists = async () => {
      const roles = ['Administrador', 'Operador', 'Invitado'];
      let exists = false;
      
      for (const role of roles) {
        const q = query(
          collection(firestore, role),
          where('celular', '==', user.celular)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          exists = true;
          break;
        }
      }
      
      setCelularExists(exists);
    };

    if (user.celular !== '' && validateCelular(user.celular)) {
      checkCelularExists();
    }
  }, [user.celular]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateNombre(user.nombre)) {
      setError('El nombre solo puede contener letras');
      return;
    }
    
    if (!validateNombre(user.apellido)) {
      setError('El apellido solo puede contener letras');
      return;
    }
    
    if (!validateCelular(user.celular)) {
      setError('El celular solo puede contener números');
      return;
    }
    
    if (!validateEmail(user.email)) {
      setError('Ingrese un correo electrónico válido');
      return;
    }
    
    if (user.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar permisos según el rol del usuario actual
    if (currentUserRole === 'Operador' && user.rol === 'Administrador') {
      setError('No tienes permisos para crear usuarios Administrador');
      return;
    }

    setLoading(true);

    if (celularExists) {
      setError('El número de celular ya está registrado.');
      setLoading(false);
      return;
    }

    try {
      const { user: authUser } = await signup(user.email, user.password);
      await sendEmailVerification(authUser);

      await addDoc(collection(firestore, user.rol), {
        uid: authUser.uid,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular,
        rol: user.rol,
        confirmacion: false,
        fechaRegistro: new Date().toISOString()
      });

      navigate('/users');
    } catch (error) {
      console.error('Error al registrarse:', error);
      setLoading(false);

      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('El correo electrónico ya está en uso');
          break;
        case 'auth/invalid-email':
          setError('Correo electrónico inválido');
          break;
        case 'auth/weak-password':
          setError('La contraseña es demasiado débil');
          break;
        default:
          setError('Error al registrar el usuario. Intente nuevamente.');
      }
    }
  };

  const passwordStrengthPercent = () => {
    const requirementsMet = Object.values(passwordStrength).filter(Boolean).length;
    return (requirementsMet / 5) * 100;
  };

  // Opciones de rol disponibles según el usuario actual
  const getAvailableRoles = () => {
    if (currentUserRole === 'Administrador') {
      return [
        { value: 'Administrador', label: 'Administrador' },
        { value: 'Operador', label: 'Operador' },
        { value: 'Invitado', label: 'Invitado' }
      ];
    } else if (currentUserRole === 'Operador') {
      return [
        { value: 'Operador', label: 'Operador' },
        { value: 'Invitado', label: 'Invitado' }
      ];
    } else {
      return [
        { value: 'Invitado', label: 'Invitado' }
      ];
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4">
      <motion.div
        className="w-full max-w-md bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <Link to="/users" className="flex items-center text-gray-400 hover:text-gray-300">
              <ArrowLeft className="mr-2" size={20} />
              Volver
            </Link>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
              Crear Cuenta
            </h2>
          </div>          
          {error && (
            <div className="flex items-center bg-red-900/30 text-red-400 p-3 rounded-lg mb-6">
              <AlertCircle className="mr-2" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre {user.nombre && !validateNombre(user.nombre) && (
                    <span className="text-red-500 text-xs ml-1">(Solo letras)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={user.nombre}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 border ${
                    user.nombre && !validateNombre(user.nombre) ? 'border-red-500' : 'border-gray-600'
                  } text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Apellido {user.apellido && !validateNombre(user.apellido) && (
                    <span className="text-red-500 text-xs ml-1">(Solo letras)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={user.apellido}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 border ${
                    user.apellido && !validateNombre(user.apellido) ? 'border-red-500' : 'border-gray-600'
                  } text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Rol</label>
              <select
                name="rol"
                onChange={handleChange}
                value={user.rol}
                disabled={currentUserRole === 'Invitado' || !currentUserRole}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {currentUserRole === 'Invitado' && (
                <p className="text-red-400 text-xs mt-1">No tienes permisos para crear usuarios</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Celular {user.celular && !validateCelular(user.celular) && (
                  <span className="text-red-500 text-xs ml-1">(Solo números)</span>
                )}
              </label>
              <input
                type="text"
                name="celular"
                placeholder="Ingrese su celular"
                value={user.celular}
                onChange={handleChange}
                className={`w-full bg-gray-700 border ${
                  celularExists || (user.celular && !validateCelular(user.celular)) ? 'border-red-500' : 'border-gray-600'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
              {celularExists && (
                <p className="text-red-400 text-xs mt-1">Este número de celular ya está registrado</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email {user.email && !validateEmail(user.email) && (
                  <span className="text-red-500 text-xs ml-1">(Formato inválido)</span>
                )}
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={user.email}
                onChange={handleChange}
                className={`w-full bg-gray-700 border ${
                  user.email && !validateEmail(user.email) ? 'border-red-500' : 'border-gray-600'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={user.password}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${passwordStrengthPercent()}%`,
                      backgroundColor: passwordStrengthPercent() < 40 ? '#ef4444' : 
                                      passwordStrengthPercent() < 70 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
                  <div className="flex items-center">
                    {passwordStrength.length ? (
                      <Check className="text-green-500 mr-1" size={14} />
                    ) : (
                      <X className="text-red-500 mr-1" size={14} />
                    )}
                    <span>8+ caracteres</span>
                  </div>
                  <div className="flex items-center">
                    {passwordStrength.uppercase ? (
                      <Check className="text-green-500 mr-1" size={14} />
                    ) : (
                      <X className="text-red-500 mr-1" size={14} />
                    )}
                    <span>Mayúscula</span>
                  </div>
                  <div className="flex items-center">
                    {passwordStrength.lowercase ? (
                      <Check className="text-green-500 mr-1" size={14} />
                    ) : (
                      <X className="text-red-500 mr-1" size={14} />
                    )}
                    <span>Minúscula</span>
                  </div>
                  <div className="flex items-center">
                    {passwordStrength.number ? (
                      <Check className="text-green-500 mr-1" size={14} />
                    ) : (
                      <X className="text-red-500 mr-1" size={14} />
                    )}
                    <span>Número</span>
                  </div>
                  <div className="flex items-center">
                    {passwordStrength.special ? (
                      <Check className="text-green-500 mr-1" size={14} />
                    ) : (
                      <X className="text-red-500 mr-1" size={14} />
                    )}
                    <span>Carácter especial</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || currentUserRole === 'Invitado' || !currentUserRole}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-blue-500/20 font-medium ${
                loading || currentUserRole === 'Invitado' || !currentUserRole ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  {currentUserRole === 'Invitado' ? 'Sin permisos' : 'Registrar Usuario'}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}