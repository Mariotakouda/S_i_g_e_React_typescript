import { useContext, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, employee, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

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
    { label: "Mes Tâches", path: "/employee/tasks" }, 
    { label: "Présence", path: "/employee/presences" },
    { label: "Demandes de Congé", path: "/employee/leave_requests" },
    { label: "Communication", path: "/employee/announcements" },
  ];

  const getIsActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* SIDEBAR PROFESSIONNELLE */}
      <aside style={{
        width: sidebarOpen ? "280px" : "0",
        backgroundColor: "#2e2a5b", // Indigo profond pour l'espace employé
        color: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1000,
        boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
      }}>
        {sidebarOpen && (
          <>
            {/* Logo Section */}
            <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: "32px", height: "32px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", 
                  borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold"
                }}>E</div>
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", letterSpacing: "-0.5px" }}>
                  ESPACE <span style={{ color: "#a5b4fc", fontSize: "10px", verticalAlign: "top" }}>PROFESSIONNEL</span>
                </h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={closeButtonStyle}>✕</button>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "0 16px" }}>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "16px", letterSpacing: "1px" }}>
                Menu Utilisateur
              </p>
              {menuItems.map((item) => {
                const isActive = getIsActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      marginBottom: "4px",
                      color: isActive ? "#fff" : "#cbd5e1",
                      textDecoration: "none",
                      backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: isActive ? "600" : "500",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "18px" }}></span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Profil */}
            <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ 
                  width: "40px", height: "40px", borderRadius: "10px", 
                  backgroundColor: "#6366f1", display: "flex", justifyContent: "center", alignItems: "center",
                  fontSize: "16px", fontWeight: "bold", color: "white"
                }}>
                  {employee?.first_name?.charAt(0) || user?.name?.charAt(0)}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {employee?.first_name} {employee?.last_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{employee?.department?.name || 'Collaborateur'}</p>
                </div>
              </div>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Déconnexion
              </button>
            </div>
          </>
        )}
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main style={{ 
        marginLeft: sidebarOpen ? "280px" : "0", 
        flex: 1, 
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Barre de navigation haute */}
        <header style={{ 
          height: "64px", display: "flex", alignItems: "center", padding: "0 32px", 
          backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10
        }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={openButtonStyle}>
              ☰ <span style={{ fontSize: "14px", fontWeight: "600", marginLeft: "8px" }}>MENU</span>
            </button>
          )}
          
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "right", display: "none",}}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Statut actuel</div>
                <div style={{ fontSize: "13px", color: "#10b981", fontWeight: "700" }}>● EN POSTE</div>
            </div>
          </div>
        </header>
        
        <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// STYLES REUTILISABLES
const closeButtonStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "none",
  color: "#94a3b8",
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px"
};

const openButtonStyle = {
  background: "#f1f5f9",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#1a0dadff",
  fontWeight: "bold"
};

const logoutButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  color: "#f87171",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  transition: "all 0.2s"
};