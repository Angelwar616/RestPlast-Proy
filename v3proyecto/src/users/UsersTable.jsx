import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Power, ChevronRight, Play, User2Icon } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const UsersTableWithFirebase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Administrador');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: ''
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const { user } = useAuth();

  // Obtener el rol del usuario actual
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      if (!user?.email) return;
      
      try {
        const roles = ['Administrador', 'Operador', 'Invitado'];
        for (const role of roles) {
          const collectionRef = collection(firestore, role);
          const q = query(collectionRef, where('email', '==', user.email));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            setCurrentUserRole(role);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching current user role:", error);
      }
    };

    fetchCurrentUserRole();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(firestore, selectedRole);
        const querySnapshot = await getDocs(usersRef);
        
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fullName: `${doc.data().nombre} ${doc.data().apellido}`,
          status: doc.data().confirmacion ? "Activo" : "Inactivo"
        }));
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedRole]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) => 
        user.fullName.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.rol.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Verificar si el usuario actual puede modificar un usuario específico
  const canModifyUser = (targetUserRole) => {
    // Si no hay rol del usuario actual, no permitir modificación
    if (!currentUserRole) return false;
    
    // Administrador puede modificar todos los roles
    if (currentUserRole === 'Administrador') return true;
    
    // Operador puede modificar todos los roles (incluyendo Administrador)
    if (currentUserRole === 'Operador') {
      return true; // Cambiado de false a true para permitir editar administradores
    }
    
    // Invitado no puede modificar a nadie
    return false;
  };

  const handleConfirmUser = async (userId, userRole) => {
    // Verificar permisos antes de ejecutar
    if (!canModifyUser(userRole)) {
      alert('No tienes permisos para activar/desactivar este usuario');
      return;
    }

    try {
      const userRef = doc(firestore, selectedRole, userId);
      await updateDoc(userRef, { confirmacion: true });
      
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, confirmacion: true, status: "Activo" } : user
      );
      
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error confirming user:", error);
    }
  };

  const handleDeactivateUser = async (userId, userRole) => {
    // Verificar permisos antes de ejecutar
    if (!canModifyUser(userRole)) {
      alert('No tienes permisos para activar/desactivar este usuario');
      return;
    }

    try {
      const userRef = doc(firestore, selectedRole, userId);
      await updateDoc(userRef, { confirmacion: false });
      
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, confirmacion: false, status: "Inactivo" } : user
      );
      
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  const handleEditClick = (user) => {
    // Verificar permisos antes de editar
    if (!canModifyUser(user.rol)) {
      alert('No tienes permisos para editar este usuario');
      return;
    }

    setEditingUser(user.id);
    setEditForm({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol
    });
  };

  const handleEditSubmit = async (userId, userRole) => {
    // Verificar permisos antes de guardar
    if (!canModifyUser(userRole)) {
      alert('No tienes permisos para editar este usuario');
      return;
    }

    try {
      const userRef = doc(firestore, selectedRole, userId);
      await updateDoc(userRef, {
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        email: editForm.email,
        rol: editForm.rol
      });
      
      const updatedUsers = users.map(user => 
        user.id === userId ? { 
          ...user, 
          ...editForm,
          fullName: `${editForm.nombre} ${editForm.apellido}` 
        } : user
      );
      
      setUsers(updatedUsers);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='pt-4 pl-5'>
        <h2 className='pb-4 text-xl font-bold text-gray-100'>Crear nueva cuenta</h2>
        {/* Solo Administrador y Operador pueden crear usuarios */}
        {currentUserRole && currentUserRole !== 'Invitado' && (
          <Link to={'/registrar'} >
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition font-semibold bg-[#688bf9] hover:bg-[#c8d4ff] text-[#c7f8df] w-[280px] h-[60px]" >
                <User2Icon size={20} />
              <span>Crear usuario</span>
            </button>
          </Link>
        )}
      </div>
      <div className='flex flex-col h-[620px] p-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
          <h2 className='text-xl font-semibold text-gray-100'>Gestión de Usuarios</h2>
          
          <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto'>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className='bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value="Administrador">Administrador</option>
              <option value="Operador">Operador</option>
              <option value="Invitado">Invitado</option>
            </select>
            
            <div className='relative w-full md:w-64'>
              <input
                type='text'
                placeholder='Buscar usuario...'
                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-hidden'>
          <div className='h-full overflow-y-auto pr-2 custom-scrollbar'>
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='sticky top-0 bg-gray-800 z-10'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                    Nombre
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                    Rol
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                    Estado
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-700 bg-gray-800'>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {editingUser === user.id ? (
                          <input
                            type="text"
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                            className="bg-gray-700 text-white p-1 rounded"
                          />
                        ) : (
                          <div className='flex items-center'>
                            <div className='flex-shrink-0 h-10 w-10'>
                              <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                {user.nombre?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-100'>{user.fullName}</div>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap'>
                        {editingUser === user.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="bg-gray-700 text-white p-1 rounded"
                          />
                        ) : (
                          <div className='text-sm text-gray-300'>{user.email}</div>
                        )}
                      </td>
                      
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {editingUser === user.id ? (
                          <select
                            value={editForm.rol}
                            onChange={(e) => setEditForm({...editForm, rol: e.target.value})}
                            className="bg-gray-700 text-white p-1 rounded"
                          >
                            <option value="Administrador">Administrador</option>
                            <option value="Operador">Operador</option>
                            <option value="Invitado">Invitado</option>
                          </select>
                        ) : (
                          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
                            {user.rol}
                          </span>
                        )}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "Activo"
                              ? "bg-green-800 text-green-100"
                              : "bg-yellow-800 text-yellow-100"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {editingUser === user.id ? (
                          <>
                            <button 
                              onClick={() => handleEditSubmit(user.id, user.rol)}
                              className='text-green-400 hover:text-green-300 mr-2'
                            >
                              Guardar
                            </button>
                            <button 
                              onClick={() => setEditingUser(null)}
                              className='text-gray-400 hover:text-gray-300'
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Botón de editar */}
                            {canModifyUser(user.rol) && (
                              <button 
                                onClick={() => handleEditClick(user)}
                                className='text-blue-400 hover:text-blue-300 mr-3'
                                title="Editar usuario"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            
                            {/* Botón para ver detalles */}
                            <Link 
                              to={`/user-details/${user.id}`} 
                              state={{ user, role: selectedRole, currentUserRole }}
                              className='text-purple-400 hover:text-purple-300 mr-3 inline-block'
                              title="Ver detalles"
                            >
                              <ChevronRight size={16} />
                            </Link>
                            
                            {/* Mostrar botones de activar/desactivar según permisos */}
                            {canModifyUser(user.rol) && (
                              user.confirmacion ? (
                                <button 
                                  onClick={() => handleDeactivateUser(user.id, user.rol)}
                                  className='text-yellow-400 hover:text-yellow-300 mr-2'
                                  title="Desactivar usuario"
                                >
                                  <Power size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleConfirmUser(user.id, user.rol)}
                                  className='text-green-400 hover:text-green-300 mr-2'
                                  title="Activar usuario"
                                >
                                  <Power size={16} />
                                </button>
                              )
                            )}
                          </>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UsersTableWithFirebase;