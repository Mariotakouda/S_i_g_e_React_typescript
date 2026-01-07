import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { checkManagerStatus } from "../../modules/announcements/service";
import type { ManagerStatus } from "../../modules/announcements/service";

// --- 1. ICONES SVG ---
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Tasks: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>,
  Presence: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Leave: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Announcements: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Create: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Team: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  MenuWhite: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ManagerBadge: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  )
};

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);
  const { user, employee, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ CORRECTION 1 : useEffect pour le resize (OK - pas de problème ici)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Pas de dépendances - OK

  // ✅ CORRECTION 2 : Fermer sidebar sur mobile au changement de page (OK)
  useEffect(() => {
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  }, [location.pathname]); // Dépendance stable - OK

  // ✅ CORRECTION 3 : Charger le statut manager UNE SEULE FOIS avec stabilité
  useEffect(() => {
    let isMounted = true;
    
    async function loadStatus() {
      // Vérifier que l'utilisateur existe et a un ID
      if (!user?.id) {
        console.log("⏳ [EmployeeLayout] En attente de user.id...");
        return;
      }
      
      console.log("🔍 [EmployeeLayout] Chargement statut manager pour user.id:", user.id);
      
      try {
        const status = await checkManagerStatus();
        if (isMounted) {
          console.log("✅ [EmployeeLayout] Statut manager reçu:", status);
          setManagerStatus(status);
        }
      } catch (e) { 
        console.error("❌ [EmployeeLayout] Erreur chargement statut:", e); 
      }
    }
    
    loadStatus();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // ✅ Dépendance stable : seulement user?.id

  const handleLogout = async () => {
    if (window.confirm("Se déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { label: "Tableau de Bord", path: "/employee/dashboard", icon: Icons.Dashboard },
    { label: "Mon Profil", path: "/employee/profile", icon: Icons.User }, 
    { label: "Consulter mes tâches", path: "/employee/tasks", icon: Icons.Tasks }, 
    { label: "Pointer ma présence", path: "/employee/presences", icon: Icons.Presence },
    { label: "Mes Congés", path: "/employee/leave-requests", icon: Icons.Leave },
    { label: "Les annonces", path: "/employee/announcements", icon: Icons.Announcements, badge: managerStatus?.is_manager ? "Manager" : null },
  ];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#f8fafc" }}>
      
      {/* SIDEBAR */}
      <aside style={{ ...sidebarStyle, left: sidebarOpen ? "0" : "-280px" }}>
        <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={logoBoxStyle}>E</div>
            <span style={{ fontWeight: "700", fontSize: "19px", color: "white" }}>ESPACE EMPLOYE</span>
          </div>
          {window.innerWidth <= 1024 && (
            <button onClick={() => setSidebarOpen(false)} style={closeBtnStyle}><Icons.Close /></button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "0 16px", overflowY: "auto" }}>
          <p style={menuTitleStyle}>Menu Principal</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} style={{
                ...navLinkStyle,
                backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "#fff" : "#94a3b8",
              }}>
                <Icon /> <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={badgeStyle}>{item.badge}</span>}
              </Link>
            );
          })}

          {managerStatus?.is_manager && (
            <div style={{ marginTop: '24px' }}>
                <p style={menuTitleStyle}>Gestion d'équipe</p>

                <Link 
                  to="/employee/team-tasks" 
                  style={{
                    ...navLinkStyle,
                    color: location.pathname === "/employee/team-tasks" ? "#fff" : "#10b981",
                    backgroundColor: location.pathname === "/employee/team-tasks" ? "rgba(16, 185, 129, 0.2)" : "transparent",
                  }}
                >
                  <Icons.Team /> <span>Tâches de l'équipe</span>
                </Link>
                
                <Link to="/employee/announcements/create" style={{...createBtnStyle, marginBottom: '8px'}}>
                    <Icons.Create /> <span>Créer annonce</span>
                </Link>

                <Link 
                    to="/employee/tasks/create" 
                    style={{
                        ...createBtnStyle, 
                        backgroundColor: "#6366f1", 
                        boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.2)",
                        marginBottom: '8px'
                    }}
                >
                    <Icons.Tasks /> <span>Assigner mission</span>
                </Link>
            </div>
          )}
        </nav>

        <div style={sidebarFooterStyle}>
          <Link to="/employee/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", cursor: "pointer" }}>
              <div style={avatarCircleStyle}>
                {employee?.profile_photo_url ? (
                  <img src={employee.profile_photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="P" />
                ) : (
                  employee?.first_name?.charAt(0) || user?.name?.charAt(0)
                )}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={userNameStyle}>{employee?.first_name || "Utilisateur"}</p>
                <p style={{ ...userRoleStyle, color: managerStatus?.is_manager ? "#10b981" : "#818cf8" }}>
                  {managerStatus?.is_manager ? "MANAGER" : "EMPLOYÉ"}
                </p>
              </div>
            </div>
          </Link>
          <button onClick={handleLogout} style={logoutButtonStyle}>Déconnexion</button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div onClick={() => setSidebarOpen(false)} style={overlayStyle} />
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{ 
        flex: 1, display: "flex", flexDirection: "column",
        marginLeft: (window.innerWidth > 1024 && sidebarOpen) ? "280px" : "0",
        transition: "margin-left 0.3s ease", minWidth: 0, width: "100%"
      }}>
        <header style={headerStyle}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={menuBtnStyle}>
              <Icons.MenuWhite />
            </button>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
            {managerStatus?.is_manager && (
               <div style={managerTagStyle}>
                 <Icons.ManagerBadge /> <span>Mode Responsable</span>
               </div>
            )}
            <Link to="/employee/profile" style={{ textDecoration: 'none' }}>
              <div style={headerAvatarStyle}>
                {employee?.profile_photo_url ? (
                  <img src={employee.profile_photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="P" />
                ) : (
                  employee?.first_name?.charAt(0) || "U"
                )}
              </div>
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "32px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// --- STYLES ---
const sidebarStyle: React.CSSProperties = {
  width: "280px", backgroundColor: "#1e1b4b", color: "#fff", position: "fixed",
  height: "100vh", transition: "left 0.3s ease", zIndex: 1000, display: "flex", flexDirection: "column"
};
const logoBoxStyle: React.CSSProperties = {
  width: "36px", height: "36px", background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800"
};
const menuTitleStyle: React.CSSProperties = {
  fontSize: "11px", color: "#818cf8", fontWeight: "700", textTransform: "uppercase",
  paddingLeft: "12px", marginBottom: "12px", letterSpacing: "1px"
};
const navLinkStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", marginBottom: "4px",
  textDecoration: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", transition: "0.2s"
};
const createBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
  backgroundColor: "#10b981", color: "#fff", textDecoration: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px"
};
const sidebarFooterStyle: React.CSSProperties = {
  padding: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.15)"
};
const avatarCircleStyle: React.CSSProperties = {
  width: "40px", height: "40px", borderRadius: "10px", background: "#312e81",
  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", overflow: 'hidden'
};
const headerStyle: React.CSSProperties = {
  height: "72px", display: "flex", alignItems: "center", padding: "0 32px",
  backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10
};
const menuBtnStyle: React.CSSProperties = {
  background: "#4f46e5", border: "none", padding: 0, width: "42px", height: "42px", 
  borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
};
const managerTagStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px",
  background: "#ecfdf5", color: "#059669", borderRadius: "8px", fontSize: "12px", fontWeight: "700", border: "1px solid #d1fae5"
};
const headerAvatarStyle: React.CSSProperties = {
  width: "38px", height: "38px", background: "#f1f5f9", borderRadius: "10px",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", fontWeight: "bold", overflow: 'hidden'
};
const userNameStyle = { margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff" };
const userRoleStyle = { margin: 0, fontSize: "10px", fontWeight: "700" };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 999, backdropFilter: "blur(4px)" };
const badgeStyle = { fontSize: "10px", background: "#4f46e5", color: "#fff", padding: "2px 8px", borderRadius: "6px" };
const closeBtnStyle = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer" };
const logoutButtonStyle: React.CSSProperties = { width: "100%", padding: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", cursor: "pointer", fontWeight: "700" };