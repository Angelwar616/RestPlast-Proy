import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Smartphone, Shield, CheckCircle, 
  XCircle, Clock, Edit, ChevronLeft, Save, X, 
  AlertCircle
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const UserDetailsPage = () => {
  const { state } = useLocation();
  const { user: initialUser, role: userRole, currentUserRole } = state || {};
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    nombre: initialUser?.nombre || '',
    apellido: initialUser?.apellido || '',
    email: initialUser?.email || '',
    celular: initialUser?.celular || '',
    confirmacion: initialUser?.confirmacion || false
  });

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setFormData({
        nombre: initialUser?.nombre || '',
        apellido: initialUser?.apellido || '',
        email: initialUser?.email || '',
        celular: initialUser?.celular || '',
        confirmacion: initialUser?.confirmacion || false
      });
    }
  }, [initialUser]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-400">No se encontraron datos del usuario</p>
      </div>
    );
  }

  // Verificar permisos basados en roles
  const canEditUser = () => {
    // Si no hay currentUserRole, permitir por defecto (para compatibilidad hacia atrás)
    if (!currentUserRole) return true;
    
    // Administrador puede editar a todos
    if (currentUserRole === 'administrador') return true;
    
    // Operador puede editar solo operadores e invitados
    if (currentUserRole === 'operador') {
      return userRole !== 'administrador';
    }
    
    // Invitado no puede editar a nadie
    return false;
  };

  // Verificar si puede desactivar este usuario específico
  const canDeactivateUser = () => {
    if (!currentUserRole) return true;
    
    // Administrador puede desactivar a todos
    if (currentUserRole === 'administrador') return true;
    
    // Operador solo puede desactivar operadores e invitados
    if (currentUserRole === 'operador') {
      return userRole !== 'administrador';
    }
    
    // Invitado no puede desactivar a nadie
    return false;
  };

  // Verificar si el usuario actual está viendo su propio perfil
  const isOwnProfile = () => {
    // Asumiendo que el ID del usuario actual está disponible en el estado
    const currentUserId = state?.currentUserId || '';
    return currentUserId === user.id;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si está intentando cambiar el estado de confirmación, verificar permisos
    if (name === 'confirmacion' && !canDeactivateUser()) {
      alert('No tienes permisos para desactivar este usuario');
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    // Verificar permisos antes de guardar
    if (!canEditUser()) {
      alert('No tienes permisos para editar este usuario');
      setIsEditing(false);
      return;
    }

    // Verificar permisos específicos para desactivación
    if (user.confirmacion !== formData.confirmacion && !canDeactivateUser()) {
      alert('No tienes permisos para cambiar el estado de este usuario');
      setIsEditing(false);
      return;
    }

    try {
      const userRef = doc(firestore, userRole, user.id);
      await updateDoc(userRef, formData);
      
      setUser({
        ...user,
        ...formData
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert('Error al actualizar usuario');
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      celular: user.celular,
      confirmacion: user.confirmacion
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (!canEditUser()) {
      alert('No tienes permisos para editar este usuario');
      return;
    }
    setIsEditing(true);
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-8 border border-gray-700 mx-auto max-w-4xl my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Banner de advertencia de permisos */}
      {!canEditUser() && (
        <div className="mb-6 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg flex items-center">
          <AlertCircle className="text-yellow-400 mr-3" size={24} />
          <div>
            <p className="text-yellow-200 font-medium">Permisos limitados</p>
            <p className="text-yellow-300 text-sm">
              {currentUserRole === 'operador' 
                ? 'Como operador, no puedes editar usuarios administradores.' 
                : 'No tienes permisos para editar este usuario.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-100">
            {isEditing ? 'Editando Usuario' : 'Detalles del Usuario'}
          </h2>
          {currentUserRole && (
            <p className="text-sm text-gray-400 mt-1">
              Tu rol: <span className="capitalize text-blue-300">{currentUserRole}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="text-green-400 hover:text-green-300 flex items-center bg-green-900 bg-opacity-20 px-3 py-1 rounded"
              >
                <Save className="mr-1" size={18} /> Guardar
              </button>
              <button 
                onClick={handleCancel}
                className="text-red-400 hover:text-red-300 flex items-center bg-red-900 bg-opacity-20 px-3 py-1 rounded"
              >
                <X className="mr-1" size={18} /> Cancelar
              </button>
            </>
          ) : (
            canEditUser() && (
              <button 
                onClick={handleEditClick}
                className="text-blue-400 hover:text-blue-300 flex items-center bg-blue-900 bg-opacity-20 px-3 py-1 rounded"
              >
                <Edit className="mr-1" size={18} /> Editar
              </button>
            )
          )}
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-300 flex items-center bg-gray-700 bg-opacity-50 px-3 py-1 rounded"
          >
            <ChevronLeft className="mr-1" size={18} /> Volver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
            <User className="mr-2" size={20} />
            Información Personal
          </h3>
          
          <div className="space-y-4">
            <DetailField 
              label="Nombre"
              name="nombre"
              value={isEditing ? formData.nombre : user.nombre}
              onChange={handleInputChange}
              editing={isEditing && canEditUser()}
              disabled={!canEditUser()}
            />
            <DetailField 
              label="Apellido"
              name="apellido"
              value={isEditing ? formData.apellido : user.apellido}
              onChange={handleInputChange}
              editing={isEditing && canEditUser()}
              disabled={!canEditUser()}
            />
            <DetailField 
              label="Email"
              name="email"
              value={isEditing ? formData.email : user.email}
              onChange={handleInputChange}
              editing={isEditing && canEditUser()}
              type="email"
              disabled={!canEditUser()}
            />
            <DetailField 
              label="Teléfono"
              name="celular"
              value={isEditing ? formData.celular : (user.celular || 'No especificado')}
              onChange={handleInputChange}
              editing={isEditing && canEditUser()}
              type="tel"
              disabled={!canEditUser()}
            />
          </div>
        </div>

        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
            <Shield className="mr-2" size={20} />
            Datos de la Cuenta
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Rol</p>
              <p className="text-gray-100 font-medium mt-1 capitalize">
                {userRole}
                {userRole === 'administrador' && (
                  <span className="ml-2 text-xs px-2 py-1 bg-purple-900 bg-opacity-30 rounded">
                    Admin
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">ID de Usuario</p>
              <div className="flex items-center mt-1">
                <p className="text-gray-100 font-medium">{user.id}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(user.id)}
                  className="ml-2 text-gray-400 hover:text-gray-300 text-xs"
                  title="Copiar"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Estado</p>
              {isEditing ? (
                <div className="mt-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="confirmacion"
                      checked={formData.confirmacion}
                      onChange={handleInputChange}
                      className="rounded text-blue-500"
                      disabled={!canDeactivateUser()}
                      title={!canDeactivateUser() ? 'No puedes cambiar este estado' : ''}
                    />
                    <span className={`text-gray-100 ${!canDeactivateUser() ? 'opacity-50' : ''}`}>
                      Cuenta activa
                      {!canDeactivateUser() && (
                        <span className="text-xs text-yellow-400 ml-2">(Sin permisos)</span>
                      )}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center mt-1">
                  {user.confirmacion ? (
                    <CheckCircle className="text-green-400 mr-2" size={16} />
                  ) : (
                    <XCircle className="text-yellow-400 mr-2" size={16} />
                  )}
                  <p className="text-gray-100 font-medium">
                    {user.confirmacion ? "Activo" : "Inactivo"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-400">Registrado el</p>
              <div className="flex items-center mt-1">
                <Clock className="text-purple-400 mr-2" size={16} />
                <p className="text-gray-100 font-medium">
                  {user.fechaRegistro || 'Fecha no disponible'}
                </p>
              </div>
            </div>

            {/* Indicador de permisos */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400 mb-2">Permisos de edición:</p>
              <div className="flex items-center">
                {canEditUser() ? (
                  <CheckCircle className="text-green-400 mr-2" size={16} />
                ) : (
                  <XCircle className="text-red-400 mr-2" size={16} />
                )}
                <p className="text-gray-100 text-sm">
                  {canEditUser() 
                    ? 'Puedes editar este usuario' 
                    : 'No tienes permisos para editar este usuario'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailField = ({ label, name, value, onChange, editing, type = 'text', disabled = false }) => {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-600 text-white rounded px-3 py-1 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        />
      ) : (
        <p className="text-gray-100 font-medium mt-1">
          {value}
        </p>
      )}
    </div>
  );
};

export default UserDetailsPage;