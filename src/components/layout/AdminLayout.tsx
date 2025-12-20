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
    { label: "Présences", path: "/admin/presences" },
    { label: "Tâches", path: "/admin/tasks" },
    { label: "Congés", path: "/admin/leave_requests" },
    { label: "Managers", path: "/admin/managers" },
    { label: "Rôles", path: "/admin/roles" },
    { label: "Communication", path: "/admin/announcements" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* SIDEBAR MODERNE */}
      <aside style={{
        width: sidebarOpen ? "280px" : "0",
        backgroundColor: "#0f172a", // Navy Blue très profond (Enterprise style)
        color: "#ffffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1000,
        boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
        borderRight: "1px solid #1e293b"
      }}>
        {sidebarOpen && (
          <>
            {/* Logo Section */}
            <div style={{ 
              padding: "32px 24px", 
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                    width: "32px", height: "32px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", 
                    borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold"
                }}>E</div>
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", letterSpacing: "-0.5px" }}>
                  Admin Space 
                </h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={closeButtonStyle}>✕</button>
            </div>

            {/* Navigation principal */}
            <nav style={{ flex: 1, padding: "0 16px", overflowY: "auto" }}>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "16px" }}>
                Menu Principal
              </p>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                
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
                      color: isActive ? "#fff" : "#94a3b8",
                      textDecoration: "none",
                      backgroundColor: isActive ? "#1e293b" : "transparent",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: isActive ? "600" : "500",
                      transition: "all 0.2s"
                    }}
                    className="menu-item"
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#1e293b";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#94a3b8";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Profil & Logout Section (Aérée) */}
            <div style={{ padding: "24px", borderTop: "1px solid #1e293b", backgroundColor: "#0b1120" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ 
                    width: "40px", height: "40px", borderRadius: "50%", 
                    backgroundColor: "#334155", display: "flex", justifyContent: "center", alignItems: "center",
                    border: "2px solid #3b82f6" 
                }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {user?.name}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Admin Système</p>
                </div>
              </div>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Se déconnecter
              </button>
            </div>
          </>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ 
        marginLeft: sidebarOpen ? "280px" : "0", 
        flex: 1, 
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Top Header pour compenser la sidebar fermée */}
        <header style={{ 
            height: "64px", display: "flex", alignItems: "center", padding: "0 24px", 
            backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10
        }}>
            {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} style={openButtonStyle}>
                    ☰ <span style={{ fontSize: "14px", fontWeight: "600", marginLeft: "8px" }}>MENU</span>
                </button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <div style={{ width: "1px", height: "24px", backgroundColor: "#e2e8f0" }}></div>
                <span title="Notifications" style={{ cursor: "pointer", fontSize: "18px" }}>🔔</span>
            </div>
        </header>
        
        <div style={{ padding: "32px" }}>
            <Outlet />
        </div>
      </main>
    </div>
  );
}

// STYLES OBJECTS
const closeButtonStyle = {
  background: "#1e293b",
  border: "none",
  color: "#94a3b8",
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px"
};

const openButtonStyle = {
  background: "none",
  border: "1px solid #e2e8f0",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#0f172a",
};

const logoutButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  backgroundColor: "transparent",
  color: "#f87171",
  border: "1px solid #ef444433",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  transition: "all 0.2s"
};