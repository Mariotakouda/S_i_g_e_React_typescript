import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fetchAnnouncements, deleteAnnouncement, checkManagerStatus } from "./service";
import type { Announcement } from "./model";
import type { ManagerStatus } from "./service";

// --- Composant d'icône réutilisable et lisible ---
const Icon = ({ name }: { name: 'eye' | 'edit' | 'trash' | 'plus' | 'search' }) => {
  const icons = {
    eye: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  };

  return (
    <span className={`icon-wrapper ic-${name}`}>
      {icons[name]}
    </span>
  );
};

export default function AnnouncementList() {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);

  // 🔥 CORRECTION : Déterminer si l'utilisateur peut gérer les annonces
  const canManage = user?.role === 'admin' || managerStatus?.is_manager || false;

  useEffect(() => {
    loadManagerStatus();
  }, []);

  async function loadManagerStatus() {
    try {
      const status = await checkManagerStatus();
      setManagerStatus(status);
    } catch (err) {
      console.error("Erreur chargement statut manager:", err);
    }
  }

  async function load() {
    try {
      setLoading(true);
      const data = await fetchAnnouncements(search, page);
      setAnnouncements(data.data);
      setMeta(data.meta);
      setError("");
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search, page]);

  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;
    try {
      await deleteAnnouncement(id);
      load();
    } catch (err: any) {
      alert("Erreur lors de la suppression");
    }
  }

  function getDestinataireLabel(announcement: Announcement) {
    if (announcement.is_general) return { label: "Général", class: "bg-primary text-white" };
    if (announcement.department) return { label: announcement.department.name, class: "bg-info text-dark" };
    if (announcement.employee) return { label: "Privé", class: "bg-secondary text-white" };
    return { label: "Public", class: "bg-light text-dark border" };
  }

  // 🔥 Fonction pour déterminer si un manager peut modifier/supprimer une annonce spécifique
  function canManageAnnouncement(announcement: Announcement): boolean {
    if (user?.role === 'admin') return true;
    if (!managerStatus?.is_manager) return false;
    
    // Le manager peut gérer si:
    // 1. C'est son annonce
    // 2. L'annonce concerne son département
    return announcement.user_id === user?.id || 
           announcement.department_id === managerStatus.department_id;
  }

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      
      {/* --- HEADER --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Annonces Externes</h1>
          <p className="text-muted mb-0 font-monospace" style={{ fontSize: '13px' }}>
            TOTAL: <span className="fw-bold">{meta?.total || 0}</span>
          </p>
        </div>
        
        {/* 🔥 CORRECTION : Bouton créer uniquement pour admin/manager */}
        {canManage && (
          <Link to="create" className="btn btn-primary d-inline-flex align-items-center shadow-sm px-4 py-2 rounded-3">
            <Icon name="plus" /> 
            <span className="fw-bold ms-2">Nouvelle annonce</span>
          </Link>
        )}
      </div>

      {/* 🔥 Info pour les employés simples */}
      {!canManage && (
        <div className="alert alert-info border-0 shadow-sm rounded-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '20px' }}>ℹ️</span>
            <span>Vous consultez les annonces. Seuls les managers et administrateurs peuvent en créer ou les modifier.</span>
          </div>
        </div>
      )}

      {/* --- RECHERCHE --- */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <Icon name="search" />
            </span>
            <input 
              className="form-control border-0 bg-transparent shadow-none" 
              placeholder="Rechercher par titre, département..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ fontSize: '15px', padding: '12px 10px' }}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0 py-3 small">{error}</div>}

      {/* --- VUE MOBILE (Cartes) --- */}
      <div className="d-md-none">
        {loading && announcements.length === 0 ? (
          <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>
        ) : announcements.map((a) => {
          const dest = getDestinataireLabel(a);
          const canManageThis = canManageAnnouncement(a);
          
          return (
            <div key={a.id} className="card border-0 shadow-sm mb-3 rounded-4">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={`badge rounded-pill px-3 py-2 ${dest.class}`} style={{ fontSize: '11px' }}>{dest.label}</span>
                  <small className="text-muted" style={{ fontSize: '12px' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}</small>
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '16px' }}>{a.title}</h5>
                <p className="text-muted mb-3" style={{ fontSize: '14px', lineHeight: '1.4' }}>{a.message}</p>
                <div className="d-flex gap-2">
                  <Link to={`${a.id}`} className="btn btn-white btn-sm flex-grow-1 border shadow-sm d-flex align-items-center justify-content-center py-2 px-3">
                    <Icon name="eye" /><span className="ms-2 fw-bold" style={{ fontSize: '13px' }}>Détails</span>
                  </Link>
                  {canManageThis && (
                    <>
                      <Link to={`${a.id}/edit`} className="btn btn-white btn-sm border shadow-sm px-3 text-warning d-flex align-items-center"><Icon name="edit" /></Link>
                      <button onClick={() => handleDelete(a.id)} className="btn btn-white btn-sm border shadow-sm px-3 text-danger d-flex align-items-center"><Icon name="trash" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- VUE DESKTOP (Tableau) --- */}
      <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', letterSpacing: '0.8px' }}>
                <th className="px-4 py-3">Destinataire</th>
                <th className="py-3">Sujet / Message</th>
                <th className="py-3">Date de publication</th>
                <th className="py-3 text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '14.5px' }}>
              {!loading && announcements.map((a) => {
                const dest = getDestinataireLabel(a);
                const canManageThis = canManageAnnouncement(a);
                
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-4">
                      <span className={`badge fw-bold px-3 py-2 rounded-pill ${dest.class}`} style={{ fontSize: '11px' }}>
                        {dest.label.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="fw-bold text-dark mb-1" style={{ fontSize: '15.5px' }}>{a.title}</div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '400px', fontSize: '13.5px' }}>
                        {a.message}
                      </div>
                    </td>
                    <td className="py-4 text-muted">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                    </td>
                    <td className="text-center px-4">
                      <div className="d-inline-flex gap-2">
                        <Link to={`${a.id}`} className="btn btn-outline-primary btn-sm rounded-3 p-2 d-flex shadow-sm" title="Voir"><Icon name="eye" /></Link>
                        {canManageThis && (
                          <>
                            <Link to={`${a.id}/edit`} className="btn btn-outline-warning btn-sm rounded-3 p-2 d-flex shadow-sm" title="Modifier"><Icon name="edit" /></Link>
                            <button onClick={() => handleDelete(a.id)} className="btn btn-outline-danger btn-sm rounded-3 p-2 d-flex shadow-sm" title="Supprimer"><Icon name="trash" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && announcements.length === 0 && (
            <div className="text-center py-5 text-muted">Aucune annonce disponible.</div>
          )}
        </div>
      </div>

      {/* --- PAGINATION --- */}
      {meta && meta.last_page > 1 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
          <div className="text-muted" style={{ fontSize: '13px' }}>
            Page <strong>{page}</strong> sur <strong>{meta.last_page}</strong>
          </div>
          <div className="d-flex gap-2 w-100 w-md-auto">
            <button className="btn btn-white border px-4 py-2 fw-bold shadow-sm rounded-3" onClick={() => setPage(page - 1)} disabled={loading || page === 1}>Précédent</button>
            <button className="btn btn-white border px-4 py-2 fw-bold shadow-sm rounded-3" onClick={() => setPage(page + 1)} disabled={loading || page === meta.last_page}>Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}