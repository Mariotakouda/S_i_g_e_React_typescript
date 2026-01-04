import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// --- ICONES ---
const Icons = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Employees: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Departments: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>,
  Presences: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Tasks: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Leave: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Managers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Roles: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Announcements: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  MenuIcon: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [btnHover, setBtnHover] = useState(false);
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

  useEffect(() => {
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const menuItems = [
    { label: "Tableau de Bord", path: "/admin/dashboard", icon: Icons.Dashboard },
    { label: "Employés", path: "/admin/employees", icon: Icons.Employees },
    { label: "Départements", path: "/admin/departments", icon: Icons.Departments },
    { label: "Présences", path: "/admin/presences", icon: Icons.Presences },
    { label: "Tâches", path: "/admin/tasks", icon: Icons.Tasks },
    { label: "Congés", path: "/admin/leave-requests", icon: Icons.Leave },
    { label: "Managers", path: "/admin/managers", icon: Icons.Managers },
    { label: "Rôles", path: "/admin/roles", icon: Icons.Roles },
    { label: "Communication", path: "/admin/announcements", icon: Icons.Announcements },
  ];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#f8fafc" }}>
      
      {/* SIDEBAR */}
      <aside 
        style={{
          width: "280px",
          minWidth: "280px",
          backgroundColor: "#0f172a", 
          color: "#fff",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: sidebarOpen ? "0" : "-280px",
          zIndex: 1000,
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 15px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "35px", height: "35px", background: "#3b82f6", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", color: "#fff" }}>A</div>
            <h1 style={{ margin: 0, fontSize: "19px", fontWeight: "700" }}>ADMIN SPACE</h1>
          </div>
          {window.innerWidth <= 1024 && (
            <button onClick={() => setSidebarOpen(false)} style={closeButtonStyle}><Icons.Close /></button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "0 16px", overflowY: "auto" }}>
          <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "16px", letterSpacing: "1px" }}>Menu Principal</p>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path} to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", marginBottom: "6px",
                  color: isActive ? "#fff" : "#94a3b8", textDecoration: "none",
                  backgroundColor: isActive ? "#3b82f6" : "transparent", borderRadius: "10px",
                  fontSize: "14px", fontWeight: isActive ? "600" : "500", transition: "all 0.2s"
                }}
              >
                <Icon /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid #1e293b", background: "rgba(0,0,0,0.2)" }}>
          <button onClick={handleLogout} style={logoutButtonStyle}><Icons.Logout /> <span>Déconnexion</span></button>
        </div>
      </aside>

      {/* CONTENU */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        marginLeft: (window.innerWidth > 1024 && sidebarOpen) ? "280px" : "0",
        transition: "margin-left 0.3s ease",
        width: "100%"
      }}>
        <header style={headerStyle}>
          {/* BOUTON TOGGLE MODERNE (BLEU DOUX) */}
          <button 
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{
              ...toggleButtonStyle,
              backgroundColor: btnHover ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)",
              border: btnHover ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(59, 130, 246, 0.15)"
            }}
          >
            <Icons.MenuIcon />
          </button>
          
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
             <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
               {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
             </span>
             <div style={avatarStyle}>
                {user?.name?.charAt(0) || "A"}
             </div>
          </div>
        </header>
        
        <main style={{ flex: 1, overflowY: "auto", padding: "32px", boxSizing: "border-box" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// --- STYLES ---
const headerStyle: React.CSSProperties = {
  height: "72px",
  display: "flex",
  alignItems: "center",
  padding: "0 32px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #e2e8f0",
  position: "sticky",
  top: 0,
  zIndex: 10,
  gap: "20px"
};

// NOUVEAU STYLE DU BOUTON
const toggleButtonStyle: React.CSSProperties = { 
  border: "1px solid rgba(59, 130, 246, 0.15)",
  width: "42px", 
  height: "42px", 
  borderRadius: "10px", 
  cursor: "pointer", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center",
  transition: "all 0.2s ease",
  flexShrink: 0,
  outline: "none"
};

const avatarStyle: React.CSSProperties = {
  width: "38px", height: "38px", borderRadius: "10px", background: "#3b82f6",
  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff"
};

const closeButtonStyle = { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer" };
const logoutButtonStyle: React.CSSProperties = { width: "100%", padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" };