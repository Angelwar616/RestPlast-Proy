import { useAuth } from "../Context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <h1 className="text-center text-xl">Cargando...</h1>;
  if (!user) return <Navigate to="/login" replace />;

  return <div>{children}</div>;
}
