// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p className="text-gray-400 text-center mt-20">Loading...</p>;

  // ✅ Redirect directly to landing page instead of /auth
  if (!user) return <Navigate to="/" replace />;

  return children;
}
