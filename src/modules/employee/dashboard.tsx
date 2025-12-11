// src/modules/employee/dashboard.tsx

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";

interface Presence {
  id: number;
  date: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
}

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
}

interface Announcement {
  id: number;
  title: string;
  content?: string;
  created_at: string;
}

export default function EmployeeDashboard() {
  // 🔑 Importation de 'logout' pour pouvoir déconnecter l'utilisateur
  const { user, employee, logout } = useContext(AuthContext); 
  
  const employeeId = employee?.id;

  const [presences, setPresences] = useState<Presence[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔍 Dashboard employé - Données:", { user, employee, employeeId });
    
    if (!employeeId) {
      console.warn("⚠️ Pas d'ID employé trouvé");
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [employeeId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Assurez-vous que '/me/presences' et les autres routes sont bien implémentées côté backend
      const [presencesRes, tasksRes, leavesRes, announcementsRes] = await Promise.all([
        api.get("/me/presences").catch(err => {
          console.warn("⚠️ Erreur presences:", err);
          return { data: [] };
        }),
        api.get("/me/tasks").catch(err => {
          console.warn("⚠️ Erreur tasks:", err);
          return { data: [] };
        }),
        api.get("/me/leave-requests").catch(err => {
          console.warn("⚠️ Erreur leaves:", err);
          return { data: [] };
        }),
        api.get("/me/announcements").catch(err => {
          console.warn("⚠️ Erreur announcements:", err);
          return { data: [] };
        }),
      ]);

      setPresences(Array.isArray(presencesRes.data) ? presencesRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      setAnnouncements(Array.isArray(announcementsRes.data) ? announcementsRes.data : []);
    } catch (err: any) {
      console.error("❌ Erreur chargement dashboard:", err);
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* 🎯 AJOUT du bouton de déconnexion en haut */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: "28px" }}>
          Bienvenue {user?.name || employee?.first_name}
        </h1>
        <button 
          onClick={logout} 
          style={{
            padding: "8px 15px",
            backgroundColor: "#dc3545", // Rouge
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Déconnexion
        </button>
      </div>
      
      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          <p style={{ color: "#c00", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* INFO EMPLOYÉ */}
      <div style={{
        border: "1px solid #e0e0e0",
        padding: "20px",
        marginBottom: "30px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>Informations personnelles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          <p><strong>Nom :</strong> {employee?.first_name} {employee?.last_name}</p>
          <p><strong>Email :</strong> {employee?.email || user?.email}</p>
          <p><strong>Rôle :</strong> {user?.role}</p>
          <p><strong>Département :</strong> {employee?.department?.name || "-"}</p>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
        
        {/* MES TÂCHES */}
        <Section title="Mes tâches">
          {tasks.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune tâche assignée.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {tasks.slice(0, 5).map(t => (
                <li key={t.id} style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "5px"
                }}>
                  <strong>{t.title}</strong>
                  <br />
                  <small style={{ color: "#666" }}>
                    Statut: {t.status}
                    {t.due_date && ` • Échéance: ${t.due_date}`}
                  </small>
                </li>
              ))}
            </ul>
          )}
          <Link to="/employee/tasks" style={{
            display: "inline-block",
            marginTop: "10px",
            color: "#0066cc",
            textDecoration: "none"
          }}>
            Voir toutes mes tâches →
          </Link>
        </Section>

        {/* MES PRÉSENCES */}
        <Section title="Mes présences">
          {presences.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune présence enregistrée.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {presences.slice(0, 5).map(p => (
                <li key={p.id} style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "5px"
                }}>
                  {p.date} — <span style={{
                    padding: "2px 8px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    backgroundColor: p.status === "présent" ? "#d4edda" : "#f8d7da",
                    color: p.status === "présent" ? "#155724" : "#721c24"
                  }}>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/employee/presences" style={{
            display: "inline-block",
            marginTop: "10px",
            color: "#0066cc",
            textDecoration: "none"
          }}>
            Voir mon historique →
          </Link>
        </Section>

        {/* MES DEMANDES DE CONGÉS */}
        <Section title="Mes demandes de congés">
          {leaves.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune demande de congé.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {leaves.slice(0, 5).map(l => (
                <li key={l.id} style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "5px"
                }}>
                  {l.start_date} → {l.end_date}
                  <br />
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    backgroundColor: 
                      l.status === "approuvé" ? "#d4edda" :
                      l.status === "refusé" ? "#f8d7da" : "#fff3cd",
                    color:
                      l.status === "approuvé" ? "#155724" :
                      l.status === "refusé" ? "#721c24" : "#856404"
                  }}>
                    {l.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: "10px" }}>
            <Link to="/employee/leave_requests/create" style={{
              display: "inline-block",
              padding: "8px 15px",
              backgroundColor: "#0066cc",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "14px"
            }}>
              + Faire une demande
            </Link>
          </div>
        </Section>

        {/* DERNIÈRES ANNONCES */}
        <Section title="Dernières annonces">
          {announcements.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune annonce.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {announcements.slice(0, 5).map(a => (
                <li key={a.id} style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "5px"
                }}>
                  <strong>{a.title}</strong>
                  {a.content && (
                    <>
                      <br />
                      <small style={{ color: "#666" }}>
                        {a.content.substring(0, 100)}
                        {a.content.length > 100 && "..."}
                      </small>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link to="/employee/announcements" style={{
            display: "inline-block",
            marginTop: "10px",
            color: "#0066cc",
            textDecoration: "none"
          }}>
            Voir toutes les annonces →
          </Link>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style={{
      border: "1px solid #e0e0e0",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: "#fff"
    }}>
      <h2 style={{
        fontSize: "18px",
        marginBottom: "15px",
        borderBottom: "2px solid #0066cc",
        paddingBottom: "10px"
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}