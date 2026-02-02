import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnnouncement, deleteAnnouncement, checkManagerStatus } from "./service";
import { AuthContext } from "../../context/AuthContext";
import type { Announcement } from "./model";
import type { ManagerStatus } from "./service";

// --- Icônes SVG Professionnelles ---
const IconArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7-7-7 7-7"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

export default function AnnouncementShow() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 CORRECTION : Détection dynamique du chemin de retour selon le rôle
  const backPath = user?.role === 'admin' ? '/admin/announcements' : '/employee/announcements';
  const editPath = user?.role === 'admin' ? `/admin/announcements/${id}/edit` : `/employee/announcements/${id}/edit`;

  useEffect(() => {
    async function loadData() {
      try {
        const [response, status]: [any, ManagerStatus] = await Promise.all([
          getAnnouncement(Number(id)),
          checkManagerStatus()
        ]);
        const finalData = response && response.data ? response.data : response;
        setAnnouncement(finalData);
        setManagerStatus(status);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Impossible de charger l'annonce");
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Cette action est irréversible. Supprimer cette annonce ?")) return;
    try {
      await deleteAnnouncement(Number(id));
      nav(backPath); // 🔥 Utilisation du chemin dynamique
    } catch (err: any) {
      alert("Erreur lors de la suppression");
    }
  }

  function canManageAnnouncement(): boolean {
    if (!announcement) return false;
    if (user?.role === "admin") return true;
    if (managerStatus?.is_manager) {
      return announcement.department_id === managerStatus.department_id;
    }
    return false;
  }

  function getDestinataireConfig() {
    if (announcement?.is_general) return { label: "Diffusion Générale", color: "#0d6efd", bg: "#e7f1ff" };
    if (announcement?.department) return { label: `${announcement.department.name}`, color: "#856404", bg: "#fff3cd" };
    if (announcement?.employee) return { label: `${announcement.employee.first_name} ${announcement.employee.last_name}`, color: "#055160", bg: "#cff4fc" };
    return { label: "Annonce", color: "#6c757d", bg: "#f8f9fa" };
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
      <div className="spinner-border text-primary border-3" role="status"></div>
    </div>
  );

  if (error || !announcement) return (
    <div className="container py-5 text-center">
      <div className="card shadow-sm border-0 mx-auto rounded-4 p-4" style={{ maxWidth: '400px' }}>
        <div className="text-danger mb-3">
           <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h5 className="fw-bold">{error || "Annonce introuvable"}</h5>
        <button onClick={() => nav(backPath)} className="btn btn-dark w-100 mt-3 rounded-3">Retour à la liste</button>
      </div>
    </div>
  );

  const config = getDestinataireConfig();
  const canManage = canManageAnnouncement();

  return (
    <div className="bg-light min-vh-100 py-4 py-lg-5">
      <div className="container" style={{ maxWidth: '1100px' }}> 
        
        {/* Header Navigation - 🔥 CORRECTION : Lien dynamique */}
        <div className="mb-4">
          <Link to={backPath} className="text-decoration-none text-muted fw-semibold d-inline-flex align-items-center gap-2 hover-dark-link transition-all">
            <IconArrowLeft /> <span>Toutes les annonces</span>
          </Link>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden border-top-accent" style={{ '--accent-color': config.color } as React.CSSProperties}>
          <div className="card-body p-0">
            <div className="row g-0">
              
              {/* Sidebar Info */}
              <div className="col-12 col-xl-3 bg-white border-end-xl p-4 p-lg-5">
                <div className="d-flex flex-column gap-4">
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold mb-2 ls-1" style={{ fontSize: '11px' }}>Destinataire</small>
                    <span className="px-3 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm" 
                          style={{ backgroundColor: config.bg, color: config.color, fontSize: '12px' }}>
                      <IconGlobe /> {config.label}
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-6 col-xl-12">
                      <small className="text-muted d-block text-uppercase fw-bold mb-1 ls-1" style={{ fontSize: '11px' }}>Publiée le</small>
                      <span className="fw-bold text-dark d-block">
                        {announcement.created_at 
                          ? new Date(announcement.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : "-"}
                      </span>
                    </div>

                    <div className="col-6 col-xl-12">
                      <small className="text-muted d-block text-uppercase fw-bold mb-1 ls-1" style={{ fontSize: '11px' }}>Identifiant</small>
                      <span className="font-monospace text-secondary d-block">#ANNC-{announcement.id}</span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="d-flex flex-column gap-2 mt-2">
                      {/* 🔥 CORRECTION : Lien d'édition dynamique */}
                      <Link 
                        to={editPath}
                        className="btn btn-dark w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm btn-hover-scale"
                      >
                        <IconEdit /> Modifier
                      </Link>
                      <button 
                        onClick={handleDelete} 
                        className="btn btn-outline-danger w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 btn-hover-scale"
                      >
                        <IconTrash /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="col-12 col-xl-9 bg-white p-4 p-lg-5">
                <div className="content-wrapper">
                    <h1 className="fw-extrabold text-dark mb-4 lh-tight display-6">
                    {announcement.title}
                    </h1>

                    <div className="message-body position-relative">
                        <div className="fs-5 text-dark-emphasis lh-relaxed mb-4" style={{ whiteSpace: "pre-wrap", textAlign: 'justify' }}>
                            {announcement.message}
                        </div>
                    </div>
                    
                    {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
                    <div className="mt-5 pt-4 border-top d-flex align-items-center text-muted">
                        <div className="bg-light rounded-pill px-3 py-1 fw-medium" style={{ fontSize: '12px' }}>
                            Mis à jour le {new Date(announcement.updated_at).toLocaleString('fr-FR')}
                        </div>
                    </div>
                    )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fw-extrabold { font-weight: 800; }
        .ls-1 { letter-spacing: 0.05rem; }
        .border-top-accent { border-top: 6px solid var(--accent-color) !important; }
        
        .hover-dark-link:hover { color: #0d6efd !important; transform: translateX(-4px); }
        .btn-hover-scale:hover { transform: scale(1.02); transition: 0.2s; }
        
        .message-body {
          min-height: 200px;
          color: #2c3e50;
        }

        @media (min-width: 1200px) {
          .border-end-xl { border-right: 1px solid #f0f0f0 !important; }
        }

        @media (max-width: 768px) {
          .display-6 { font-size: 1.5rem; }
          .fs-5 { font-size: 1rem !important; }
        }

        .lh-relaxed { line-height: 1.8; }
        .transition-all { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
}