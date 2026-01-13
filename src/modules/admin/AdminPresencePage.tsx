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

  const today = new Date().toISOString().split('T')[0];
  const presentTodayCount = presences.filter(p => p.date === today).length;

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 20px; maxWidth: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; min-height: 100vh; box-sizing: border-box; }
        
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .actions-group { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        
        .filter-section { background: white; padding: 10px 14px; borderRadius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .date-input { border: 1px solid #cbd5e1; padding: 8px; border-radius: 8px; outline: none; font-size: 14px; color: #1e293b; cursor: pointer; background: white; }
        
        .reset-btn { background: none; border: none; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 13px; white-space: nowrap; padding: 0 4px; }

        .export-btn { 
          background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 10px; 
          cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; 
          transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); font-size: 14px;
        }
        .export-btn:disabled { background: #a7f3d0; cursor: not-allowed; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 24px; borderRadius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; }

        .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }

        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .status-active { background: #fff7ed; color: #c2410c; }
        .status-done { background: #f0fdf4; color: #15803d; }

        /* RESPONSIVE MOBILE (425px et moins) */
        @media (max-width: 425px) {
          .admin-container { padding: 15px; }
          .header-flex { flex-direction: column; align-items: flex-start; gap: 15px; }
          .actions-group { width: 100%; flex-direction: column; align-items: stretch; }
          .filter-section { order: 1; width: 100%; box-sizing: border-box; }
          .export-btn { order: 2; width: 100%; justify-content: center; }
          .date-input { flex: 1; }
          
          h1 { font-size: 22px !important; }

          /* Transformation du tableau en liste de cartes */
          .table-container { border: none; background: transparent; box-shadow: none; }
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { position: absolute; top: -9999px; left: -9999px; }
          tr { background: white; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 15px; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          td { border: none; position: relative; padding: 8px 10px 8px 45%; text-align: right; font-size: 13px; }
          td:before { content: attr(data-label); position: absolute; left: 10px; width: 40%; text-align: left; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; }
          td:last-child { border-bottom: 0; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="header-flex">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Gestion des Présences</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "15px" }}>Suivi en temps réel</p>
        </div>

        <div className="actions-group">
          <button className="export-btn" onClick={handleExport} disabled={exporting || presences.length === 0}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            {exporting ? "Génération..." : "Exporter CSV"}
          </button>

          <div className="filter-section">
            <input type="date" className="date-input" value={selectedDate} onChange={handleDateChange} />
            {selectedDate && <button onClick={resetFilter} className="reset-btn">Annuler</button>}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "14px", color: "#3b82f6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{presentTodayCount}</div>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Présents aujourd'hui</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px" }}><div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div></div>
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
                    <td data-label="Employé" style={{ fontWeight: "700" }}>{p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `ID: ${p.employee_id}`}</td>
                    <td data-label="Date">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td data-label="Arrivée" style={{ fontWeight: "600" }}>{p.check_in ? new Date(p.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td data-label="Sortie" style={{ fontWeight: "600" }}>{p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td data-label="Statut">
                      <span className={`status-badge ${p.check_out ? "status-done" : "status-active"}`}>
                        {p.check_out ? "Terminée" : "En cours"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Aucune donnée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}