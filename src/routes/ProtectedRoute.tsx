// src/components/ProtectedRoute.tsx
import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  role: "admin" | "employee";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 🔍 Debug: Log à chaque rendu
  useEffect(() => {
    console.log("🛡️ ProtectedRoute render:", {
      path: location.pathname,
      requiredRole: role,
      loading,
      user: user ? { id: user.id, role: user.role } : null
    });
  }, [loading, user, role, location.pathname]);

  // 🔧 FIX: Attendre que le chargement soit terminé avant toute redirection
  if (loading) {
    console.log("⏳ Chargement en cours...");
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    console.warn("🚫 Pas d'utilisateur - Redirection vers /login");
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur n'a pas le bon rôle, rediriger vers son propre dashboard
  if (user.role !== role) {
    const redirectPath = user.role === "admin" 
      ? "/admin/dashboard" 
      : "/employee/dashboard";
    console.warn(`🚫 Mauvais rôle (${user.role} ≠ ${role}) - Redirection vers ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("✅ Accès autorisé");
  // Tout est OK, afficher le contenu protégé
  return <>{children}</>;
}