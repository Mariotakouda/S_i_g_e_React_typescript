import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AdminLayout.css";
import { useContext, useEffect, useState } from "react";

const Icons = {
  Dashboard: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Employees: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Departments: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
  Presences: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Tasks: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Leave: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Managers: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Roles: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Announcements: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Menu: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const mainNav = [
    {
      label: "Tableau de Bord",
      path: "/admin/dashboard",
      icon: Icons.Dashboard,
    },
    {
      label: "Communication",
      path: "/admin/announcements",
      icon: Icons.Announcements,
    },
  ];

  const hrNav = [
    { label: "Employés", path: "/admin/employees", icon: Icons.Employees },
    {
      label: "Départements",
      path: "/admin/departments",
      icon: Icons.Departments,
    },
    { label: "Managers", path: "/admin/managers", icon: Icons.Managers },
    { label: "Rôles", path: "/admin/roles", icon: Icons.Roles },
  ];

  const opsNav = [
    { label: "Présences", path: "/admin/presences", icon: Icons.Presences },
    { label: "Tâches", path: "/admin/tasks", icon: Icons.Tasks },
    { label: "Congés", path: "/admin/leave-requests", icon: Icons.Leave },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--collapsed"}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="logo-icon">H</div>
            {sidebarOpen && <h1 className="logo-text">ADMINISTRATOR</h1>}
          </div>
        </div>

        <nav className="sidebar__nav">
          {sidebarOpen && <p className="nav__section-title">Menu Principal</p>}
          {mainNav.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              sidebarOpen={sidebarOpen}
              location={location}
            />
          ))}

          <div className="nav__separator" />
          {sidebarOpen && <p className="nav__section-title">Ressources Humaines</p>}
          {hrNav.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              sidebarOpen={sidebarOpen}
              location={location}
            />
          ))}

          <div className="nav__separator" />
          {sidebarOpen && <p className="nav__section-title">Opérations</p>}
          {opsNav.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              sidebarOpen={sidebarOpen}
              location={location}
            />
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className={`user-info ${!sidebarOpen ? "user-info--collapsed" : ""}`}>
            <div className="user-avatar">{user?.name?.charAt(0) || "A"}</div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.name || "Admin"}</p>
                <p className="user-role">ADMINISTRATEUR</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`logout-btn ${!sidebarOpen ? "logout-btn--icon-only" : ""}`}
            title={!sidebarOpen ? "Se déconnecter" : ""}
          >
            <Icons.Logout />
            {sidebarOpen && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className={`main-container ${sidebarOpen ? "main-container--shifted" : ""}`}>
        {/* HEADER */}
        <header className="header">
          <div className="header__left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle"
              aria-label="Toggle sidebar"
            >
              <Icons.Menu />
            </button>
            <div className="header__divider" />
            <h2 className="header__title">
              {sidebarOpen ? "" : "ADMIN SPACE"}
            </h2>
          </div>

          <div className="header__right">
            <div className="header__badge">Admin Panel</div>
            <div 
              className="header__user"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="header__avatar">
                {user?.name?.charAt(0) || "A"}
              </div>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown__header">
                    <div className="user-dropdown__avatar">{user?.name?.charAt(0) || "A"}</div>
                    <div>
                      <p className="user-dropdown__name">{user?.name || "Admin"}</p>
                      <p className="user-dropdown__email">{user?.email || "admin@example.com"}</p>
                    </div>
                  </div>
                  <div className="user-dropdown__divider" />
                  <button className="user-dropdown__item" onClick={handleLogout}>
                    <Icons.Logout />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
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
    <Link
      to={item.path}
      title={!sidebarOpen ? item.label : ""}
      className={`nav-item ${isActive ? "nav-item--active" : ""} ${!sidebarOpen ? "nav-item--collapsed" : ""}`}
    >
      <span className="nav-item__icon">
        <Icon />
      </span>
      {sidebarOpen && <span className="nav-item__label">{item.label}</span>}
      {isActive && <span className="nav-item__indicator" />}
    </Link>
  );
}