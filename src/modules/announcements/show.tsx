// src/modules/announcements/show.tsx
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

  useEffect(() => {
    async function loadData() {
      try {
        const [announcementData, status] = await Promise.all([
          getAnnouncement(Number(id)),
          checkManagerStatus()
        ]);
        setAnnouncement(announcementData);
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
      nav("/admin/announcements");
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
    if (announcement?.department) return { label: `Département : ${announcement.department.name}`, color: "#856404", bg: "#fff3cd" };
    if (announcement?.employee) return { label: `Personnel : ${announcement.employee.first_name} ${announcement.employee.last_name}`, color: "#055160", bg: "#cff4fc" };
    return { label: "Annonce", color: "#6c757d", bg: "#f8f9fa" };
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (error || !announcement) return (
    <div className="container-fluid py-5 text-center">
      <div className="alert alert-danger shadow-sm border-0 d-inline-block p-4 rounded-4">
        <p className="mb-3 fw-bold">{error || "Annonce introuvable"}</p>
        <button onClick={() => nav("/admin/announcements")} className="btn btn-secondary rounded-pill px-4">Retour</button>
      </div>
    </div>
  );

  const config = getDestinataireConfig();
  const canManage = canManageAnnouncement();

  return (
    <div className="bg-light min-vh-100 py-3 py-md-4">
      {/* Utilisation de container-fluid pour occuper toute la largeur */}
      <div className="container-fluid px-2 px-md-4 px-lg-5"> 
        
        {/* Barre de navigation supérieure */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Link to="/admin/announcements" className="text-decoration-none text-secondary fw-semibold d-inline-flex align-items-center gap-2 hover-dark">
            <IconArrowLeft /> <span>Retour au tableau de bord</span>
          </Link>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {/* Ligne d'accentuation colorée */}
          <div style={{ height: "6px", backgroundColor: config.color }}></div>

          <div className="card-body p-4 p-lg-5 bg-white">
            
            <div className="row">
              {/* Colonne Gauche : Infos contextuelles (Largeur fixe sur PC) */}
              <div className="col-12 col-xl-3 border-end-xl mb-4 mb-xl-0">
                <div className="d-flex flex-column gap-3">
                  <span className="px-3 py-2 rounded-2 fw-bold text-uppercase d-inline-flex align-items-center gap-2" 
                        style={{ backgroundColor: config.bg, color: config.color, fontSize: '11px', letterSpacing: '0.5px', width: 'fit-content' }}>
                    <IconGlobe /> {config.label}
                  </span>
                  
                  <div className="mt-2">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '10px' }}>Date de publication</small>
                    <span className="fw-bold text-dark">
                      {new Date(announcement.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="mt-2">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '10px' }}>Référence</small>
                    <span className="font-monospace text-secondary">#ANNC-{announcement.id}</span>
                  </div>

                  {canManage && (
                    <div className="d-flex flex-column gap-2 mt-4 pt-4 border-top">
                      <Link 
                        to={`/admin/announcements/${id}/edit`} 
                        className="btn btn-dark w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all"
                      >
                        <IconEdit /> Modifier
                      </Link>
                      <button 
                        onClick={handleDelete} 
                        className="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 transition-all"
                      >
                        <IconTrash /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne Droite : Contenu (Prend tout le reste de la largeur) */}
              <div className="col-12 col-xl-9 ps-xl-5">
                <h1 className="fw-bold text-dark mb-4 display-6">
                  {announcement.title}
                </h1>

                <div className="border-start border-4 border-light ps-4 py-1">
                  <div className="fs-4 text-dark-emphasis lh-base message-container" style={{ whiteSpace: "pre-wrap" }}>
                    {announcement.message}
                  </div>
                </div>
                
                {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
                   <div className="mt-5 pt-3 border-top">
                     <small className="text-muted italic">Dernière mise à jour : {new Date(announcement.updated_at).toLocaleString('fr-FR')}</small>
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .hover-dark:hover { color: #000 !important; }
        .transition-all:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .btn-dark { background-color: #1a1d20; border: none; font-weight: 600; }
        .btn-dark:hover { background-color: #000; }
        .message-container { color: #2d3436; font-weight: 400; }
        
        @media (min-width: 1200px) {
          .border-end-xl { border-right: 1px solid #eee !important; }
        }

        @media (max-width: 768px) {
          .display-6 { font-size: 1.75rem; }
          .fs-4 { font-size: 1.15rem !important; }
        }
      `}</style>
    </div>
  );
}