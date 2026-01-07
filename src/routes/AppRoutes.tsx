import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import EmployeeLayout from "../components/layout/EmployeeLayout"; 

// Home & Auth
import Login from "../modules/auth/Login";
import Home from "../Pages/Home";

// Dashboards
import AdminDashboard from "../modules/admin/dashboard";
import EmployeeDashboard from "../modules/employee/dashboard";

// Admin modules
import EmployeeList from "../modules/employees/list";
import EmployeeEdit from "../modules/employees/edit";
import EmployeeShow from "../modules/employees/show";
import EmployeeCreate from "../modules/employees/create";

import Departments from "../modules/departments/list";
import DepartmentCreate from "../modules/departments/create";
import DepartmentEdit from "../modules/departments/edit";
import DepartmentShow from "../modules/departments/show";

import ManagerCreate from "../modules/managers/create";
import ManagerEdit from "../modules/managers/edit";
import ManagerShow from "../modules/managers/show";
import ManagerList from "../modules/managers/list";

import RoleCreate from "../modules/roles/create";
import RoleEdit from "../modules/roles/edit";
import RoleShow from "../modules/roles/show";
import RoleList from "../modules/roles/list";

// Tâches (Shared Modules)
import TaskShow from "../modules/tasks/show";
import TaskEdit from "../modules/tasks/edit";
import TaskCreate from "../modules/tasks/create";
import TaskList from "../modules/tasks/list";

import AnnouncementShow from "../modules/announcements/show";
import AnnouncementEdit from "../modules/announcements/edit";
import AnnouncementCreate from "../modules/announcements/create";
import AnnouncementList from "../modules/announcements/list";

import AdminLeaveRequests from "../modules/admin/AdminLeaveRequests";

// Employee modules
import EmployeeLeaveHistory from "../modules/employee/EmployeeLeaveHistory"; 
import LeaveRequestForm from "../modules/employee/LeaveRequestForm";
import EditLeaveRequest from "../modules/employee/EditLeaveRequest";
import EmployeePresencePage from "../modules/employee/EmployeePresencePage";
import AdminPresencePage from "../modules/admin/AdminPresencePage";
import EmployeeProfile from "../modules/employee/Profile";
import EmployeeTaskDetail from "../modules/employee/EmployeeTaskDetail";
import ManagerTeamTasks from "../modules/employee/ManagerTeamTasks";

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
      {/* ========== PAGE D'ACCUEIL PUBLIQUE ========== */}
      <Route path="/" element={<Home />} />

      {/* ========== LOGIN ========== */}
      <Route
        path="/login"
        element={
          user ? (
            // ✅ CORRECTION : Redirection basée sur le rôle depuis /login
            user.role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : user.role === "manager" || user.role === "employee" ? (
              <Navigate to="/employee/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      {/* ========== REDIRECTION DASHBOARD SELON RÔLE ========== */}
      <Route
        path="/dashboard"
        element={
          // ✅ CORRECTION : Vérifier d'abord si user existe
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === "admin" ? (
            <Navigate to="/admin/dashboard" replace />
          ) : user.role === "employee" || user.role === "manager" ? (
            <Navigate to="/employee/dashboard" replace />
          ) : (
            // ✅ CORRECTION : Fallback pour rôles inconnus
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ========== ROUTES ADMIN ========== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="presences" element={<AdminPresencePage />} />

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

        {/* TASKS ADMIN */}
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

        {/* LEAVES */}
        <Route path="leave-requests" element={<AdminLeaveRequests />} />
        <Route path="leave-requests/create" element={<LeaveRequestForm />} />
        <Route path="leave-requests/:id/edit" element={<LeaveRequestForm />} /> 

        {/* ANNOUNCEMENTS */}
        <Route path="announcements" element={<AnnouncementList />} />
        <Route path="announcements/create" element={<AnnouncementCreate />} />
        <Route path="announcements/:id/edit" element={<AnnouncementEdit />} />
        <Route path="announcements/:id" element={<AnnouncementShow />} />
      </Route>

      {/* ========== ROUTES EMPLOYEE / MANAGER ========== */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute role="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        
        <Route path="profile" element={<EmployeeProfile />} />

        <Route path="presences" element={<EmployeePresencePage />} />

        {/* LEAVE REQUESTS */}
        <Route path="leave-requests" element={<EmployeeLeaveHistory />} />
        <Route path="leave-requests/create" element={<LeaveRequestForm />} />
        <Route path="leave-requests/edit/:id" element={<EditLeaveRequest />} />

        {/* TASKS (ACCÈS MANAGER & EMPLOYÉ) */}
        <Route path="tasks" element={<TaskList />} /> 
        <Route path="tasks/create" element={<TaskCreate />} /> 
        <Route path="tasks/:id/edit" element={<TaskEdit />} />
        <Route path="tasks/:id" element={<EmployeeTaskDetail />} />

        <Route path="team-tasks" element={<ManagerTeamTasks />} />

        {/* ANNOUNCEMENTS */}
        <Route path="announcements" element={<AnnouncementList />} />
        <Route path="announcements/create" element={<AnnouncementCreate />} />
        <Route path="announcements/:id" element={<AnnouncementShow />} />
        <Route path="announcements/:id/edit" element={<AnnouncementEdit />} />
      </Route>

      {/* ========== REDIRECTION PAR DÉFAUT ========== */}
      <Route path="*" element={<Navigate to="/" replace />} /> 
    </Routes>
  );
}