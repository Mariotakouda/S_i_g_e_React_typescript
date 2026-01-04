import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "employee"; 
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  // 1. Si l'utilisateur n'est pas connecté
  if (!user) {
    console.warn("⚠️ Accès refusé : redirection vers login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role.toLowerCase();

  // 2. Logique de filtrage par rôle
  if (role === "admin") {
    // Seuls 'admin' et 'manager' peuvent accéder aux routes marquées "admin"
    const hasAdminPrivileges = userRole === "admin" || userRole === "manager";
    
    if (!hasAdminPrivileges) {
      console.warn(`[Auth] Rôle ${userRole} insuffisant pour zone Admin`);
      return <Navigate to="/employee/dashboard" replace />;
    }
  } 

  if (role === "employee") {
    // ✅ CORRECTION ICI : 
    // Tout utilisateur connecté (Admin, Manager ou Employee) 
    // a le droit d'accéder à son propre espace "employé".
    // On ne bloque personne ici, tant qu'il est connecté.
    console.log(`[Auth] Accès autorisé à la zone perso pour : ${userRole}`);
  }

  // ✅ Accès autorisé pour tout le monde si on arrive ici
  return <>{children}</>;
};

export default ProtectedRoute;