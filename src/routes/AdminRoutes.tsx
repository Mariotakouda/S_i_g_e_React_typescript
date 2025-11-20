import { Routes, Route } from "react-router-dom";

// Dashboard

// CRUD pages
import EmployeesCRUD from "../pages/admin/EmployeesCRUD";
import DepartmentsCRUD from "../pages/admin/DepartmentsCRUD";
import AnnouncementsCRUD from "../pages/admin/AnnouncementsCRUD";
import LeaveRequestsCRUD from "../pages/admin/LeaveRequestsCRUD";
import PresencesCRUD from "../pages/admin/PresencesCRUD";
import RolesCRUD from "../pages/admin/RolesCRUD";
import TasksCRUD from "../pages/admin/TasksCRUD";
import ManagersCRUD from "../pages/admin/ManagersCRUD";
import EmployeeRolesCRUD from "../pages/admin/EmployeeRolesCRUD";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AdminRoutes() {
  return (
    <ProtectedRoute role="admin">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />

        {/* Tous les CRUD */}
        <Route path="employees" element={<EmployeesCRUD />} />
        <Route path="departments" element={<DepartmentsCRUD />} />
        <Route path="announcements" element={<AnnouncementsCRUD />} />
        <Route path="leave-requests" element={<LeaveRequestsCRUD />} />
        <Route path="presences" element={<PresencesCRUD />} />
        <Route path="roles" element={<RolesCRUD />} />
        <Route path="tasks" element={<TasksCRUD />} />
        <Route path="managers" element={<ManagersCRUD />} />
        <Route path="employee-roles" element={<EmployeeRolesCRUD />} />
      </Routes>
    </ProtectedRoute>
  );
}
