import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Link } from 'react-router';

interface LeaveRequest {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  status: 'approved' | 'rejected' | 'en attente' | 'approuvé' | 'refusé';
  message: string;
  created_at: string;
}

export default function EmployeeLeaveHistory() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/me/leave-requests');
      setLeaves(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'historique.");
    } finally {
      setLoading(false);
    }
  };

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
      padding: "20px 15px", // Réduit pour mobile
      fontFamily: "'Inter', sans-serif" 
    }}>
      {/* Injection CSS pour le responsive 425px */}
      <style>{`
        @media (max-width: 425px) {
          .responsive-table thead { display: none; }
          .responsive-table tr { 
            display: block; 
            margin-bottom: 15px; 
            padding: 15px;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px;
          }
          .responsive-table td { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 8px 0 !important;
            border: none !important;
            width: 100% !important;
            font-size: 14px;
          }
          .responsive-table td::before {
            content: attr(data-label);
            font-weight: 700;
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
          }
          .header-container { flex-direction: column; gap: 15px; align-items: flex-start !important; }
          .btn-new { width: 100%; text-align: center; }
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Navigation & Header */}
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Mes absences</h1>
          
          <Link
            to="/employee/leave-requests/create"
            className="btn-new"
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
          backgroundColor: leaves.length === 0 ? "transparent" : "#fff", 
          borderRadius: "16px", 
          boxShadow: leaves.length === 0 ? "none" : "0 4px 6px -1px rgba(0,0,0,0.05)", 
          border: leaves.length === 0 ? "none" : "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          {leaves.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
              <p style={{ fontSize: "16px" }}>Aucune demande de congé trouvée.</p>
            </div>
          ) : (
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>TYPE</th>
                  <th style={thStyle}>PÉRIODE</th>
                  <th style={thStyle}>SOUMIS LE</th>
                  <th style={thStyle}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l, index) => {
                  const status = getStatusStyle(l.status);
                  return (
                    <tr key={l.id} style={{ 
                      borderBottom: index === leaves.length - 1 ? "none" : "1px solid #f1f5f9"
                    }}>
                      <td style={tdStyle} data-label="Type">
                        <div style={{ fontWeight: "700", color: "#1e293b" }}>
                          {l.type.toUpperCase()}
                        </div>
                        {l.message && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{l.message}</div>}
                      </td>

                      <td style={tdStyle} data-label="Période">
                        <div style={{ color: "#334155", fontWeight: "500", fontSize: "13px" }}>
                          {new Date(l.start_date).toLocaleDateString('fr-FR')} → {new Date(l.end_date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>

                      <td style={tdStyle} data-label="Soumis le">
                        <span style={{ color: "#64748b", fontSize: "13px" }}>{new Date(l.created_at).toLocaleDateString('fr-FR')}</span>
                      </td>

                      <td style={tdStyle} data-label="Statut">
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

const thStyle: React.CSSProperties = {
  padding: "16px 24px",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  letterSpacing: "0.05em"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 24px",
  verticalAlign: "middle"
};