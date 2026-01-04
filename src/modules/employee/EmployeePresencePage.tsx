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

// --- Icônes SVG Professionnelles ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function EmployeePresencePage() {
  const { employee } = useContext(AuthContext);
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [activePresence, setActivePresence] = useState<EmployeePresence | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { loadPresences(); }, []);

  const loadPresences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyPresences();
      setPresences(data);
      const { active, presence } = await hasActiveCheckIn();
      setActivePresence(active ? presence || null : null);
    } catch (err) {
      setError("Impossible de charger les données de présence.");
    } finally {
      setLoading(false);
    }
  };

  const formatPresenceTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCheckIn = async () => {
    if (!employee?.id) return;
    try {
      setActionLoading(true);
      const newPresence = await checkIn(); 
      setActivePresence(newPresence);
      await loadPresences();
      toast.success("Pointage d'arrivée enregistré");
    } catch (err) {
      toast.error("Erreur lors du pointage");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePresence) return;
    if (!window.confirm("Voulez-vous valider votre fin de service ?")) return;
    try {
      setActionLoading(true);
      await checkOut(activePresence.id);
      setActivePresence(null);
      await loadPresences();
      toast.success("Pointage de sortie enregistré");
    } catch (err) {
      toast.error("Erreur lors de la sortie");
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => getPresenceStats(presences), [presences]);
  const todayPresence = presences.find(p => p.date === new Date().toISOString().split('T')[0]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <div className="text-muted small fw-medium">Chargement de votre espace...</div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* HEADER BAR */}
      <div className="bg-white border-bottom shadow-sm mb-4">
        <div className="container py-3">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6 text-center text-md-start">
              <h1 className="h4 fw-bold mb-1">Espace Présence</h1>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                  {employee?.first_name} {employee?.last_name}
                </span>
                <span className="text-muted small">ID: #{employee?.id || '---'}</span>
              </div>
            </div>
            <div className="col-12 col-md-6 text-center text-md-end">
              <div className="display-6 fw-bold text-dark mb-0" style={{ letterSpacing: '-1px' }}>
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-primary fw-medium small text-uppercase ls-1">
                {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-3">
        {error && <div className="alert alert-danger border-0 shadow-sm mb-4 d-flex align-items-center gap-2 small">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>
          {error}
        </div>}

        <div className="row g-4">
          {/* ZONE DE POINTAGE ACTIVE */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden transition-all border-top-primary">
              <div className="card-body p-4 p-md-5 text-center">
                {activePresence ? (
                  <div className="animate-fade-in">
                    <div className="mb-4">
                      <div className="badge bg-success-subtle text-success px-4 py-2 rounded-pill fw-bold mb-3 border border-success-subtle animate-pulse">
                         SESSION ACTIVE
                      </div>
                      <p className="text-muted small mb-1">Heure d'arrivée enregistrée</p>
                      <div className="display-3 fw-bold text-dark mb-4">
                        {formatPresenceTime(activePresence.check_in)}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleCheckOut} 
                      disabled={actionLoading} 
                      className="btn btn-danger btn-lg w-100 rounded-4 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-bold transition-all"
                    >
                      {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : <LogOutIcon />}
                      {actionLoading ? "Enregistrement..." : "Terminer mon service"}
                    </button>
                  </div>
                ) : (
                  <div className="py-3 animate-fade-in">
                    <div className="mb-4">
                      <div className="text-primary bg-primary-subtle d-inline-block p-4 rounded-circle mb-4 shadow-sm">
                        <MapPinIcon />
                      </div>
                      <h3 className="fw-bold text-dark h4 mb-2">Prêt pour votre service ?</h3>
                      <p className="text-muted mx-auto mb-0" style={{ maxWidth: '300px' }}>
                        Enregistrez votre arrivée pour commencer à comptabiliser vos heures.
                      </p>
                    </div>

                    <button 
                      onClick={handleCheckIn} 
                      disabled={actionLoading || !!todayPresence} 
                      className={`btn btn-lg w-100 rounded-4 py-3 shadow-sm fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${todayPresence ? 'btn-light border text-muted' : 'btn-primary'}`}
                    >
                      {todayPresence ? <CheckIcon /> : <ClockIcon />}
                      {todayPresence ? "Service terminé aujourd'hui" : "Pointer mon arrivée maintenant"}
                    </button>
                    {todayPresence && <p className="small text-muted mt-3 mb-0">À demain ! Votre journée est déjà validée.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RÉSUMÉ MENSUEL */}
          <div className="col-12 col-lg-4">
            <div className="row g-3">
              <div className="col-6 col-lg-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 transition-all hover-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-primary bg-primary-subtle p-3 rounded-4 shadow-sm"><ClockIcon /></div>
                    <div>
                      <div className="text-muted fw-bold small text-uppercase ls-1">Volume Mensuel</div>
                      <div className="fw-bold h3 mb-0 text-dark">{stats.totalHours}<small className="h6 text-muted ms-1">h</small></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-6 col-lg-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 transition-all hover-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-success bg-success-subtle p-3 rounded-4 shadow-sm"><CalendarIcon /></div>
                    <div>
                      <div className="text-muted fw-bold small text-uppercase ls-1">Jours Présents</div>
                      <div className="fw-bold h3 mb-0 text-dark">{stats.daysPresent}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Petite Info Card */}
              <div className="col-12 d-none d-lg-block">
                <div className="bg-primary text-white rounded-4 p-4 shadow-sm position-relative overflow-hidden">
                   <div className="position-relative z-1">
                      <h6 className="fw-bold small opacity-75 mb-2">RAPPEL</h6>
                      <p className="small mb-0">N'oubliez pas de pointer votre sortie à la fin de chaque journée.</p>
                   </div>
                   <div className="position-absolute end-0 bottom-0 opacity-10 mb-n3 me-n2"><ClockIcon /></div>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORIQUE RÉCENT */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-2">
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0 text-dark small text-uppercase ls-1">Historique des 5 derniers jours</h6>
                <div className="badge bg-light text-muted fw-normal rounded-pill px-3">Pointages récents</div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr className="small text-muted text-uppercase">
                      <th className="ps-4 py-3 border-0 fw-bold">Date</th>
                      <th className="border-0 text-center fw-bold">Heure d'entrée</th>
                      <th className="border-0 text-center fw-bold">Heure de sortie</th>
                      <th className="pe-4 border-0 text-end fw-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presences.slice(0, 5).map((p) => (
                      <tr key={p.id} className="transition-all">
                        <td className="ps-4 py-3 fw-bold text-dark">
                          {new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                        </td>
                        <td className="text-center fw-medium text-primary">
                          {formatPresenceTime(p.check_in)}
                        </td>
                        <td className="text-center fw-medium text-danger">
                          {p.check_out ? formatPresenceTime(p.check_out) : '--:--'}
                        </td>
                        <td className="pe-4 text-end">
                           {p.check_out ? 
                             <span className="badge bg-success-subtle text-success rounded-pill px-2">Complété</span> : 
                             <span className="badge bg-warning-subtle text-warning rounded-pill px-2">En cours</span>
                           }
                        </td>
                      </tr>
                    ))}
                    {presences.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-5 text-muted fst-italic">Aucun historique disponible pour le moment.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .transition-all { transition: all 0.3s ease; }
        .hover-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
        .border-top-primary { border-top: 4px solid #0d6efd !important; }
        .animate-fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        .animate-pulse { animation: pulse 2s infinite ease-in-out; }
        .btn-lg { padding: 1rem 1.5rem; }
        .card { border: none !important; }
      `}</style>
    </div>
  );
}