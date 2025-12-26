// src/modules/employee/presences/EmployeePresencePage.tsx

import { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  checkIn, 
  checkOut, 
  getMyPresences, 
  getPresenceStats, 
  hasActiveCheckIn, 
  type EmployeePresence 
} from "../presences/service";
import toast from "react-hot-toast";

export default function EmployeePresencePage() {
  const { employee } = useContext(AuthContext);
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [activePresence, setActivePresence] = useState<EmployeePresence | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Chargement initial
  useEffect(() => {
    loadPresences();
  }, []);

  const loadPresences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyPresences();
      setPresences(data);
      
      const { active, presence } = await hasActiveCheckIn();
      setActivePresence(active ? presence || null : null);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!employee?.id) return;
    
    try {
      setActionLoading(true);
      const newPresence = await checkIn(); 
      setActivePresence(newPresence);
      await loadPresences();
      toast.success("Pointage d'arrivée enregistré !"); // ✅ Feedback
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors du pointage d'arrivée";
      toast.error(msg);
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePresence) return;
    if (!window.confirm("Confirmer le pointage de sortie ?")) return;
    
    try {
      setActionLoading(true);
      await checkOut(activePresence.id);
      setActivePresence(null);
      await loadPresences();
      toast.success("Pointage de sortie enregistré !"); // ✅ Feedback
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors du pointage de sortie";
      toast.error(msg);
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Calcul des stats
  const stats = useMemo(() => getPresenceStats(presences), [presences]);

  // Vérifier si un pointage existe pour aujourd'hui
  const todayDate = new Date().toISOString().split('T')[0];
  const todayPresence = presences.find(p => p.date === todayDate);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", padding: "20px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Gestion de Présence
          </h1>
          <p style={{ color: "#64748b", marginTop: "4px" }}>Espace professionnel • {employee?.first_name} {employee?.last_name}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "16px", color: "#475569", fontWeight: "600", marginBottom: "4px", textTransform: "capitalize" }}>
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
            {currentTime.toLocaleTimeString('fr-FR')}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "12px", marginBottom: "24px", border: "1px solid #fee2e2" }}>
          ⚠️ {error}
        </div>
      )}

      {/* CARTE DE POINTAGE PRINCIPALE */}
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "30px", border: "1px solid #f1f5f9" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 16px", 
            backgroundColor: activePresence ? "#ecfdf5" : "#f1f5f9", 
            color: activePresence ? "#059669" : "#64748b", 
            borderRadius: "9999px", 
            fontSize: "14px", 
            fontWeight: "700", 
            marginBottom: "24px", 
            border: `2px solid ${activePresence ? "#10b981" : "#cbd5e1"}`
          }}>
            <span style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                backgroundColor: activePresence ? "#10b981" : "#94a3b8"
            }}></span>
            {activePresence ? "EN SERVICE" : "HORS SERVICE"}
          </div>

          {activePresence ? (
            <div>
              <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 4px 0" }}>Session démarrée à</p>
              <p style={{ fontSize: "48px", fontWeight: "800", color: "#0f172a", margin: "0 0 24px 0" }}>
                {/* ✅ Sécurité TypeScript pour la date */}
                {activePresence.check_in ? new Date(activePresence.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                style={btnStyle("#ef4444", actionLoading)}
              >
                {actionLoading ? "Enregistrement..." : "🚪 Terminer la journée"}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "24px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px 0" }}>
                Prêt pour votre journée ?
              </p>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading || !!todayPresence}
                style={btnStyle("#3b82f6", actionLoading || !!todayPresence)}
              >
                {actionLoading ? "Initialisation..." : "📍 Pointer l'Arrivée"}
              </button>
              {todayPresence && !activePresence && (
                <p style={{ marginTop: "16px", color: "#10b981", fontWeight: "600", fontSize: "14px" }}>
                  ✅ Journée terminée. Merci !
                </p>
              )}
            </div>
          )}
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <StatCard icon="⏱️" value={`${stats.totalHours}h`} label="Total ce mois" />
          <StatCard icon="📅" value={stats.daysPresent.toString()} label="Jours présents" />
          <StatCard icon="📊" value={`${stats.averageHours}h`} label="Moyenne / jour" />
        </div>
      </div>
    </div>
  );
}

// Styles réutilisables
const btnStyle = (color: string, disabled: boolean) => ({
    padding: "14px 40px",
    fontSize: "16px",
    fontWeight: "600" as const,
    borderRadius: "12px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: color,
    color: "#fff",
    boxShadow: disabled ? "none" : `0 10px 15px -3px ${color}4D`,
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s"
});

function StatCard({ icon, value, label }: { icon: string, value: string, label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: "32px" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>{value}</div>
        <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{label}</div>
      </div>
    </div>
  );
}