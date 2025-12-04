import { useContext, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Employés", path: "/admin/employees" },
    { label: "Départements", path: "/admin/departments" },
    { label: "Tâches", path: "/admin/tasks" },
    { label: "Congés", path: "/admin/leave_requests" },
    { label: "Managers", path: "/admin/managers" },
    { label: "Rôles", path: "/admin/roles" },
    { label: "Annonces", path: "/admin/announcements" },
    { label: "Présences", path: "/admin/presences" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? "260px" : "0",
        backgroundColor: "#1f2937",
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
            <div style={{ 
              padding: "20px", 
              borderBottom: "1px solid #374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
                Admin Panel
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "20px"
                }}
                title="Fermer le menu"
              >
                ✕
              </button>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "10px 0" }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || 
                                location.pathname.startsWith(item.path + "/");
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: "block",
                      padding: "12px 20px",
                      color: "white",
                      textDecoration: "none",
                      backgroundColor: isActive ? "#3b82f6" : "transparent",
                      borderLeft: isActive ? "4px solid #60a5fa" : "4px solid transparent",
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
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 5px 0" }}>
                  Connecté en tant que
                </p>
                <p style={{ margin: 0, fontWeight: "600" }}>{user?.name}</p>
                <p style={{ fontSize: "12px", color: "#9ca3af", margin: "5px 0 0 0" }}>
                  Rôle: {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
              >
                🚪 Déconnexion
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
        minHeight: "100vh"
      }}>
        {/* Toggle button si sidebar fermée */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: "fixed",
              top: "20px",
              left: "20px",
              padding: "10px 15px",
              backgroundColor: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: 999,
              fontSize: "16px"
            }}
            title="Ouvrir le menu"
          >
            ☰
          </button>
        )}
        
        {/* Le contenu des pages s'affiche ici via <Outlet /> */}
        <Outlet />
      </main>

      {/* Styles pour l'animation du loader */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

