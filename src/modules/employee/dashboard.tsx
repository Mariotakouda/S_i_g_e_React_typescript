import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";

// Types inchangés...
interface Presence { id: number; date: string; status: string; }
interface Task { id: number; title: string; description?: string; due_date?: string; status: string; }
interface LeaveRequest { id: number; start_date: string; end_date: string; status: string; reason?: string; }
interface Announcement { id: number; title: string; content?: string; created_at: string; }

export default function EmployeeDashboard() {
  const { user, employee, logout } = useContext(AuthContext);
  const employeeId = employee?.id;

  const [presences, setPresences] = useState<Presence[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }
    loadDashboardData();
  }, [employeeId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [presencesRes, tasksRes, leavesRes, announcementsRes] = await Promise.all([
        api.get("/me/presences").catch(() => ({ data: [] })),
        api.get("/me/tasks").catch(() => ({ data: [] })),
        api.get("/me/leave_requests").catch(() => ({ data: [] })),
        api.get("/me/announcements").catch(() => ({ data: [] })),
      ]);
      setPresences(Array.isArray(presencesRes.data) ? presencesRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      setAnnouncements(Array.isArray(announcementsRes.data) ? announcementsRes.data : []);
    } catch (err: any) {
      setError("Impossible de charger les données du tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeave = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette demande ?")) return;
    try {
      await api.delete(`/me/leave_requests/${id}`);
      setLeaves(leaves.filter(l => l.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
       <p>Chargement de votre espace employé...</p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: "#f8fafc", 
      minHeight: "100vh", 
      padding: "40px 20px", 
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#1e293b"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER PROFESSIONNEL */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "20px"
        }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0, color: "#0f172a", letterSpacing: "-0.025em" }}>
              Tableau de bord
            </h1>
            <p style={{ color: "#64748b", marginTop: "4px" }}>Bienvenue, {user?.name || employee?.first_name}. Voici votre résumé du jour.</p>
          </div>
          <button 
            onClick={logout} 
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#fff", 
              color: "#ef4444", 
              border: "1px solid #fee2e2", 
              borderRadius: "8px", 
              cursor: "pointer", 
              fontWeight: "600",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
          >
            Déconnexion
          </button>
        </header>

        {error && <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "12px", marginBottom: "30px", border: "1px solid #fee2e2" }}>{error}</div>}

        {/* CARTE INFOS PERSONNELLES STYLE 'PROFILE' */}
        <div style={{ 
          backgroundColor: "#fff", 
          padding: "24px", 
          borderRadius: "16px", 
          marginBottom: "40px", 
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "30px",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            backgroundColor: "#3b82f6", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            fontSize: "32px", 
            color: "#fff",
            fontWeight: "bold"
          }}>
            {employee?.first_name?.charAt(0)}{employee?.last_name?.charAt(0)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "40px", flex: 1 }}>
            <div><label style={labelStyle}>NOM COMPLET</label><p style={dataStyle}> {employee?.last_name} {employee?.first_name}</p></div>
            <div><label style={labelStyle}>EMAIL</label><p style={dataStyle}>{employee?.email || user?.email}</p></div>
            <div><label style={labelStyle}>DÉPARTEMENT</label><p style={dataStyle}>{employee?.department?.name || "Général"}</p></div>
            <div><label style={labelStyle}>RÔLE</label><p style={dataStyle}>{employee?.roles && employee.roles.length > 0? employee.roles.map((r) => r.name).join(", "): "Aucun rôle"}</p></div>
            <div><label style={labelStyle}>STATUT</label><p style={dataStyle}><span style={{ color: "#10b981" }}>●</span> Actif</p></div>
          </div>
        </div>

        {/* GRID LAYOUT DES SECTIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "30px" }}>
          
          <Section title="Missions & Tâches" link="/employee/tasks">
            {tasks.length === 0 ? <p style={emptyStyle}>Aucune tâche en attente.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {tasks.slice(0, 3).map(t => (
                  <li key={t.id} style={listItemStyle}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{t.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", alignItems: "center" }}>
                      <span style={statusBadgeStyle("#eff6ff", "#3b82f6")}>{t.status}</span>
                      <small style={{ color: "#94a3b8" }}>{t.due_date ? `Échéance: ${new Date(t.due_date).toLocaleDateString()}` : ""}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Présence & Pointage" link="/employee/presences">
            {presences.length === 0 ? <p style={emptyStyle}>Aucun historique récent.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {presences.slice(0, 3).map(p => (
                  <li key={p.id} style={{ ...listItemStyle, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "500" }}>{new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <span style={statusBadgeStyle(p.status === "présent" ? "#ecfdf5" : "#fef2f2", p.status === "présent" ? "#10b981" : "#ef4444")}>
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Gestion des Congés" link="/employee/leave_requests">
             <div style={{ marginBottom: "20px" }}>
                <Link to="/employee/leave_requests/create" style={primaryButtonStyle}>+ Nouvelle demande</Link>
             </div>
            {leaves.length === 0 ? <p style={emptyStyle}>Aucune demande enregistrée.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {leaves.slice(0, 3).map(l => (
                  <li key={l.id} style={listItemStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "600" }}>Du {l.start_date} au {l.end_date}</div>
                        <div style={{ marginTop: "6px" }}>
                          <span style={statusBadgeStyle(l.status === "approuvé" ? "#ecfdf5" : "#fffbeb", l.status === "approuvé" ? "#10b981" : "#f59e0b")}>
                            {l.status}
                          </span>
                        </div>
                      </div>
                      {(l.status === "pending" || l.status === "en attente") && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/employee/leave_requests/edit/${l.id}`} style={actionLinkStyle("#3b82f6")}>Modifier</Link>
                          <button onClick={() => handleDeleteLeave(l.id)} style={{ ...actionLinkStyle("#ef4444"), background: "none", border: "none", cursor: "pointer" }}>Annuler</button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Communications Internes" link="/employee/announcements">
            {announcements.length === 0 ? <p style={emptyStyle}>Aucune annonce officielle.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {announcements.slice(0, 3).map(a => (
                  <li key={a.id} style={{ ...listItemStyle, borderLeft: "4px solid #3b82f6" }}>
                    <div style={{ fontWeight: "600" }}>{a.title}</div>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Direction Générale</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}

// COMPOSANT SECTION STYLISÉ
function Section({ title, children, link }: { title: string; children: any; link?: string }) {
  return (
    <div style={{ 
      backgroundColor: "#fff", 
      padding: "24px", 
      borderRadius: "16px", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #f1f5f9"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0 }}>{title}</h2>
        {link && <Link to={link} style={{ fontSize: "13px", color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>Voir tout</Link>}
      </div>
      {children}
    </div>
  );
}

// OBJETS DE STYLE RÉUTILISABLES
const labelStyle = { display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px", letterSpacing: "0.05em" };
const dataStyle = { margin: 0, fontSize: "15px", fontWeight: "600", color: "#1e293b" };
const emptyStyle = { color: "#94a3b8", fontSize: "14px", fontStyle: "italic", textAlign: "center" as const, padding: "20px 0" };
const listItemStyle = { 
  padding: "16px", 
  backgroundColor: "#f8fafc", 
  borderRadius: "12px", 
  marginBottom: "12px",
  border: "1px solid #f1f5f9"
};
const statusBadgeStyle = (bg: string, color: string) => ({
  backgroundColor: bg,
  color: color,
  padding: "4px 12px",
  borderRadius: "9999px",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const
});
const primaryButtonStyle = {
  display: "inline-block",
  padding: "10px 20px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
};
const actionLinkStyle = (color: string) => ({
  color: color,
  fontSize: "12px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "4px 8px",
  borderRadius: "6px",
  border: `1px solid ${color}22`
});