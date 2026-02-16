import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { checkManagerStatus } from "../../modules/announcements/service";
import type { ManagerStatus } from "../../modules/announcements/service";
import "./EmployeeLayout.css";

// --- ICONES ---
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
  User: () => (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  Presence: () => (
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
  Create: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Team: () => (
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
  ManagerBadge: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
};

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(
    null
  );
  const { user, employee, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (window.innerWidth > 1024) setSidebarOpen(true);
      else if (mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      if (!user?.id) return;
      try {
        const status = await checkManagerStatus();
        if (isMounted) setManagerStatus(status);
      } catch (e) {
        console.error(e);
      }
    }
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleLogout = async () => {
    if (window.confirm("Se déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  const menuItems = [
    {
      label: "Tableau de Bord",
      path: "/employee/dashboard",
      icon: Icons.Dashboard,
    },
    { label: "Mon Profil", path: "/employee/profile", icon: Icons.User },
    {
      label: "Consulter mes tâches",
      path: "/employee/tasks",
      icon: Icons.Tasks,
    },
    {
      label: "Pointer ma présence",
      path: "/employee/presences",
      icon: Icons.Presence,
    },
    {
      label: "Mes Congés",
      path: "/employee/leave-requests",
      icon: Icons.Leave,
    },
    {
      label: "Les annonces",
      path: "/employee/announcements",
      icon: Icons.Announcements,
      badge: managerStatus?.is_manager ? "M" : null,
    },
  ];

  const showLabels = isMobile ? false : sidebarOpen;

  return (
    <div className="employee-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${showLabels ? "sidebar--open" : "sidebar--collapsed"}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="logo-icon">H</div>
            {showLabels && <span className="logo-text">EMPLOYE</span>}
          </div>
        </div>

        <nav className="sidebar__nav">
          {showLabels && <p className="nav__section-title">Menu Principal</p>}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "nav-item--active" : ""} ${!showLabels ? "nav-item--collapsed" : ""}`}
              >
                <span className="nav-item__icon">
                  <Icon />
                </span>
                {showLabels && (
                  <span className="nav-item__label">{item.label}</span>
                )}
                {showLabels && item.badge && (
                  <span className="nav-item__badge">{item.badge}</span>
                )}
              </Link>
            );
          })}

          {managerStatus?.is_manager && (
            <div className="manager-section">
              {showLabels && (
                <p className="nav__section-title">Gestion d'équipe</p>
              )}
              <Link
                to="/employee/team-tasks"
                className={`nav-item nav-item--manager ${
                  location.pathname === "/employee/team-tasks"
                    ? "nav-item--manager-active"
                    : ""
                } ${!showLabels ? "nav-item--collapsed" : ""}`}
              >
                <span className="nav-item__icon">
                  <Icons.Team />
                </span>
                {showLabels && (
                  <span className="nav-item__label">Tâches équipe</span>
                )}
              </Link>
              <Link
                to="/employee/announcements/create"
                className={`create-btn create-btn--green ${!showLabels ? "create-btn--collapsed" : ""}`}
              >
                <Icons.Create />
                {showLabels && <span>Annonce</span>}
              </Link>
              <Link
                to="/employee/tasks/create"
                className={`create-btn create-btn--indigo ${!showLabels ? "create-btn--collapsed" : ""}`}
              >
                <Icons.Tasks />
                {showLabels && <span>Assigner une mission</span>}
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar__footer">
          <Link to="/employee/profile" className="user-info-link">
            <div
              className={`user-info ${!showLabels ? "user-info--collapsed" : ""}`}
            >
              <div className="user-avatar">
                {employee?.profile_photo_url ? (
                  <img
                    src={employee.profile_photo_url}
                    className="user-avatar__img"
                    alt="P"
                  />
                ) : (
                  employee?.first_name?.charAt(0) || user?.name?.charAt(0)
                )}
              </div>
              {showLabels && (
                <div className="user-details">
                  <p className="user-name">
                    {employee?.first_name || "User"}
                  </p>
                  <p
                    className={`user-role ${
                      managerStatus?.is_manager
                        ? "user-role--manager"
                        : "user-role--employee"
                    }`}
                  >
                    {managerStatus?.is_manager ? "MANAGER" : "EMPLOYÉ"}
                  </p>
                </div>
              )}
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className={`logout-btn ${!showLabels ? "logout-btn--collapsed" : ""}`}
          >
            {showLabels ? "Déconnexion" : "Exit"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div
        className={`main-container ${showLabels ? "main-container--shifted" : ""}`}
      >
        {/* HEADER */}
        <header className={`header ${isMobile ? "header--mobile" : ""}`}>
          <div className="header__left">
            {!isMobile && (
              <>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="menu-toggle"
                  aria-label="Toggle sidebar"
                >
                  <Icons.Menu />
                </button>
                <div className="header__divider" />
              </>
            )}
            <h2 className="header__title">ESPACE PERSONNEL</h2>
          </div>

          <div className="header__right">
            {managerStatus?.is_manager && !isMobile && (
              <div className="manager-badge">
                <Icons.ManagerBadge />
                <span>Mode Responsable</span>
              </div>
            )}
            <Link to="/employee/profile" className="header__avatar-link">
              <div className="header__avatar">
                {employee?.profile_photo_url ? (
                  <img
                    src={employee.profile_photo_url}
                    className="header__avatar-img"
                    alt="P"
                  />
                ) : (
                  employee?.first_name?.charAt(0) || "U"
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className={`content ${isMobile ? "content--mobile" : ""}`}>
          <div className="content__wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}