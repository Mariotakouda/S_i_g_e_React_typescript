// src/routes/AppRoutes.tsx
import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoutes from "./AdminRoutes";
import AdminDashboard from "../pages/admin/AdminDashboard";


export default function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Chargement...</p>; // attends que le contexte charge le user

  return (
    <Routes>
      {/* Login/Register redirige si déjà connecté */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Dashboard générique → redirige selon le rôle */}
      <Route
        path="/dashboard"
        element={
          user?.role === "admin" ? <Navigate to="/admin/dashboard" /> :
          user?.role === "employee" ? <Navigate to="/employee/dashboard" /> :
          <Navigate to="/login" />
        }
      />

      {/* Routes protégées */}
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
      />
        <Route 
        path="/admin/*" 
        element={<AdminRoutes />} 
        />


      {/* <Route
        path="/employee/dashboard"
        element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>}
      /> */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
