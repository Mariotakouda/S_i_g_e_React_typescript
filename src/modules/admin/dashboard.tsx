import { useEffect, useState, useContext } from "react";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css"; 

interface Stats {
  total_employees?: number;
  total_departments?: number;
  total_tasks?: number;
  total_leave_requests?: number;
  total_managers?: number;
  total_roles?: number;
  total_announcements?: number;
  total_presences?: number; 
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: { name: string };
}

interface Presence {
  id: number;
  date: string;
  status: string;
  employee?: Employee;
}

interface Announcement {
  id: number;
  title: string;
  message?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState<Stats>({
    total_employees: 0,
    total_departments: 0,
    total_tasks: 0,
    total_leave_requests: 0,
    total_managers: 0,
    total_roles: 0,
    total_announcements: 0,
    total_presences: 0, 
  });
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [recentPresences, setRecentPresences] = useState<Presence[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        employeesRes,
        departmentsRes,
        tasksRes,
        leaveRequestsRes,
        managersRes,
        rolesRes,
        announcementsRes,
        presencesRes,
      ] = await Promise.all([
        api.get("/employees").catch((err) => { console.error("Erreur employees:", err); return { data: [] }; }),
        api.get("/departments").catch((err) => { console.error("Erreur departments:", err); return { data: [] }; }),
        api.get("/tasks").catch((err) => { console.error("Erreur tasks:", err); return { data: [] }; }),
        api.get("/leave-requests").catch((err) => { console.error("Erreur leave-requests:", err); return { data: [] }; }),
        api.get("/managers").catch((err) => { console.error("Erreur managers:", err); return { data: [] }; }),
        api.get("/roles").catch((err) => { console.error("Erreur roles:", err); return { data: [] }; }),
        api.get("/announcements").catch((err) => { console.error("Erreur announcements:", err); return { data: [] }; }),
        api.get("/presences").catch((err) => { console.error("Erreur presences:", err); return { data: [] }; }),
      ]);

      const getTotal = (response: any): number => {
        if (Array.isArray(response.data)) return response.data.length;
        if (response.data?.total !== undefined) return response.data.total;
        if (Array.isArray(response.data?.data)) return response.data.data.length;
        if (response.data?.meta?.total !== undefined) return response.data.meta.total;
        return 0;
      };

      const newStats = {
        total_employees: getTotal(employeesRes),
        total_departments: getTotal(departmentsRes),
        total_tasks: getTotal(tasksRes),
        total_leave_requests: getTotal(leaveRequestsRes),
        total_managers: getTotal(managersRes),
        total_roles: getTotal(rolesRes),
        total_announcements: getTotal(announcementsRes),
        total_presences: getTotal(presencesRes),
      };

      setStats(newStats);

      const getData = (response: any): any[] => {
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.data?.data)) return response.data.data;
        return [];
      };

      setRecentEmployees(getData(employeesRes).slice(0, 5));
      setRecentAnnouncements(getData(announcementsRes).slice(0, 5));
      setRecentPresences(getData(presencesRes).slice(0, 5));

    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container loading-message">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-message">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
        <button onClick={loadDashboardData} className="bg-blue-dark btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Adminitrator Dashboard</h1>
        <p className="dashboard-welcome">Bienvenue {user?.name}</p>
      </div>

      <div className="dashboard-stats-grid">
        <Card title="Employés" value={stats.total_employees || 0} link="/admin/employees" colorClass="text-blue" />
        <Card title="Départements" value={stats.total_departments || 0} link="/admin/departments" colorClass="text-purple" />
        <Card title="Tâches" value={stats.total_tasks || 0} link="/admin/tasks" colorClass="text-amber" />
        <Card title="Demandes de congés" value={stats.total_leave_requests || 0} link="/admin/leave-requests" colorClass="text-red" />
        <Card title="Managers" value={stats.total_managers || 0} link="/admin/managers" colorClass="text-emerald" />
        <Card title="Rôles" value={stats.total_roles || 0} link="/admin/roles" colorClass="text-orange" />
        <Card title="Annonces" value={stats.total_announcements || 0} link="/admin/announcements" colorClass="text-indigo" />
        <Card title="Présences enregistrées" value={stats.total_presences || 0} link="/admin/presences" colorClass="text-cyan" />
      </div>

      <div className="dashboard-content-grid">
        <Section title="Derniers employés ajoutés">
          {recentEmployees.length === 0 ? <p className="text-muted">Aucun employé.</p> : (
            <ul className="section-list">
              {recentEmployees.map(e => (
                <li key={e.id}>
                  <strong>{e.first_name} {e.last_name}</strong><br />
                  <small className="text-muted">{e.email} {e.department && ` • ${e.department.name}`}</small>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/employees" className="section-link">Voir tous les employés →</Link>
        </Section>

        <Section title="Présences récentes">
          {recentPresences.length === 0 ? <p className="text-muted">Aucune présence.</p> : (
            <ul className="section-list">
              {recentPresences.map(p => (
                <li key={p.id}>
                  <strong>{p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : "Inconnu"}</strong><br />
                  <small className="text-muted">{p.date} — <span className={`badge-status ${p.status === "présent" ? "present" : "absent"}`}>{p.status}</span></small>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/presences" className="section-link">Gérer les présences →</Link>
        </Section>

        <Section title="Dernières annonces">
          {recentAnnouncements.length === 0 ? <p className="text-muted">Aucune annonce.</p> : (
            <ul className="section-list">
              {recentAnnouncements.map(a => (
                <li key={a.id}>
                  <strong>{a.title}</strong>
                  {a.message && <><br /><small className="text-muted">{a.message.substring(0, 80)}...</small></>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2">
            <Link to="/admin/announcements/create" className="bg-blue-dark btn-small"> + Publier</Link>
            <Link to="/admin/announcements" className="section-link ml-2">Voir toutes →</Link>
          </div>
        </Section>

        <Section title="Actions rapides">
          <div className="quick-actions-list">
            <Link to="/admin/employees/create" className="bg-blue">+ Créer un employé</Link>
            <Link to="/admin/departments/create" className="bg-purple">+ Ajouter un département</Link>
            <Link to="/admin/tasks/create" className="bg-amber">+ Créer une tâche</Link>
            <Link to="/admin/leave-requests" className="bg-red">Gérer les congés</Link>
            <Link to="/admin/roles/create" className="bg-orange">+ Créer un rôle</Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Card({ title, value, link, colorClass }: any) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className={colorClass}>{value}</p>
      <Link to={link} className={colorClass}>Gérer →</Link>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="dashboard-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}