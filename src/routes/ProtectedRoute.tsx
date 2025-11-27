import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "employee"; // rôle requis pour accéder à la route
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading } = useContext(AuthContext);

  // Tant que le chargement est en cours, on affiche un loader
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "5px solid #e0e0e0",
            borderTop: "5px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p style={{ color: "#666", fontSize: "16px" }}>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si pas de user, redirection vers login
  if (!user) {
    console.warn("⚠️ Accès refusé : Utilisateur non connecté");
    return <Navigate to="/login" replace />;
  }

  // Si rôle requis et utilisateur n'a pas ce rôle, redirection vers dashboard
  if (role && user.role !== role) {
    console.warn(`⚠️ Accès refusé : Rôle requis "${role}", rôle actuel "${user.role}"`);
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;