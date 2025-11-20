import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const menu = [
    { label: "Employés", path: "/admin/employees" },
    { label: "Départements", path: "/admin/departments" },
    { label: "Managers", path: "/admin/managers" },
    { label: "Présences", path: "/admin/presences" },
    { label: "Congés", path: "/admin/leave-requests" },
    { label: "Tâches", path: "/admin/tasks" },
    { label: "Rôles", path: "/admin/roles" },
    { label: "Affectation rôles", path: "/admin/employee-roles" },
    { label: "Annonces", path: "/admin/announcements" },
  ];

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "240px",
          background: "#222",
          color: "white",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <h2>Admin</h2>
        <ul style={{ marginTop: "20px" }}>
          {menu.map(m => (
            <li key={m.path} style={{ marginBottom: "10px" }}>
              <Link to={m.path} style={{ color: "white" }}>
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* CONTENT */}
      <main style={{ padding: "20px", width: "100%" }}>
        <h1>Dashboard Admin</h1>
        <p>Bienvenue dans le panneau d'administration.</p>
      </main>
    </div>
  );
}
