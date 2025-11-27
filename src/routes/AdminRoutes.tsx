// // src/routes/AdminRoutes.tsx

// import { Routes, Route } from "react-router-dom";

// // Employees
// import Employees from "../modules/employees/list";
// import EmployeeCreate from "../modules/employees/create";
// import EmployeeEdit from "../modules/employees/edit";
// import EmployeeShow from "../modules/employees/show";

// // Departments
// import Departments from "../modules/departments/list";
// import DepartmentCreate from "../modules/departments/create";
// import DepartmentEdit from "../modules/departments/edit";
// import DepartmentShow from "../modules/departments/show";

// // Tasks
// import Tasks from "../modules/tasks/list";
// import TaskCreate from "../modules/tasks/create";
// import TaskEdit from "../modules/tasks/edit";
// import TaskShow from "../modules/tasks/show";

// // Roles
// import Roles from "../modules/roles/list";
// import RoleCreate from "../modules/roles/create";
// import RoleEdit from "../modules/roles/edit";
// import RoleShow from "../modules/roles/show";

// // Managers
// import Managers from "../modules/managers/list";
// import ManagerCreate from "../modules/managers/create";
// import ManagerEdit from "../modules/managers/edit";
// import ManagerShow from "../modules/managers/show";

// // Presences
// import Presences from "../modules/presences/list";
// import PresenceCreate from "../modules/presences/create";
// import PresenceEdit from "../modules/presences/edit";
// import PresenceShow from "../modules/presences/show";


// // Announcements
// import Announcements from "../modules/announcements/list";
// import AnnouncementCreate from "../modules/announcements/create";
// import AnnouncementEdit from "../modules/announcements/edit";
// import AnnouncementShow from "../modules/announcements/show";
// import LeaveRequestCreate from "../modules/leaveRequests/create";
// import LeaveRequestEdit from "../modules/leaveRequests/edit";
// import LeaveRequestShow from "../modules/leaveRequests/show";
// import LeaveRequestList from "../modules/leaveRequests/list";


// import AdminDashboard from "../modules/admin/dashboard";
// import ProtectedRoute from "./ProtectedRoute";

// <Route path="dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />


// export default function AdminRoutes() {
//   return (
//     <Routes>

//       {/* EMPLOYEES */}
//       <Route path="employees" element={<ProtectedRoute role="admin"><Employees /></ProtectedRoute>} />
//       <Route path="employees/create" element={<ProtectedRoute role="admin"><EmployeeCreate /></ProtectedRoute>} />
//       <Route path="employees/:id/edit" element={<ProtectedRoute role="admin"><EmployeeEdit /></ProtectedRoute>} />
//       <Route path="employees/:id" element={<ProtectedRoute role="admin"><EmployeeShow /></ProtectedRoute>} />

//       {/* DEPARTMENTS */}
//       <Route path="departments" element={<ProtectedRoute role="admin"><Departments /></ProtectedRoute>} />
//       <Route path="departments/create" element={<ProtectedRoute role="admin"><DepartmentCreate /></ProtectedRoute>} />
//       <Route path="departments/:id/edit" element={<ProtectedRoute role="admin"><DepartmentEdit /></ProtectedRoute>} />
//       <Route path="departments/:id" element={<ProtectedRoute role="admin"><DepartmentShow /></ProtectedRoute>} />

//       {/* TASKS */}
//       <Route path="tasks" element={<ProtectedRoute role="admin"><Tasks /></ProtectedRoute>} />
//       <Route path="tasks/create" element={<ProtectedRoute role="admin"><TaskCreate /></ProtectedRoute>} />
//       <Route path="tasks/:id/edit" element={<ProtectedRoute role="admin"><TaskEdit /></ProtectedRoute>} />
//       <Route path="tasks/:id" element={<ProtectedRoute role="admin"><TaskShow /></ProtectedRoute>} />

//       {/* ROLES */}
//       <Route path="roles" element={<ProtectedRoute role="admin"><Roles /></ProtectedRoute>} />
//       <Route path="roles/create" element={<ProtectedRoute role="admin"><RoleCreate /></ProtectedRoute>} />
//       <Route path="roles/:id/edit" element={<ProtectedRoute role="admin"><RoleEdit /></ProtectedRoute>} />
//       <Route path="roles/:id" element={<ProtectedRoute role="admin"><RoleShow /></ProtectedRoute>} />

//       {/* MANAGERS */}
//       <Route path="managers" element={<ProtectedRoute role="admin"><Managers /></ProtectedRoute>} />
//       <Route path="managers/create" element={<ProtectedRoute role="admin"><ManagerCreate /></ProtectedRoute>} />
//       <Route path="managers/:id/edit" element={<ProtectedRoute role="admin"><ManagerEdit /></ProtectedRoute>} />
//       <Route path="managers/:id" element={<ProtectedRoute role="admin"><ManagerShow /></ProtectedRoute>} />

//       {/* PRESENCES */}
//       <Route path="presences" element={<ProtectedRoute role="admin"><Presences /></ProtectedRoute>} />
//       <Route path="presences/create" element={<ProtectedRoute role="admin"><PresenceCreate /></ProtectedRoute>} />
//       <Route path="presences/:id/edit" element={<ProtectedRoute role="admin"><PresenceEdit /></ProtectedRoute>} />
//       <Route path="presences/:id" element={<ProtectedRoute role="admin"><PresenceShow /></ProtectedRoute>} />

//       {/* LEAVE REQUESTS */}
//       <Route path="leave_requests" element={<ProtectedRoute role="admin"><LeaveRequestList /></ProtectedRoute>} />
//       <Route path="leave_requests/create" element={<ProtectedRoute role="admin"><LeaveRequestCreate /></ProtectedRoute>} />
//       <Route path="leave_requests/:id/edit" element={<ProtectedRoute role="admin"><LeaveRequestEdit /></ProtectedRoute>} />
//       <Route path="leave_requests/:id" element={<ProtectedRoute role="admin"><LeaveRequestShow /></ProtectedRoute>} />

//       {/* ANNOUNCEMENTS */}
//       <Route path="announcements" element={<ProtectedRoute role="admin"><Announcements /></ProtectedRoute>} />
//       <Route path="announcements/create" element={<ProtectedRoute role="admin"><AnnouncementCreate /></ProtectedRoute>} />
//       <Route path="announcements/:id/edit" element={<ProtectedRoute role="admin"><AnnouncementEdit /></ProtectedRoute>} />
//       <Route path="announcements/:id" element={<ProtectedRoute role="admin"><AnnouncementShow /></ProtectedRoute>} />

//     </Routes>
//   );
// }
