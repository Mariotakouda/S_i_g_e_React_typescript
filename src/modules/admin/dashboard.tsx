// src/modules/admin/dashboard.tsx

import { useEffect, useState, useContext } from "react";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
// 💡 NOUVEAU: Importation du fichier CSS
import "./Dashboard.css"; 

// Mise à jour de l'interface Stats pour inclure toutes les entités
interface Stats {
  total_employees?: number;
  total_departments?: number;
  total_tasks?: number;
  total_leave_requests?: number;
  // CHAMPS AJOUTÉS PRÉCÉDEMMENT
  total_managers?: number;
  total_roles?: number;
  total_announcements?: number;
  // NOUVEAU CHAMP : Total des présences
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

// Mise à jour de l'interface Announcement pour s'assurer que `content` est facultatif
interface Announcement {
  id: number;
  title: string;
  message?: string; // S'assurer que le champ correspond au modèle Laravel (message)
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState<Stats>({
    total_employees: 0,
    total_departments: 0,
    total_tasks: 0,
    total_leave_requests: 0,
    // Initialisation des champs
    total_managers: 0,
    total_roles: 0,
    total_announcements: 0,
    // Initialisation de la présence
    total_presences: 0, 
  });
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [recentPresences, setRecentPresences] = useState<Presence[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔍 Dashboard admin - Utilisateur:", user);
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
        presencesRes, // Présences incluses pour le total et la liste récente
      ] = await Promise.all([
        api.get("/employees").catch(() => ({ data: { data: [], total: 0 } })),
        api.get("/departments").catch(() => ({ data: { data: [], total: 0 } })),
        api.get("/tasks").catch(() => ({ data: { data: [], total: 0 } })),
        api.get("/leave_requests").catch(() => ({ data: { data: [], total: 0 } })),
        api.get("/managers").catch(() => ({ data: { data: [], total: 0 } })), 
        api.get("/roles").catch(() => ({ data: { data: [], total: 0 } })), 
        api.get("/announcements").catch(() => ({ data: { data: [], total: 0 } })),
        api.get("/presences").catch(() => ({ data: { data: [], total: 0 } })), // MODIFIÉ : Récupérer le total
      ]);

      // Calculer les stats
      setStats({
        total_employees: employeesRes.data.total || employeesRes.data.data?.length || 0,
        total_departments: departmentsRes.data.total || departmentsRes.data.data?.length || 0,
        total_tasks: tasksRes.data.total || tasksRes.data.data?.length || 0,
        total_leave_requests: leaveRequestsRes.data.total || leaveRequestsRes.data.data?.length || 0,
        total_managers: managersRes.data.total || managersRes.data.data?.length || 0,
        total_roles: rolesRes.data.total || rolesRes.data.data?.length || 0,
        total_announcements: announcementsRes.data.total || announcementsRes.data.data?.length || 0,
        total_presences: presencesRes.data.total || presencesRes.data.data?.length || 0, // STATS PRESENCE AJOUTÉ
      });

      // Récents employés (prendre les 5 premiers)
      setRecentEmployees(
        Array.isArray(employeesRes.data.data)
          ? employeesRes.data.data.slice(0, 5)
          : []
      );

      // Récents annonces
      setRecentAnnouncements(
        Array.isArray(announcementsRes.data.data)
          ? announcementsRes.data.data.slice(0, 5)
          : []
      );
      
      // Récents présences
      setRecentPresences(
        Array.isArray(presencesRes.data.data)
          ? presencesRes.data.data.slice(0, 5)
          : []
      );

    } catch (err: any) {
      console.error("❌ Erreur chargement dashboard:", err);
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  // 💡 Remplacement des styles inline par des classes CSS
  if (loading) {
    return (
      <div className="admin-dashboard-container loading-message">
        <p>Chargement du dashboard...</p>
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
        <h1 className="dashboard-title">Dashboard Admin</h1>
        <p className="dashboard-welcome">Bienvenue {user?.name}</p>
      </div>

      {/* STATS - UTILISE LA CLASSE POUR LE LAYOUT 4 COLONNES */}
      <div className="dashboard-stats-grid">
        
        {/* Toutes les cartes utilisent le composant Card mis à jour */}
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
        
        {/* NOUVELLES CARTES DE STATISTIQUES */}
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
        
        {/* CARTE STATISTIQUE POUR LA PRÉSENCE */}
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
                  {a.message && ( // Utilisation de a.message au lieu de a.content
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
            {/* NOUVELLE ACTION RAPIDE */}
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

// Les composants Card et Section sont mis à jour pour utiliser les classes CSS
function Card({ title, value, link, colorClass }: {
  title: string;
  value: number;
  link: string;
  colorClass: string; // 💡 Remplacement de `color` par `colorClass` pour le CSS
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