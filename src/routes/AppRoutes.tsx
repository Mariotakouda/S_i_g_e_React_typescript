import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";

// Auth Pages
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";

// Dashboards
import AdminDashboard from "../modules/admin/dashboard";
import EmployeeDashboard from "../modules/employee/dashboard";

// Employees
import Employees from "../modules/employees/list";
import EmployeeCreate from "../modules/employees/create";
import EmployeeEdit from "../modules/employees/edit";
import EmployeeShow from "../modules/employees/show";

// Departments
import Departments from "../modules/departments/list";
import DepartmentCreate from "../modules/departments/create";
import DepartmentEdit from "../modules/departments/edit";
import DepartmentShow from "../modules/departments/show";

// Tasks
import Tasks from "../modules/tasks/list";
import TaskCreate from "../modules/tasks/create";
import TaskEdit from "../modules/tasks/edit";
import TaskShow from "../modules/tasks/show";

// Roles
import Roles from "../modules/roles/list";
import RoleCreate from "../modules/roles/create";
import RoleEdit from "../modules/roles/edit";
import RoleShow from "../modules/roles/show";

// Managers
import Managers from "../modules/managers/list";
import ManagerCreate from "../modules/managers/create";
import ManagerEdit from "../modules/managers/edit";
import ManagerShow from "../modules/managers/show";

// Presences
import Presences from "../modules/presences/list";
import PresenceCreate from "../modules/presences/create";
import PresenceEdit from "../modules/presences/edit";
import PresenceShow from "../modules/presences/show";

// Leave Requests
import LeaveRequestList from "../modules/leaveRequests/list";
import LeaveRequestCreate from "../modules/leaveRequests/create";
import LeaveRequestEdit from "../modules/leaveRequests/edit";
import LeaveRequestShow from "../modules/leaveRequests/show";

// Announcements
import Announcements from "../modules/announcements/list";
import AnnouncementCreate from "../modules/announcements/create";
import AnnouncementEdit from "../modules/announcements/edit";
import AnnouncementShow from "../modules/announcements/show";

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

      {/* ========== ROUTES ADMIN AVEC LAYOUT ========== */}
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
        <Route path="employees" element={<Employees />} />
        <Route path="employees/create" element={<EmployeeCreate />} />
        <Route path="employees/:id/edit" element={<EmployeeEdit />} />
        <Route path="employees/:id" element={<EmployeeShow />} />

        {/* DEPARTMENTS */}
        <Route path="departments" element={<Departments />} />
        <Route path="departments/create" element={<DepartmentCreate />} />
        <Route path="departments/:id/edit" element={<DepartmentEdit />} />
        <Route path="departments/:id" element={<DepartmentShow />} />

        {/* TASKS */}
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/create" element={<TaskCreate />} />
        <Route path="tasks/:id/edit" element={<TaskEdit />} />
        <Route path="tasks/:id" element={<TaskShow />} />

        {/* ROLES */}
        <Route path="roles" element={<Roles />} />
        <Route path="roles/create" element={<RoleCreate />} />
        <Route path="roles/:id/edit" element={<RoleEdit />} />
        <Route path="roles/:id" element={<RoleShow />} />

        {/* MANAGERS */}
        <Route path="managers" element={<Managers />} />
        <Route path="managers/create" element={<ManagerCreate />} />
        <Route path="managers/:id/edit" element={<ManagerEdit />} />
        <Route path="managers/:id" element={<ManagerShow />} />

        {/* PRESENCES */}
        <Route path="presences" element={<Presences />} />
        <Route path="presences/create" element={<PresenceCreate />} />
        <Route path="presences/:id/edit" element={<PresenceEdit />} />
        <Route path="presences/:id" element={<PresenceShow />} />

        {/* LEAVE REQUESTS */}
        <Route path="leave_requests" element={<LeaveRequestList />} />
        <Route path="leave_requests/create" element={<LeaveRequestCreate />} />
        <Route path="leave_requests/:id/edit" element={<LeaveRequestEdit />} />
        <Route path="leave_requests/:id" element={<LeaveRequestShow />} />

        {/* ANNOUNCEMENTS */}
        <Route path="announcements" element={<Announcements />} />
        <Route path="announcements/create" element={<AnnouncementCreate />} />
        <Route path="announcements/:id/edit" element={<AnnouncementEdit />} />
        <Route path="announcements/:id" element={<AnnouncementShow />} />
      </Route>

      {/* ========== ROUTES EMPLOYEE ========== */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute role="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* ========== REDIRECTIONS PAR DÉFAUT ========== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}