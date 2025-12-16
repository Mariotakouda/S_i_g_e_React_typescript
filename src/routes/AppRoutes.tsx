import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// ===========================================
// IMPORTS DES LAYOUTS
// ===========================================
import AdminLayout from "../components/layout/AdminLayout";
import EmployeeLayout from "../components/layout/EmployeeLayout"; 

// Auth Pages
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";

// Dashboards
import AdminDashboard from "../modules/admin/dashboard";
import EmployeeDashboard from "../modules/employee/dashboard";

// Employees (Admin)
import EmployeeList from "../modules/employees/list";
import EmployeeEdit from "../modules/employees/edit";
import EmployeeShow from "../modules/employees/show";

// Departments (Admin)
import Departments from "../modules/departments/list";
import DepartmentCreate from "../modules/departments/create";
import DepartmentEdit from "../modules/departments/edit";
import DepartmentShow from "../modules/departments/show";

// Presences (Admin)
import Presences from "../modules/presences/list";
import PresenceCreate from "../modules/presences/create";
import PresenceEdit from "../modules/presences/edit";
import PresenceShow from "../modules/presences/show";

// 🎯 NOUVEAUX IMPORTS POUR L'ADMINISTRATION DES CONGÉS 
// Ces composants ont été créés lors de la correction précédente.

// Leave Requests (Employee)
import EmployeeLeaveHistory from "../modules/employee/EmployeeLeaveHistory"; 
import LeaveRequestForm from "../modules/employee/LeaveRequestForm"; 

import ManagerCreate from "../modules/managers/create";
import ManagerEdit from "../modules/managers/edit";
import ManagerShow from "../modules/managers/show";
import ManagerList from "../modules/managers/list";


import RoleCreate from "../modules/roles/create";
import RoleEdit from "../modules/roles/edit";
import RoleShow from "../modules/roles/show";
import RoleList from "../modules/roles/list";


import TaskShow from "../modules/tasks/show";
import TaskEdit from "../modules/tasks/edit";
import TaskCreate from "../modules/tasks/create";
import TaskList from "../modules/tasks/list";


import AnnouncementShow from "../modules/announcements/show";
import AnnouncementEdit from "../modules/announcements/edit";
import AnnouncementCreate from "../modules/announcements/create";
import AnnouncementList from "../modules/announcements/list";

import EmployeeCreate from "../modules/employees/create";
import AdminLeaveRequests from "../modules/admin/AdminLeaveRequests";

export default function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
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

  return (
    <Routes>
      {/* ========== ROUTES PUBLIQUES ========== */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
      />

      {/* ========== REDIRECTION DASHBOARD SELON RÔLE ========== */}
      <Route
        path="/dashboard"
        element={
          user?.role === "admin" ? (
            <Navigate to="/admin/dashboard" replace />
          ) : user?.role === "employee" ? (
            <Navigate to="/employee/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ========== ROUTES ADMIN AVEC LAYOUT (Rôle: admin) ========== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* EMPLOYEES */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/create" element={<EmployeeCreate />} />
        <Route path="employees/:id/edit" element={<EmployeeEdit />} />
        <Route path="employees/:id" element={<EmployeeShow />} />

        {/* DEPARTMENTS */}
        <Route path="departments" element={<Departments />} />
        <Route path="departments/create" element={<DepartmentCreate />} />
        <Route path="departments/:id/edit" element={<DepartmentEdit />} />
        <Route path="departments/:id" element={<DepartmentShow />} />

        {/* TASKS */}
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/create" element={<TaskCreate />} />
        <Route path="tasks/:id/edit" element={<TaskEdit />} />
        <Route path="tasks/:id" element={<TaskShow />} />

        {/* ROLES */}
        <Route path="roles" element={<RoleList />} />
        <Route path="roles/create" element={<RoleCreate />} />
        <Route path="roles/:id/edit" element={<RoleEdit />} />
        <Route path="roles/:id" element={<RoleShow />} />

        {/* MANAGERS */}
        <Route path="managers" element={<ManagerList />} />
        <Route path="managers/create" element={<ManagerCreate />} />
        <Route path="managers/:id/edit" element={<ManagerEdit />} />
        <Route path="managers/:id" element={<ManagerShow />} />

        {/* PRESENCES */}
        <Route path="presences" element={<Presences />} />
        <Route path="presences/create" element={<PresenceCreate />} />
        <Route path="presences/:id/edit" element={<PresenceEdit />} />
        <Route path="presences/:id" element={<PresenceShow />} />

        {/* 🚀 LEAVE REQUESTS (Gestion par Admin) - NOUVELLES ROUTES */}
        <Route path="leave_requests" element={<AdminLeaveRequests />} />
        <Route path="leave_requests/create" element={<LeaveRequestForm />} />
        {/* Pour la modification du statut ou la visualisation détaillée */}
        <Route path="leave_requests/:id/edit" element={<LeaveRequestForm />} />
        {/* <Route path="leave_requests/:id" element={<LeaveRequestShow />} /> // Facultatif si edit suffit */}

        {/* ANNOUNCEMENTS */}
        <Route path="announcements" element={<AnnouncementList />} />
        <Route path="announcements/create" element={<AnnouncementCreate />} />
        <Route path="announcements/:id/edit" element={<AnnouncementEdit />} />
        <Route path="announcements/:id" element={<AnnouncementShow />} />
      </Route>

      {/* ========== ROUTES EMPLOYEE AVEC LAYOUT (Rôle: employee) ========== */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute role="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard (Route index par défaut) */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />

        {/* LEAVE REQUESTS (Soumission et Historique par Employé) */}
        <Route path="leave_requests" element={<EmployeeLeaveHistory />} />
        <Route path="leave_requests/create" element={<LeaveRequestForm />} />

        {/* Ajoutez ici les autres routes spécifiques aux employés (tasks, presences, etc.) */}
        {/* Exemple: <Route path="tasks" element={<EmployeeTaskList />} /> */}
        {/* Exemple: <Route path="presences" element={<EmployeePresenceLog />} /> */}

      </Route>

      {/* ========== REDIRECTIONS PAR DÉFAUT ========== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} /> 
    </Routes>
  );
}