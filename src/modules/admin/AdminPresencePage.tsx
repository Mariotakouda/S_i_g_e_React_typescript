import React, { useEffect, useState, useCallback } from "react";
import { getAllPresences, type EmployeePresence } from "../presences/service";

export default function AdminPresencePage() {
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const loadAll = useCallback(async (dateFilter?: string) => {
  try {
    setLoading(true);
    const response = await getAllPresences(dateFilter ? { date: dateFilter } : undefined);
    
    // Laravel Paginate renvoie les données dans .data.data
    const fetchedData = response.data?.data || response.data || [];
    setPresences(fetchedData);
  } catch (err) {
    console.error("Erreur:", err);
    setPresences([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    loadAll(date); // Déclenche le filtrage API
  };

  const resetFilter = () => {
    setSelectedDate("");
    loadAll(); // Recharge toutes les données
  };

  const today = new Date().toISOString().split('T')[0];
  const presentTodayCount = presences.filter(p => p.date === today).length;

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 20px; maxWidth: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; min-height: 100vh; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        
        .filter-section { background: white; padding: 12px 16px; borderRadius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .date-input { border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; outline: none; font-size: 14px; color: #1e293b; cursor: pointer; }
        .reset-btn { background: #fee2e2; color: #b91c1c; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.2s; }
        .reset-btn:hover { background: #fecaca; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 24px; borderRadius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; }

        /* RESPONSIVE TABLE */
        .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }

        .mobile-cards { display: none; gap: 16px; flex-direction: column; }
        .card-item { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .card-info { display: flex; justify-content: space-between; margin-top: 8px; font-size: 14px; }

        @media (max-width: 768px) {
          table { display: none; }
          .mobile-cards { display: flex; }
          .header-flex { flex-direction: column; align-items: flex-start; }
          .filter-section { width: 100%; justify-content: space-between; }
        }

        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
        .status-active { background: #fff7ed; color: #c2410c; }
        .status-done { background: #f0fdf4; color: #15803d; }
      `}</style>

      {/* HEADER AVEC FILTRE */}
      <div className="header-flex">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Gestion des Présences</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "15px" }}>Suivi en temps réel des collaborateurs</p>
        </div>

        <div className="filter-section">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Filtrer :</span>
          </div>
          <input 
            type="date" 
            className="date-input"
            value={selectedDate} 
            onChange={handleDateChange} 
          />
          {selectedDate && (
            <button className="reset-btn" onClick={resetFilter}>Réinitialiser</button>
          )}
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "14px", color: "#3b82f6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{presentTodayCount}</div>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Présents aujourd'hui</div>
          </div>
        </div>
      </div>

      {/* LISTE DES PRÉSENCES */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ fontWeight: "500" }}>Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Date</th>
                  <th>Heure Arrivée</th>
                  <th>Heure Sortie</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {presences.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: "700" }}>
                      {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `ID: ${p.employee_id}`}
                    </td>
                    <td>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ fontWeight: "600" }}>{p.check_in ? new Date(p.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td style={{ fontWeight: "600" }}>{p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td>
                      <span className={`status-badge ${p.check_out ? "status-done" : "status-active"}`}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                        {p.check_out ? "Journée Terminée" : "En cours"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="mobile-cards">
            {presences.map((p: any) => (
              <div key={p.id} className="card-item">
                <div className="card-header">
                  <div>
                    <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a" }}>
                      {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `ID: ${p.employee_id}`}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>{new Date(p.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <span className={`status-badge ${p.check_out ? "status-done" : "status-active"}`}>
                    {p.check_out ? "Terminé" : "En cours"}
                  </span>
                </div>
                <div style={{ height: "1px", background: "#f1f5f9", margin: "12px 0" }}></div>
                <div className="card-info">
                  <span style={{ color: "#64748b" }}>📍 Arrivée</span>
                  <span style={{ fontWeight: "700" }}>{p.check_in ? new Date(p.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                </div>
                <div className="card-info">
                  <span style={{ color: "#64748b" }}>🏁 Sortie</span>
                  <span style={{ fontWeight: "700" }}>{p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                </div>
              </div>
            ))}
          </div>
          
          {presences.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1", marginTop: "20px" }}>
              <p style={{ color: "#94a3b8", margin: 0 }}>Aucun enregistrement trouvé pour cette sélection.</p>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}