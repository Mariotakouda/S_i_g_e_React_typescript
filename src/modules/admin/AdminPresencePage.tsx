import { useEffect, useState } from "react";
import { getAllPresences, type EmployeePresence } from "../presences/service";

export default function AdminPresencePage() {
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async (dateFilter?: string) => {
    try {
      setLoading(true);
      const response = await getAllPresences(dateFilter ? { date: dateFilter } : undefined);
      // Extraction sécurisée des données (Laravel paginate renvoie un objet avec une clé 'data')
      const data = response?.data?.data || response?.data || response;
      setPresences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des présences:", err);
      setPresences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    loadAll(date);
  };

  const resetFilter = () => {
    setSelectedDate("");
    loadAll();
  };

  // Stats basées sur les données chargées
  const today = new Date().toISOString().split('T')[0];
  const presentToday = presences.filter(p => p.date === today);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Tableau de bord des présences
          </h1>
          <p style={{ color: "#64748b", marginTop: "4px" }}>Interface Administrateur</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#fff", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Filtrer par jour :</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px 10px", outline: "none" }}
          />
          {selectedDate && (
            <button onClick={resetFilter} style={{ background: "#f1f5f9", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={cardStyle}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>👥</div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "24px", color: "#1e293b" }}>{presentToday.length}</div>
            <div style={{ color: "#64748b", fontSize: "14px" }}>Présents aujourd'hui</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Chargement des données...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={thStyle}>Employé</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Arrivée</th>
                <th style={thStyle}>Sortie</th>
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {presences.length > 0 ? (
                presences.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>
                        {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `ID: ${p.employee_id}`}
                      </div>
                    </td>
                    <td style={tdStyle}>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td style={tdStyle}>{p.check_in ? new Date(p.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td style={tdStyle}>{p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td style={tdStyle}>
                      <span style={p.check_out ? statusDone : statusActive}>
                        {p.check_out ? "✓ Terminé" : "⏳ En cours"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Aucun pointage trouvé.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Styles inchangés
const cardStyle = { padding: "20px", backgroundColor: "#fff", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid #f1f5f9" };
const thStyle = { textAlign: "left" as const, padding: "16px", color: "#475569", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" as const };
const tdStyle = { padding: "16px", fontSize: "14px", color: "#334155" };
const statusActive = { padding: "6px 12px", backgroundColor: "#fff7ed", color: "#c2410c", borderRadius: "9999px", fontSize: "12px", fontWeight: "700" };
const statusDone = { padding: "6px 12px", backgroundColor: "#f0fdf4", color: "#15803d", borderRadius: "9999px", fontSize: "12px", fontWeight: "700" };