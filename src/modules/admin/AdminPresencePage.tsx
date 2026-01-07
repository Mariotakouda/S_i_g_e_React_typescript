import React, { useEffect, useState, useCallback } from "react";
import { getAllPresences, exportPresences, type EmployeePresence } from "../presences/service";
import toast from "react-hot-toast";

export default function AdminPresencePage() {
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const loadAll = useCallback(async (dateFilter?: string) => {
    try {
      setLoading(true);
      const response = await getAllPresences(dateFilter ? { date: dateFilter } : undefined);
      
      // Adaptation à la pagination Laravel ou tableau simple
      const fetchedData = response.data?.data || response.data || [];
      setPresences(fetchedData);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setPresences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading("Génération du CSV...");
      await exportPresences();
      toast.dismiss();
      toast.success("Fichier téléchargé avec succès");
    } catch (err) {
      toast.dismiss();
      toast.error("Échec de l'exportation");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    loadAll(date);
  };

  const resetFilter = () => {
    setSelectedDate("");
    loadAll();
  };

  // Calcul pour les statistiques (Utilise maintenant la variable lue par le JSX)
  const today = new Date().toISOString().split('T')[0];
  const presentTodayCount = presences.filter(p => p.date === today).length;

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 20px; maxWidth: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; min-height: 100vh; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        
        .filter-section { background: white; padding: 12px 16px; borderRadius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .date-input { border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; outline: none; font-size: 14px; color: #1e293b; cursor: pointer; }
        
        .export-btn { 
          background: #10b981; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 10px; 
          cursor: pointer; 
          font-weight: 700; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
        }
        .export-btn:hover { background: #059669; transform: translateY(-1px); }
        .export-btn:disabled { background: #a7f3d0; cursor: not-allowed; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 24px; borderRadius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; }

        .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }

        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
        .status-active { background: #fff7ed; color: #c2410c; }
        .status-done { background: #f0fdf4; color: #15803d; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER AVEC ACTIONS */}
      <div className="header-flex">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Gestion des Présences</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "15px" }}>Suivi en temps réel des collaborateurs</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Bouton d'exportation */}
          <button 
            className="export-btn" 
            onClick={handleExport}
            disabled={exporting || presences.length === 0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            {exporting ? "Génération..." : "Exporter la liste des présences"}
          </button>

          <div className="filter-section">
            <input 
              type="date" 
              className="date-input"
              value={selectedDate} 
              onChange={handleDateChange} 
            />
            {selectedDate && (
              <button 
                onClick={resetFilter}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION STATISTIQUES (Utilise presentTodayCount) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "14px", color: "#3b82f6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
          <p>Chargement des données...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Date</th>
                <th>Arrivée</th>
                <th>Sortie</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {presences.length > 0 ? (
                presences.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: "700" }}>
                      {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `ID: ${p.employee_id}`}
                    </td>
                    <td>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ fontWeight: "600" }}>
                      {p.check_in ? new Date(p.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      {p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td>
                      <span className={`status-badge ${p.check_out ? "status-done" : "status-active"}`}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                        {p.check_out ? "Journée Terminée" : "En cours"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    Aucun enregistrement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}