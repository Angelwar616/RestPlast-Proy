import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogIn } from "lucide-react";

export function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = ({ target: { name, value } }) =>
    setUser({ ...user, [name]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(user.email, user.password);
      navigate("/");
    } catch (error) {
      setError("Error al iniciar sesión. Verifique sus credenciales.");
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) return setError("Ingrese un correo electrónico");
    try {
      await resetPassword(user.email);
      setError("¡Correo de recuperación enviado!");
    } catch (error) {
      setError("Error al enviar el correo. Intente de nuevo.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Iniciar Sesión</h2>
        {error && (
          <div className="flex items-center text-red-500 bg-red-100 p-3 rounded mb-4">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition">
            <LogIn className="mr-2" size={18} /> Iniciar Sesión
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={handleResetPassword}
            className="text-blue-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}
