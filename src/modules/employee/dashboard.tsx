import { useEffect, useState, useContext, type ChangeEvent } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";

// --- Interfaces ---
interface Presence { id: number; date: string; status: string; }
interface Task { id: number; title: string; due_date?: string; status: string; }
interface LeaveRequest { id: number; start_date: string; end_date: string; status: string; }
interface Announcement { 
  id: number; 
  title: string; 
  created_at: string; 
  is_general: boolean; 
  department?: { name: string };
}

// --- Icons SVG ---
const Icons = {
  Task: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

export default function EmployeeDashboard() {
  const { user, employee, logout, setEmployee } = useContext(AuthContext);

  const [data, setData] = useState<{
    presences: Presence[];
    tasks: Task[];
    leaves: LeaveRequest[];
    announcements: Announcement[];
  }>({ presences: [], tasks: [], leaves: [], announcements: [] });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
  let isMounted = true;

  async function loadDashboard() {
    if (!user?.id) return;

    try {
      setLoading(true);

      // 1. On prépare les promesses. 
      // Si on a déjà l'employé, on résout une promesse nulle immédiatement.
      const profilePromise = !employee?.id 
        ? api.get("/me") 
        : Promise.resolve(null); // Utilise le point (.) pas (::)

      const summaryPromise = api.get("/me/dashboard-summary");

      // 2. On lance tout en parallèle
      const [meRes, summaryRes] = await Promise.all([profilePromise, summaryPromise]);

      if (!isMounted) return;

      // 3. Correction de l'erreur TS : on vérifie que meRes n'est pas nul et possède 'data'
      if (meRes && 'data' in meRes && meRes.data.employee && setEmployee) {
        setEmployee(meRes.data.employee);
      }

      // 4. Ici summaryRes est forcément une AxiosResponse
      const { presences, tasks, leave_requests, announcements } = summaryRes.data;

      setData({
        presences: presences || [],
        tasks: tasks || [],
        leaves: leave_requests || [],
        announcements: announcements || []
      });

      // Gestion du cache local pour les annonces
      if (announcements?.length > 0) {
        const lastRead = localStorage.getItem("last_announcement_read");
        setHasNewAnnouncements(!lastRead || announcements[0].created_at > lastRead);
      }
    } catch (err) {
      if (isMounted) setError("Erreur de chargement des données.");
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  loadDashboard();
  return () => { isMounted = false; };
}, [user?.id]); // On évite de mettre employee?.id ici pour stopper les boucles infinies

  const markAnnouncementsAsRead = () => {
    if (data.announcements.length > 0) {
      localStorage.setItem("last_announcement_read", data.announcements[0].created_at);
      setHasNewAnnouncements(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;
    const formData = new FormData();
    formData.append("profile_photo", file);
    try {
      setUploading(true);
      const response = await api.post("/me/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (setEmployee && response.data.url) {
        const updated = { ...employee, profile_photo_url: response.data.url };
        setEmployee(updated as any);
        localStorage.setItem("employee", JSON.stringify(updated));
      }
    } catch (err) { setError("Erreur upload photo"); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <style>{`
        @keyframes skeleton-loading {
          0% { background-color: #e9ecef; }
          100% { background-color: #f8f9fa; }
        }
        .skeleton {
          animation: skeleton-loading 1s linear infinite alternate;
          border-radius: 4px;
        }
      `}</style>
      
      <div className="container">
        
        <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
          <div>
            <h1 className="h4 fw-bold text-dark mb-1">Tableau de bord</h1>
            <p className="text-muted small mb-0">Session active : <span className="fw-semibold text-primary">{user?.name || 'Utilisateur'}</span></p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link to="/employee/announcements" onClick={markAnnouncementsAsRead} className="btn btn-white border shadow-sm btn-sm position-relative">
              <Icons.Bell />
              {hasNewAnnouncements && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" />}
            </Link>
            <button onClick={logout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 shadow-sm">
              <Icons.Logout /> Deconnexion
            </button>
          </div>
        </header>

        {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

        {/* Profil Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row align-items-center g-4">
              <div className="col-auto">
                <div className="position-relative">
                  {loading ? (
                    <div className="skeleton rounded-circle" style={{ width: '85px', height: '85px' }} />
                  ) : (
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm overflow-hidden" 
                         style={{ width: '85px', height: '85px', border: '3px solid #fff' }}>
                      {uploading ? <div className="spinner-border spinner-border-sm text-white" /> : 
                        employee?.profile_photo_url ? <img src={employee.profile_photo_url} className="w-100 h-100 object-fit-cover" alt="Profil" /> :
                        <span style={{fontSize: '24px'}}>{employee?.first_name?.[0]}{employee?.last_name?.[0]}</span>
                      }
                    </div>
                  )}
                  <label htmlFor="avatar-upload" className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center border" style={{ width: '30px', height: '30px', cursor: 'pointer' }}>
                    <Icons.Camera /><input type="file" id="avatar-upload" className="d-none" onChange={handlePhotoUpload} accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="col">
                <div className="row g-3">
                  <InfoItem label="Collaborateur" value={`${employee?.first_name} ${employee?.last_name}`} loading={loading} />
                  <InfoItem label="Departement" value={employee?.department?.name || "General"} loading={loading} />
                  <InfoItem label="Poste actuel" value={employee?.roles?.[0]?.name || "Membre"} loading={loading} />
                  <div className="col-6 col-md-3">
                    <label className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '10px' }}>Statut</label>
                    {loading ? <div className="skeleton" style={{ width: '40px', height: '16px' }} /> : <p className="mb-0 small fw-bold text-success">Actif</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille de Sections */}
        <div className="row g-4">
          <SectionCard title="Missions en cours" icon={<Icons.Task />} link="/employee/tasks">
            {loading ? <SkeletonList count={3} /> : data.tasks.length === 0 ? <EmptyState /> : (
              <div className="vstack gap-2">
                {data.tasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="p-3 bg-light rounded-3 border-start border-primary border-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold small text-truncate pe-2">{t.title}</h6>
                      <Link to={`/employee/tasks/${t.id}`} className="text-primary text-decoration-none small fw-bold">Details</Link>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <StatusBadge status={t.status} />
                      <span className="text-muted" style={{fontSize: '11px'}}>Echeance: {t.due_date || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Historique Presence" icon={<Icons.Calendar />} link="/employee/presences">
            {loading ? <SkeletonList count={4} /> : data.presences.length === 0 ? <EmptyState text="Aucune donnee de presence" /> : (
              <div className="vstack gap-2">
                {data.presences.slice(0, 4).map((p) => (
                  <div key={p.id} className="d-flex justify-content-between align-items-center p-2 px-3 bg-white border rounded-3">
                    <span className="small fw-semibold">{new Date(p.date).toLocaleDateString('fr-FR')}</span>
                    <span className={`small fw-bold ${p.status === 'présent' ? 'text-success' : 'text-danger'}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Demandes de Conges" icon={<Icons.User />} link="/employee/leave-requests">
            <Link to="/employee/leave-requests/create" className="btn btn-primary btn-sm w-100 mb-3 rounded-3 shadow-none fw-bold">Nouvelle Demande</Link>
            {loading ? <SkeletonList count={2} /> : data.leaves.length === 0 ? <EmptyState text="Aucune demande" /> : (
              data.leaves.slice(0, 2).map((l) => (
                <div key={l.id} className="p-2 px-3 border rounded-3 bg-white mb-2 d-flex justify-content-between align-items-center">
                  <span className="small fw-bold">{l.start_date}</span>
                  <span className="badge bg-warning-subtle text-warning border border-warning-subtle">{l.status}</span>
                </div>
              ))
            )}
          </SectionCard>

          <SectionCard title="Annonces Recentes" icon={<Icons.Bell />} link="/employee/announcements">
            {loading ? <SkeletonList count={3} /> : data.announcements.length === 0 ? <EmptyState text="Aucune communication" /> : (
              <div className="vstack gap-2">
                {data.announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3 rounded-3 bg-white border-start border-4 border-info">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold small">{a.title}</span>
                      <span className="text-muted" style={{ fontSize: '10px' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>{a.is_general ? "Annonce globale" : "Annonce departementale"}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// --- Composants Internes ---
function SectionCard({ title, icon, children, link }: any) {
  return (
    <div className="col-12 col-md-6">
      <div className="card h-100 border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-4 px-4 pb-2">
          <div className="d-flex align-items-center gap-2 fw-bold text-dark pe-none">
            <span className="text-primary">{icon}</span> {title}
          </div>
          {link && <Link to={link} className="text-primary text-decoration-none small fw-bold border-bottom border-primary">Voir tout</Link>}
        </div>
        <div className="card-body px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, loading }: { label: string, value: string, loading?: boolean }) {
  return (
    <div className="col-6 col-md-3 text-truncate">
      <label className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '10px' }}>{label}</label>
      {loading ? (
        <div className="skeleton" style={{ width: '80%', height: '18px' }} />
      ) : (
        <p className="mb-0 fw-semibold text-dark small">{value}</p>
      )}
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="vstack gap-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    completed: { bg: 'bg-success-subtle', text: 'text-success', label: 'Fait' },
    in_progress: { bg: 'bg-info-subtle', text: 'text-info', label: 'En cours' },
    pending: { bg: 'bg-secondary-subtle', text: 'text-secondary', label: 'Attente' }
  };
  const s = map[status] || map.pending;
  return <span className={`badge ${s.bg} ${s.text} fw-bold`} style={{fontSize: '10px'}}>{s.label}</span>;
}

function EmptyState({ text = "Rien a afficher" }) {
  return <p className="text-center text-muted fst-italic py-4 small">{text}</p>;
}