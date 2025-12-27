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

  // --- LOGIQUE RESPONSIVE ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

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

  const getInitials = () => {
    return `${employee?.first_name?.charAt(0) || ''}${employee?.last_name?.charAt(0) || ''}`;
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
      padding: isMobile ? "20px 15px" : "40px 20px", 
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#1e293b"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER PROFESSIONNEL */}
        <header style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: '30px',
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "20px",
          gap: isMobile ? "15px" : "0"
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: "800", margin: 0, color: "#0f172a", letterSpacing: "-0.025em" }}>
              Tableau de bord
            </h1>
            <p style={{ color: "#64748b", marginTop: "4px", fontSize: isMobile ? "14px" : "16px" }}>Bienvenue, {user?.name || employee?.first_name}.</p>
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
              width: isMobile ? "100%" : "auto"
            }}
          >
            Déconnexion
          </button>
        </header>

        {error && <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "12px", marginBottom: "30px", border: "1px solid #fee2e2" }}>{error}</div>}

        {/* CARTE INFOS PERSONNELLES RESPONSIVE */}
        <div style={{ 
          backgroundColor: "#fff", 
          padding: isMobile ? "20px" : "24px", 
          borderRadius: "16px", 
          marginBottom: "30px", 
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: isTablet ? "column" : "row",
          alignItems: isTablet ? "center" : "center",
          gap: isMobile ? "20px" : "30px",
          border: "1px solid #f1f5f9"
        }}>
          <Link to="/employee/profile" style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{ 
                width: isMobile ? "70px" : "80px", 
                height: isMobile ? "70px" : "80px", 
                borderRadius: "50%", 
                backgroundColor: "#3b82f6", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                fontSize: "28px", 
                color: "#fff",
                fontWeight: "bold",
                border: "3px solid #3b82f6"
              }}>
                {employee?.profile_photo_url ? (
                    <img src={employee.profile_photo_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                ) : getInitials()}
            </div>
          </Link>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(5, 1fr)", 
            gap: isMobile ? "15px" : "25px", 
            flex: 1,
            width: "100%",
            textAlign: isTablet ? "center" : "left"
          }}>
            <div><label style={labelStyle}>NOM COMPLET</label><p style={dataStyle}> {employee?.last_name} {employee?.first_name}</p></div>
            <div><label style={labelStyle}>EMAIL</label><p style={dataStyle}>{employee?.email || user?.email}</p></div>
            <div><label style={labelStyle}>DÉPARTEMENT</label><p style={dataStyle}>{employee?.department?.name || "Général"}</p></div>
            <div><label style={labelStyle}>RÔLE</label><p style={dataStyle}>{employee?.roles?.[0]?.name || "Aucun"}</p></div>
            <div><label style={labelStyle}>STATUT</label><p style={dataStyle}><span style={{ color: "#10b981" }}>●</span> Actif</p></div>
          </div>
        </div>

        {/* GRID LAYOUT DES SECTIONS RESPONSIVE */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", 
          gap: "25px" 
        }}>
          
          <Section title="Missions & Tâches" link="/employee/tasks">
            {tasks.length === 0 ? <p style={emptyStyle}>Aucune tâche en attente.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {tasks.slice(0, 3).map(t => (
                  <li key={t.id} style={listItemStyle}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{t.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", alignItems: "center" }}>
                      <span style={statusBadgeStyle("#eff6ff", "#3b82f6")}>{t.status}</span>
                      <small style={{ color: "#94a3b8" }}>{t.due_date ? `${new Date(t.due_date).toLocaleDateString()}` : ""}</small>
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
                  <li key={p.id} style={{ ...listItemStyle, display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                    <span style={{ fontWeight: "500", fontSize: isMobile ? "13px" : "14px" }}>
                        {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
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
                <Link to="/employee/leave_requests/create" style={{ ...primaryButtonStyle, width: isMobile ? "100%" : "auto", textAlign: 'center' }}>+ Nouvelle demande</Link>
             </div>
            {leaves.length === 0 ? <p style={emptyStyle}>Aucune demande.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {leaves.slice(0, 3).map(l => (
                  <li key={l.id} style={listItemStyle}>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "13px" }}>Du {l.start_date} au {l.end_date}</div>
                        <span style={{ ...statusBadgeStyle(l.status === "approuvé" ? "#ecfdf5" : "#fffbeb", l.status === "approuvé" ? "#10b981" : "#f59e0b"), marginTop: '5px', display: 'inline-block' }}>
                            {l.status}
                        </span>
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

          <Section title="Communications" link="/employee/announcements">
            {announcements.length === 0 ? <p style={emptyStyle}>Aucune annonce.</p> : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {announcements.slice(0, 3).map(a => (
                  <li key={a.id} style={{ ...listItemStyle, borderLeft: "4px solid #3b82f6" }}>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>{a.title}</div>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Direction Générale</p>
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

// COMPOSANT SECTION ADAPTÉ
function Section({ title, children, link }: { title: string; children: any; link?: string }) {
  return (
    <div style={{ 
      backgroundColor: "#fff", 
      padding: "20px", 
      borderRadius: "16px", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #f1f5f9"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: 0 }}>{title}</h2>
        {link && <Link to={link} style={{ fontSize: "12px", color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>Voir tout</Link>}
      </div>
      {children}
    </div>
  );
}

// STYLES ADAPTÉS
const labelStyle = { display: "block", fontSize: "10px", fontWeight: "700", color: "#94a3b8", marginBottom: "2px", letterSpacing: "0.05em" };
const dataStyle = { margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b", wordBreak: "break-word" as any };
const emptyStyle = { color: "#94a3b8", fontSize: "13px", fontStyle: "italic", textAlign: "center" as const, padding: "15px 0" };
const listItemStyle = { 
  padding: "12px", 
  backgroundColor: "#f8fafc", 
  borderRadius: "10px", 
  marginBottom: "10px",
  border: "1px solid #f1f5f9"
};
const statusBadgeStyle = (bg: string, color: string) => ({
  backgroundColor: bg,
  color: color,
  padding: "3px 10px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: "700"
});
const primaryButtonStyle = {
  display: "block",
  padding: "10px 15px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600"
};
const actionLinkStyle = (color: string) => ({
  color: color,
  fontSize: "11px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "4px 6px",
  borderRadius: "6px",
  border: `1px solid ${color}44`
});