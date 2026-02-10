import { useEffect, useState, useContext, useCallback } from "react";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

// --- SKELETON COMPONENTS ---
const StatSkeleton = () => (
  <div className="stat-card-premium skeleton-pulse">
    <div className="sk-icon"></div>
    <div className="sk-details">
      <div className="sk-line small"></div>
      <div className="sk-line large"></div>
    </div>
  </div>
);

const Icons = {
  Users: () => (
    <svg
      width="24"
      height="24"
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
  Building: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
    </svg>
  ),
  Check: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="24"
      height="24"
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
  Alert: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Plus: () => (
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    emp: 0,
    dep: 0,
    task: 0,
    leave: 0,
    managers: 0,
    roles: 0,
    announcements: 0,
    presences: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [recentPresences, setRecentPresences] = useState<any[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const safeGet = (url: string) => api.get(url).catch(() => ({ data: [] }));

      const [empR, depR, taskR, leaveR, mangR, roleR, annR, presR] =
        await Promise.all([
          safeGet("/employees"),
          safeGet("/departments"),
          safeGet("/tasks"),
          safeGet("/leave-requests"),
          safeGet("/managers"),
          safeGet("/roles"),
          safeGet("/announcements"),
          safeGet("/presences"),
        ]);

      const getT = (res: any) => {
        const d = res.data;
        if (!d) return 0;
        return Array.isArray(d) ? d.length : d.total || d.data?.length || 0;
      };

      const getL = (res: any) =>
        Array.isArray(res.data) ? res.data : res.data?.data || [];

      setStats({
        emp: getT(empR),
        dep: getT(depR),
        task: getT(taskR),
        leave: getT(leaveR),
        managers: getT(mangR),
        roles: getT(roleR),
        announcements: getT(annR),
        presences: getT(presR),
      });

      setRecentEmployees(getL(empR).slice(0, 5));
      setRecentAnnouncements(getL(annR).slice(0, 5));
      setRecentPresences(getL(presR).slice(0, 5));
    } catch (err) {
      setError("Certaines données n'ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (error && !loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-alert-box">
          <Icons.Alert />
          <p>{error}</p>
          <button onClick={loadDashboardData} className="btn-retry-modern">
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Tableau de bord</h1>
        <p className="dashboard-welcome">
          Bonjour, <strong>{user?.name || "Administrateur"}</strong>
        </p>
      </header>

      <div className="dashboard-stats-grid">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <Card
              title="Employés"
              value={stats.emp}
              link="/admin/employees"
              color="blue"
              icon={<Icons.Users />}
            />
            <Card
              title="Départements"
              value={stats.dep}
              link="/admin/departments"
              color="purple"
              icon={<Icons.Building />}
            />
            <Card
              title="Tâches"
              value={stats.task}
              link="/admin/tasks"
              color="amber"
              icon={<Icons.Check />}
            />
            <Card
              title="Congés"
              value={stats.leave}
              link="/admin/leave-requests"
              color="red"
              icon={<Icons.Calendar />}
            />
            <Card
              title="Managers"
              value={stats.managers}
              link="/admin/managers"
              color="emerald"
              icon={<Icons.Shield />}
            />
            <Card
              title="Rôles"
              value={stats.roles}
              link="/admin/roles"
              color="orange"
              icon={<Icons.Shield />}
            />
            <Card
              title="Annonces"
              value={stats.announcements}
              link="/admin/announcements"
              color="indigo"
              icon={<Icons.Calendar />}
            />
            <Card
              title="Présences"
              value={stats.presences}
              link="/admin/presences"
              color="cyan"
              icon={<Icons.Check />}
            />
          </>
        )}
      </div>

      <div className="quick-actions-section">
        <h2 className="section-title-small">Actions rapides</h2>
        <div className="quick-actions-row">
          <Link to="/admin/employees/create" className="q-btn bg-blue">
            <Icons.Plus /> Employé
          </Link>
          <Link to="/admin/announcements/create" className="q-btn bg-indigo">
            <Icons.Plus /> Annonce
          </Link>
          <Link to="/admin/tasks/create" className="q-btn bg-amber">
            <Icons.Plus /> Tâche
          </Link>
          <Link to="/admin/leave-requests" className="q-btn bg-red">
            <Icons.Calendar /> Congés
          </Link>
        </div>
      </div>

      <div className="dashboard-recent-grid">
        <Section
          title="Employés récents"
          link="/admin/employees"
          loading={loading}
        >
          {recentEmployees.map((e) => (
            <div key={e.id} className="item-row">
              <div className="item-avatar">{e.first_name?.[0]}</div>
              <div className="item-info">
                <span className="item-main">
                  {e.first_name} {e.last_name}
                </span>
                <span className="item-sub text-truncate">{e.email}</span>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Présences" link="/admin/presences" loading={loading}>
          {recentPresences.map((p) => (
            <div key={p.id} className="item-row space-between">
              <div className="item-info">
                <span className="item-main">
                  {p.employee?.first_name} {p.employee?.last_name}
                </span>
                <span className="item-sub">{p.date}</span>
              </div>
              <span
                className={`status-badge ${
                  p.status === "présent" ? "st-green" : "st-red"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </Section>

        <Section title="Annonces" link="/admin/announcements" loading={loading}>
          {recentAnnouncements.map((a) => (
            <div key={a.id} className="item-row">
              <div className="item-info">
                <span className="item-main">{a.title}</span>
                <span className="item-sub">
                  {a.message?.substring(0, 35)}...
                </span>
              </div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Card({ title, value, link, icon }: any) {
  return (
    <div className="stat-card-premium">
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-details">
        <span className="stat-label">{title}</span>
        <span className="stat-val">{value}</span>
        <Link to={link} className="stat-link">
          Voir détails
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children, link, loading }: any) {
  return (
    <div className="content-section-premium">
      <div className="section-header">
        <h2>{title}</h2>
        <Link to={link}>Voir tout</Link>
      </div>
      <div className="section-content">
        {loading ? (
          <div className="loading-small">Chargement...</div>
        ) : children.length > 0 ? (
          children
        ) : (
          <p className="empty-text">Aucune donnée.</p>
        )}
      </div>
    </div>
  );
}
