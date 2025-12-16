// src/components/layout/EmployeeLayout.tsx

import { useContext, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, employee, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirection si l'utilisateur n'est pas authentifié ou n'est pas un employé
  if (!user || user.role !== 'employee') {
      navigate('/login');
      return null;
  }

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/employee/dashboard" },
    { label: "Mes Tâches", path: "/employee/tasks" }, // Si vous avez un composant TasksList
    { label: "Présence", path: "/employee/presences" }, // Si vous avez un composant Presences
    { label: "Demandes de Congé", path: "/employee/leave_requests" },
    { label: "Annonces", path: "/employee/announcements" }, // Si vous avez un composant Announcements
  ];

  const getIsActive = (path: string) => {
      // Pour gérer les sous-routes (ex: /employee/leave_requests/create)
      return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* SIDEBAR (Similaire à AdminLayout) */}
      <aside style={{
        width: sidebarOpen ? "260px" : "0",
        backgroundColor: "#202a44", // Couleur légèrement différente pour distinguer
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "width 0.3s ease",
        zIndex: 1000
      }}>
        {sidebarOpen && (
          <>
            {/* Header */}
            <div style={{ padding: "20px", borderBottom: "1px solid #374151" }}>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
                Espace Employé
              </h1>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "10px 0" }}>
              {menuItems.map((item) => {
                const isActive = getIsActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: "block",
                      padding: "12px 20px",
                      color: "white",
                      textDecoration: "none",
                      backgroundColor: isActive ? "#5a88e5" : "transparent",
                      borderLeft: isActive ? "4px solid #94b2f4" : "4px solid transparent",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "#374151";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer - User Info & Logout */}
            <div style={{ padding: "20px", borderTop: "1px solid #374151" }}>
              <p style={{ margin: 0, fontWeight: "600" }}>{employee?.first_name} {employee?.last_name || user?.name}</p>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "5px 0 15px 0" }}>
                Rôle: {user?.role}
              </p>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", padding: "12px", backgroundColor: "#ef4444", color: "white", 
                  border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "500", 
                }}
              >
                Déconnexion
              </button>
            </div>
          </>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ 
        marginLeft: sidebarOpen ? "260px" : "0", 
        flex: 1, 
        transition: "margin-left 0.3s ease",
        padding: "20px",
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            marginBottom: "20px",
            padding: "8px 15px",
            backgroundColor: "#202a44",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          title={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {sidebarOpen ? '❮ Réduire' : '☰ Menu'}
        </button>
        
        <Outlet />
      </main>
    </div>
  );
}