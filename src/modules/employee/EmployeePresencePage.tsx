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

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

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
    } catch (err: any) {
      setError("Erreur réseau");
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
      toast.success("Pointage OK");
    } catch (err: any) {
      toast.error("Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePresence) return;
    if (!window.confirm("Sortir ?")) return;
    try {
      setActionLoading(true);
      await checkOut(activePresence.id);
      setActivePresence(null);
      await loadPresences();
      toast.success("Sortie OK");
    } catch (err: any) {
      toast.error("Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => getPresenceStats(presences), [presences]);
  const todayPresence = presences.find(p => p.date === new Date().toISOString().split('T')[0]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container-fluid bg-light min-vh-100 p-0 overflow-hidden">
      <div className="container py-3 py-md-4 px-2">
        
        {/* HEADER */}
        <div className="row g-2 mb-4 align-items-center">
          <div className="col-12 col-sm-7 text-center text-sm-start">
            <h1 className="h5 fw-bold mb-0">Ma Présence</h1>
            <small className="text-muted">{employee?.first_name} {employee?.last_name}</small>
          </div>
          <div className="col-12 col-sm-5 text-center text-sm-end">
             <div className="h5 fw-bold text-primary mb-0">{currentTime.toLocaleTimeString('fr-FR')}</div>
             <div className="text-muted" style={{ fontSize: '0.75rem' }}>{currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
          </div>
        </div>

        {error && <div className="alert alert-danger mx-2 py-2 small">{error}</div>}

        <div className="row g-3">
          {/* MAIN CARD */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className={`py-1 px-3 text-center small fw-bold text-white ${activePresence ? 'bg-success' : 'bg-secondary'}`}>
                {activePresence ? 'EN LIGNE' : 'HORS LIGNE'}
              </div>
              <div className="card-body p-4 text-center">
                {activePresence ? (
                  <div>
                    <span className="text-muted small">Arrivée : {formatPresenceTime(activePresence.check_in)}</span>
                    <h2 className="fw-bold my-3" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>
                      {formatPresenceTime(activePresence.check_in)}
                    </h2>
                    <button onClick={handleCheckOut} disabled={actionLoading} className="btn btn-danger btn-lg w-100 rounded-pill d-flex align-items-center justify-content-center gap-2">
                      <LogOutIcon /> {actionLoading ? "..." : "Terminer"}
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="mb-3 text-primary opacity-25"><MapPinIcon /></div>
                    <h5 className="fw-bold mb-3 small text-uppercase">Nouveau Pointage</h5>
                    <button onClick={handleCheckIn} disabled={actionLoading || !!todayPresence} className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold">
                      {todayPresence ? "Session Terminée" : "Pointer l'arrivée"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="col-12 col-lg-4">
            <div className="row g-2">
              <div className="col-6 col-lg-12">
                <div className="card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
                  <div className="text-primary bg-primary-subtle p-2 rounded-circle mb-2"><ClockIcon /></div>
                  <div className="small text-muted mb-1" style={{ fontSize: '0.7rem' }}>Heures/Mois</div>
                  <div className="fw-bold h5 mb-0">{stats.totalHours}h</div>
                </div>
              </div>
              <div className="col-6 col-lg-12">
                <div className="card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
                  <div className="text-success bg-success-subtle p-2 rounded-circle mb-2"><CalendarIcon /></div>
                  <div className="small text-muted mb-1" style={{ fontSize: '0.7rem' }}>Jours</div>
                  <div className="fw-bold h5 mb-0">{stats.daysPresent}</div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="col-12 mt-2">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 py-3 px-3">
                <h6 className="fw-bold mb-0 small">DERNIERS POINTAGES</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3 border-0">Date</th>
                      <th className="border-0 text-center">Entrée</th>
                      <th className="border-0 text-center">Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presences.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td className="ps-3 py-3 fw-bold">{new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                        <td className="text-center">{formatPresenceTime(p.check_in)}</td>
                        <td className="text-center">{p.check_out ? formatPresenceTime(p.check_out) : '--:--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}