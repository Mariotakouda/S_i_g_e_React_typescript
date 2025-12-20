import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';

interface LeaveRequest {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'en attente' | 'approuvé' | 'refusé';
  message: string;
  created_at: string;
}

export default function EmployeeLeaveHistory() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/me/leave_requests');
      setLeaves(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'historique.");
    } finally {
      setLoading(false);
    }
  };

  // Helper pour les badges de statut
  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'approuvé') return { bg: "#ecfdf5", color: "#10b981", label: "Approuvé" };
    if (s === 'rejected' || s === 'refusé') return { bg: "#fef2f2", color: "#ef4444", label: "Refusé" };
    return { bg: "#fffbeb", color: "#f59e0b", label: "En attente" };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#64748b' }}>Chargement de vos archives...</p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: "#f8fafc", 
      minHeight: "100vh", 
      padding: "40px 20px", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <button 
              onClick={() => navigate(-1)} 
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ← Retour au Dashboard
            </button>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Historique des absences</h1>
          </div>
          
          <Link
            to="/employee/leave_requests/create"
            style={{ 
              padding: "12px 24px", 
              backgroundColor: "#3b82f6", 
              color: "#fff", 
              borderRadius: "10px", 
              textDecoration: "none", 
              fontWeight: "600",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)" 
            }}
          >
            + Nouvelle demande
          </Link>
        </div>

        {error && <div style={{ padding: "15px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fee2e2" }}>{error}</div>}

        {/* Table Card */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "16px", 
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", 
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          {leaves.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
              <p style={{ fontSize: "18px" }}>Aucune demande de congé trouvée dans vos archives.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>TYPE</th>
                  <th style={thStyle}>PÉRIODE D'ABSENCE</th>
                  <th style={thStyle}>DATE DE SOUMISSION</th>
                  <th style={thStyle}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l, index) => {
                  const status = getStatusStyle(l.status);
                  return (
                    <tr key={l.id} style={{ 
                      borderBottom: index === leaves.length - 1 ? "none" : "1px solid #f1f5f9",
                      transition: "background-color 0.2s"
                    }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: "700", color: "#1e293b" }}>
                          {l.type.toUpperCase()}
                        </div>
                        {l.message && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{l.message}</div>}
                      </td>
                      <tr>
                        <td style={tdStyle}>
                          <div style={{ color: "#334155", fontWeight: "500" }}>
                            Du {new Date(l.start_date).toLocaleDateString('fr-FR')}
                          </div>
                        </td> 
                        <td style={tdStyle}>
                          <div style={{ color: "#334155", fontWeight: "500" }}>
                            Au {new Date(l.end_date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                      </tr>

                      <td style={tdStyle}>
                        <span style={{ color: "#64748b" }}>{new Date(l.created_at).toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: status.bg,
                          color: status.color,
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles constants
const thStyle: React.CSSProperties = {
  padding: "16px 24px",
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748b",
  letterSpacing: "0.05em"
};

const tdStyle: React.CSSProperties = {
  padding: "20px 24px",
  verticalAlign: "top"
};