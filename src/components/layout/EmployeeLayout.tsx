// src/components/layout/EmployeeLayout.tsx
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { checkManagerStatus } from "../../modules/announcements/service";
import type { ManagerStatus } from "../../modules/announcements/service";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);
  const { user, employee, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est un manager
  useEffect(() => {
    async function loadManagerStatus() {
      try {
        const status = await checkManagerStatus();
        setManagerStatus(status);
        console.log("Statut Manager:", status);
      } catch (error) {
        console.error("❌ Erreur chargement statut manager:", error);
      }
    }
    if (user) {
      loadManagerStatus();
    }
  }, [user]);

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

  // Menu adapté selon le statut (Manager ou Employé)
  const menuItems = managerStatus?.is_manager ? [
    { label: "Dashboard", path: "/employee/dashboard", icon: "" },
    { label: "Mes Tâches", path: "/employee/tasks", icon: "" }, 
    { label: "Présence", path: "/employee/presences", icon: "" },
    { label: "Demandes de Congé", path: "/employee/leave_requests", icon: "" },
    { 
      label: "Annonces", 
      path: "/employee/announcements", 
      icon: "",
      badge: "Manager",
      badgeColor: "#10b981"
    },
    { 
      label: "Créer une annonce", 
      path: "/employee/announcements/create", 
      icon: "➕",
      isSubItem: true // Pour style différent
    },
  ] : [
    { label: "Dashboard", path: "/employee/dashboard", icon: "" },
    { label: "Mes Tâches", path: "/employee/tasks", icon: "" }, 
    { label: "Présence", path: "/employee/presences", icon: "" },
    { label: "Demandes de Congé", path: "/employee/leave_requests", icon: "" },
    { label: "Communication", path: "/employee/announcements", icon: "" },
  ];

  const getIsActive = (path: string) => {
    // Pour la route des annonces, gérer les deux cas
    if (path === "/admin/announcements") {
      return location.pathname.startsWith("/admin/announcements");
    }
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
        overflow: "hidden"
      }}>
        {sidebarOpen && (
          <>
            {/* Logo Section */}
            <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: managerStatus?.is_manager 
                    ? "linear-gradient(135deg, #10b981, #059669)" 
                    : "linear-gradient(135deg, #6366f1, #4f46e5)", 
                  borderRadius: "8px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  fontWeight: "bold",
                  fontSize: "16px"
                }}>
                  {managerStatus?.is_manager ? "M" : "E"}
                </div>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: "18px", 
                    fontWeight: "700", 
                    letterSpacing: "-0.5px",
                    lineHeight: "1.2"
                  }}>
                    ESPACE <span style={{ color: "#a5b4fc", fontSize: "10px", verticalAlign: "top" }}>
                      {managerStatus?.is_manager ? "MANAGER" : "EMPLOYE"}
                    </span>
                  </h1>
                  {managerStatus?.is_manager && managerStatus.department_name && (
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "10px", 
                      color: "#10b981",
                      fontWeight: "600"
                    }}>
                      {managerStatus.department_name}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={closeButtonStyle}>✕</button>
            </div>

            {/* Badge Manager (si applicable) */}
            {managerStatus?.is_manager && (
              <div style={{
                margin: "0 16px 16px 16px",
                padding: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#10b981",
                fontWeight: "600",
                textAlign: "center"
              }}>
                👔 Responsable d'équipe
              </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "0 16px", overflowY: "auto" }}>
              <p style={{ 
                fontSize: "11px", 
                fontWeight: "600", 
                color: "#94a3b8", 
                textTransform: "uppercase", 
                paddingLeft: "12px", 
                marginBottom: "16px", 
                letterSpacing: "1px" 
              }}>
                Menu {managerStatus?.is_manager ? "Manager" : "Utilisateur"}
              </p>
              {menuItems.map((item) => {
                const isActive = getIsActive(item.path);
                const isSubItem = item.isSubItem || false;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: isSubItem ? "10px 16px 10px 44px" : "12px 16px",
                      marginBottom: "4px",
                      marginLeft: isSubItem ? "12px" : "0",
                      color: isActive ? "#fff" : "#cbd5e1",
                      textDecoration: "none",
                      backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                      borderRadius: "10px",
                      fontSize: isSubItem ? "13px" : "14px",
                      fontWeight: isActive ? "600" : "500",
                      transition: "all 0.2s",
                      position: "relative",
                      borderLeft: isSubItem ? "2px solid rgba(255,255,255,0.2)" : "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: isSubItem ? "16px" : "18px" }}>{item.icon}</span>
                      {item.label}
                    </div>
                    
                    {/* Badge pour les items spéciaux */}
                    {item.badge && (
                      <span style={{
                        padding: "2px 8px",
                        backgroundColor: item.badgeColor || "#10b981",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "700",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Profil */}
            <div style={{ 
              padding: "24px", 
              borderTop: "1px solid rgba(255,255,255,0.1)", 
              backgroundColor: "rgba(0,0,0,0.1)" 
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                marginBottom: "20px" 
              }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "10px", 
                  backgroundColor: managerStatus?.is_manager ? "#10b981" : "#6366f1", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  fontSize: "16px", 
                  fontWeight: "bold", 
                  color: "white",
                  position: "relative"
                }}>
                  {employee?.first_name?.charAt(0) || user?.name?.charAt(0)}
                  {managerStatus?.is_manager && (
                    <div style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      width: "16px",
                      height: "16px",
                      backgroundColor: "#fbbf24",
                      borderRadius: "50%",
                      border: "2px solid #2e2a5b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px"
                    }}>
                      ⭐
                    </div>
                  )}
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: "600", 
                    fontSize: "14px", 
                    whiteSpace: "nowrap", 
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}>
                    {employee?.first_name} {employee?.last_name}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "12px", 
                    color: managerStatus?.is_manager ? "#10b981" : "#94a3b8",
                    fontWeight: managerStatus?.is_manager ? "600" : "400"
                  }}>
                    {managerStatus?.is_manager 
                      ? `Manager • ${employee?.department?.name || 'Département'}` 
                      : (employee?.department?.name || 'Collaborateur')
                    }
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                🚪 Déconnexion
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
          height: "64px", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 32px", 
          backgroundColor: "#fff", 
          borderBottom: "1px solid #e2e8f0", 
          position: "sticky", 
          top: 0, 
          zIndex: 10,
          justifyContent: "space-between"
        }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={openButtonStyle}>
              ☰ <span style={{ fontSize: "14px", fontWeight: "600", marginLeft: "8px" }}>MENU</span>
            </button>
          )}
          
          <div style={{ 
            marginLeft: "auto", 
            display: "flex", 
            alignItems: "center", 
            gap: "16px" 
          }}>
            {managerStatus?.is_manager && (
              <div style={{
                padding: "6px 12px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #10b981",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#059669",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                👔 Mode Manager
              </div>
            )}
            
            <div style={{ 
              textAlign: "right", 
              display: "none" // Caché par défaut comme dans votre version
            }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                Statut actuel
              </div>
              <div style={{ fontSize: "13px", color: "#10b981", fontWeight: "700" }}>
                ● EN POSTE
              </div>
            </div>
          </div>
        </header>
        
        <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// STYLES REUTILISABLES
const closeButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "none",
  color: "#94a3b8",
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  transition: "all 0.2s"
};

const openButtonStyle: React.CSSProperties = {
  background: "#f1f5f9",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "#1a0dadff",
  fontWeight: "bold",
  fontSize: "14px"
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
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px"
};