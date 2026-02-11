import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// --- ICONES ---
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Employees: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Departments: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>,
  Presences: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Tasks: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Leave: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Managers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Roles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Announcements: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  MenuWhite: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const mainNav = [
    { label: "Tableau de Bord", path: "/admin/dashboard", icon: Icons.Dashboard },
    { label: "Communication", path: "/admin/announcements", icon: Icons.Announcements },
  ];

  const hrNav = [
    { label: "Employés", path: "/admin/employees", icon: Icons.Employees },
    { label: "Départements", path: "/admin/departments", icon: Icons.Departments },
    { label: "Managers", path: "/admin/managers", icon: Icons.Managers },
    { label: "Rôles", path: "/admin/roles", icon: Icons.Roles },
  ];

  const opsNav = [
    { label: "Présences", path: "/admin/presences", icon: Icons.Presences },
    { label: "Tâches", path: "/admin/tasks", icon: Icons.Tasks },
    { label: "Congés", path: "/admin/leave-requests", icon: Icons.Leave },
  ];

  const sidebarWidth = sidebarOpen ? "280px" : "75px";

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#f8fafc" }}>
      
      {/* SIDEBAR */}
      <aside style={{ ...sidebarStyle, width: sidebarWidth, minWidth: sidebarWidth }}>
        <div style={{ padding: "32px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={logoBoxStyle}>H</div>
          {sidebarOpen && <h1 style={logoTextStyle}>ADMINISTRATOR</h1>}
        </div>

        <nav style={{ flex: 1, padding: "20px 12px", overflowY: "auto" }}>
          {sidebarOpen && <p style={menuTitleStyle}>Menu Principal</p>}
          {mainNav.map((item) => <NavItem key={item.path} item={item} sidebarOpen={sidebarOpen} location={location} />)}

          <div style={separatorStyle} />
          {sidebarOpen && <p style={menuTitleStyle}>Ressources Humaines</p>}
          {hrNav.map((item) => <NavItem key={item.path} item={item} sidebarOpen={sidebarOpen} location={location} />)}

          <div style={separatorStyle} />
          {sidebarOpen && <p style={menuTitleStyle}>Opérations</p>}
          {opsNav.map((item) => <NavItem key={item.path} item={item} sidebarOpen={sidebarOpen} location={location} />)}
        </nav>

        <div style={sidebarFooterStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: "12px", marginBottom: "16px", padding: sidebarOpen ? "0 8px" : "0" }}>
            <div style={avatarCircleStyle}>{user?.name?.charAt(0) || "A"}</div>
            {sidebarOpen && (
              <div style={{ overflow: "hidden" }}>
                <p style={userNameStyle}>{user?.name || "Admin"}</p>
                <p style={{ ...userRoleStyle, color: "#f59e0b" }}>ADMINISTRATEUR</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={{ ...logoutButtonStyle, padding: sidebarOpen ? "12px" : "12px 0" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
               {sidebarOpen ? "Se déconnecter" : "X"}
            </span>
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA (MODIFIÉ) --- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: sidebarWidth, transition: "margin-left 0.3s ease" }}>
        
        {/* LE MENUBAR BLEU AVEC BARRE BLANCHE */}
        <header style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          backgroundColor: "#1e1b4b", // Bleu vif
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}>
          {/* Bouton Menu */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "8px",
            borderRadius: "8px"
          }}>
            <Icons.MenuWhite />
          </button>

          {/* LA BARRE BLANCHE VERTICALE */}
          <div style={{
            width: "1px",
            height: "30px",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            margin: "0 20px"
          }} />

          {/* Titre Blanc */}
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "white" }}>
            {sidebarOpen ? "" : "ADMIN SPACE"}
          </h2>
          
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.9)" }}>Admin Panel</span>
            {/* Avatar Header Blanc */}
            <div style={{
              width: "38px",
              height: "38px",
              background: "white",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              fontWeight: "bold"
            }}>
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANT NAVITEM ---
function NavItem({ item, sidebarOpen, location }: any) {
  const isActive = location.pathname.startsWith(item.path);
  const Icon = item.icon;
  return (
    <Link to={item.path} title={!sidebarOpen ? item.label : ""} style={{
      ...navLinkStyle,
      justifyContent: sidebarOpen ? "flex-start" : "center",
      backgroundColor: isActive ? "#3b82f6" : "transparent",
      color: isActive ? "#fff" : "#94a3b8",
      padding: sidebarOpen ? "12px 16px" : "12px 0",
    }}>
      <Icon />
      {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
    </Link>
  );
}

// --- STYLES ---
const sidebarStyle: React.CSSProperties = {
  backgroundColor: "#1e1b4b", color: "#fff", position: "fixed", top: 0, bottom: 0, left: 0,
  zIndex: 1000, display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", overflow: "hidden"
};

const logoBoxStyle: React.CSSProperties = {
  width: "38px", height: "38px", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", flexShrink: 0
};

const logoTextStyle: React.CSSProperties = { margin: 0, fontSize: "18px", fontWeight: "700", letterSpacing: "0.5px", whiteSpace: "nowrap" };
const menuTitleStyle: React.CSSProperties = { fontSize: "10px", color: "#818cf8", fontWeight: "700", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "12px", marginTop: "12px", letterSpacing: "1px" };
const navLinkStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px", textDecoration: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" };
const separatorStyle: React.CSSProperties = { height: "1px", backgroundColor: "rgba(255,255,255,0.05)", margin: "16px 12px" };
const sidebarFooterStyle: React.CSSProperties = { padding: "20px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" };
const avatarCircleStyle: React.CSSProperties = { width: "40px", height: "40px", borderRadius: "10px", background: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", flexShrink: 0 };
const userNameStyle = { margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff", whiteSpace: "nowrap" };
const userRoleStyle = { margin: 0, fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" };
const logoutButtonStyle: React.CSSProperties = { width: "100%", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "10px", cursor: "pointer", fontWeight: "700" };