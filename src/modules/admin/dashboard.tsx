// src/modules/admin/dashboard.tsx

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
    console.log("Dashboard admin - Utilisateur:", user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Charger TOUTES les statistiques via une seule Promise.all
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
        api.get("/employees").catch((err) => {
          console.error("Erreur employees:", err);
          return { data: [] };
        }),
        api.get("/departments").catch((err) => {
          console.error("Erreur departments:", err);
          return { data: [] };
        }),
        api.get("/tasks").catch((err) => {
          console.error("Erreur tasks:", err);
          return { data: [] };
        }),
        api.get("/leave-requests").catch((err) => {
          console.error("Erreur leave_requests:", err);
          return { data: [] };
        }),
        api.get("/managers").catch((err) => {
          console.error("Erreur managers:", err);
          return { data: [] };
        }),
        api.get("/roles").catch((err) => {
          console.error("Erreur roles:", err);
          return { data: [] };
        }),
        api.get("/announcements").catch((err) => {
          console.error("Erreur announcements:", err);
          return { data: [] };
        }),
        api.get("/presences").catch((err) => {
          console.error("Erreur presences:", err);
          return { data: [] };
        }),
      ]);

      // 🔍 LOG DÉTAILLÉ POUR DEBUG
      console.log("📊 Réponse Departments:", departmentsRes.data);
      console.log("📊 Réponse Employees:", employeesRes.data);

      // ✅ FONCTION HELPER POUR EXTRAIRE LE TOTAL
      const getTotal = (response: any): number => {
        // Cas 1: response.data est directement un tableau
        if (Array.isArray(response.data)) {
          console.log("Format: Array direct", response.data.length);
          return response.data.length;
        }
        
        // Cas 2: response.data contient un champ 'total'
        if (response.data?.total !== undefined) {
          console.log("Format: avec total", response.data.total);
          return response.data.total;
        }
        
        // Cas 3: response.data contient un champ 'data' qui est un tableau
        if (Array.isArray(response.data?.data)) {
          console.log("Format: avec data array", response.data.data.length);
          return response.data.data.length;
        }
        
        // Cas 4: Pagination Laravel standard
        if (response.data?.meta?.total !== undefined) {
          console.log("Format: pagination meta", response.data.meta.total);
          return response.data.meta.total;
        }
        
        console.log("Format inconnu, retour 0");
        return 0;
      };

      // Calculer les stats avec la fonction helper
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

      console.log("📈 Stats calculées:", newStats);
      setStats(newStats);

      // ✅ FONCTION HELPER POUR EXTRAIRE LES DONNÉES
      const getData = (response: any): any[] => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response.data?.data)) {
          return response.data.data;
        }
        return [];
      };

      // Récents employés (prendre les 5 premiers)
      setRecentEmployees(getData(employeesRes).slice(0, 5));

      // Récents annonces
      setRecentAnnouncements(getData(announcementsRes).slice(0, 5));
      
      // Récents présences
      setRecentPresences(getData(presencesRes).slice(0, 5));

    } catch (err: any) {
      console.error("❌ Erreur chargement dashboard:", err);
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
        <button
          onClick={loadDashboardData}
          className="bg-blue-dark"
          style={{ marginTop: "15px", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", color: "white" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-welcome">Bienvenue {user?.name}</p>
      </div>

      {/* STATS - UTILISE LA CLASSE POUR LE LAYOUT 4 COLONNES */}
      <div className="dashboard-stats-grid">
        
        <Card
          title="Employés"
          value={stats.total_employees || 0}
          link="/admin/employees"
          colorClass="text-blue"
        />
        <Card
          title="Départements"
          value={stats.total_departments || 0}
          link="/admin/departments"
          colorClass="text-purple"
        />
        <Card
          title="Tâches"
          value={stats.total_tasks || 0}
          link="/admin/tasks"
          colorClass="text-amber"
        />
        <Card
          title="Demandes de congés"
          value={stats.total_leave_requests || 0}
          link="/admin/leave_requests"
          colorClass="text-red"
        />
        
        <Card
          title="Managers"
          value={stats.total_managers || 0}
          link="/admin/managers"
          colorClass="text-emerald"
        />
        <Card
          title="Rôles"
          value={stats.total_roles || 0}
          link="/admin/roles"
          colorClass="text-orange"
        />
        <Card
          title="Annonces"
          value={stats.total_announcements || 0}
          link="/admin/announcements"
          colorClass="text-indigo"
        />
        
        <Card
          title="Présences enregistrées"
          value={stats.total_presences || 0}
          link="/admin/presences"
          colorClass="text-cyan"
        />
      </div>

      {/* GRID LAYOUT - UTILISE LA CLASSE POUR LE LAYOUT 4 COLONNES */}
      <div className="dashboard-content-grid">

        {/* RECENT EMPLOYEES */}
        <Section title="Derniers employés ajoutés">
          {recentEmployees.length === 0 ? (
            <p style={{ color: "#666" }}>Aucun employé.</p>
          ) : (
            <ul className="section-list">
              {recentEmployees.map(e => (
                <li key={e.id}>
                  <strong>{e.first_name} {e.last_name}</strong>
                  <br />
                  <small style={{ color: "#666" }}>
                    {e.email}
                    {e.department && ` • ${e.department.name}`}
                  </small>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/employees" className="section-link">
            Voir tous les employés →
          </Link>
        </Section>

        {/* RECENT PRESENCES */}
        <Section title="Présences récentes">
          {recentPresences.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune présence enregistrée.</p>
          ) : (
            <ul className="section-list">
              {recentPresences.map(p => (
                <li key={p.id}>
                  {p.employee ? (
                    <>
                      <strong>{p.employee.first_name} {p.employee.last_name}</strong>
                      <br />
                    </>
                  ) : (
                    <>
                      <strong>Employé inconnu</strong>
                      <br />
                    </>
                  )}
                  <small style={{ color: "#666" }}>
                    {p.date} — <span style={{
                      padding: "2px 6px",
                      borderRadius: "3px",
                      backgroundColor: p.status === "présent" ? "#d4edda" : "#f8d7da",
                      color: p.status === "présent" ? "#155724" : "#721c24",
                      fontSize: "11px"
                    }}>{p.status}</span>
                  </small>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/presences" className="section-link">
            Gérer les présences →
          </Link>
        </Section>

        {/* RECENT ANNOUNCEMENTS */}
        <Section title="Dernières annonces">
          {recentAnnouncements.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune annonce.</p>
          ) : (
            <ul className="section-list">
              {recentAnnouncements.map(a => (
                <li key={a.id}>
                  <strong>{a.title}</strong>
                  {a.message && (
                    <>
                      <br />
                      <small style={{ color: "#666" }}>
                        {a.message.substring(0, 80)}
                        {a.message.length > 80 && "..."}
                      </small>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: "10px" }}>
            <Link
              to="/admin/announcements/create"
              className="bg-blue-dark"
              style={{ display: "inline-block", padding: "8px 15px", color: "white", textDecoration: "none", borderRadius: "5px", fontSize: "14px", marginRight: "10px" }}
            >
              + Publier une annonce
            </Link>
            <Link to="/admin/announcements" className="section-link">
              Voir toutes →
            </Link>
          </div>
        </Section>

        {/* ACTIONS RAPIDES */}
        <Section title="Actions rapides">
          <div className="quick-actions-list">
            <Link
              to="/admin/employees/create"
              className="bg-blue"
            >
              + Créer un employé
            </Link>
            <Link
              to="/admin/departments/create"
              className="bg-purple"
            >
              + Ajouter un département
            </Link>
            <Link
              to="/admin/tasks/create"
              className="bg-amber"
            >
              + Créer une tâche
            </Link>
            <Link
              to="/admin/leave_requests"
              className="bg-red"
            >
              Gérer les congés
            </Link>
            <Link
              to="/admin/roles/create"
              className="bg-orange"
            >
              + Créer un rôle
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Card({ title, value, link, colorClass }: {
  title: string;
  value: number;
  link: string;
  colorClass: string;
}) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className={colorClass}>
        {value}
      </p>
      <Link to={link} className={colorClass}>
        Gérer →
      </Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="dashboard-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}