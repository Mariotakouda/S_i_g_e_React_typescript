import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fetchAnnouncements, deleteAnnouncement } from "./service";
import type { Announcement } from "./model";

// --- Composants d'icônes SVG (Standardisés) ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function AnnouncementList() {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManage = user?.role === 'admin' || user?.role === 'manager';

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

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      
      {/* Header Section */}
      <div className="row align-items-center mb-4">
        <div className="col-12 col-md-6 mb-3 mb-md-0 text-center text-md-start">
          <h1 className="h2 fw-bold text-dark mb-1">Annonces Externes</h1>
          <p className="text-muted small mb-0">Consultez et gérez les communications de l'entreprise</p>
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end">
          {canManage && (
            <Link to="create" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm">
              <IconPlus /> <span className="fw-semibold">Nouvelle Annonce</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar Area */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-0 text-muted ps-3">
              <IconSearch />
            </span>
            <input 
              className="form-control border-0 shadow-none py-2" 
              placeholder="Rechercher par titre, département..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-start border-4 border-danger">{error}</div>}

      {/* Mobile View (Cards) */}
      <div className="d-md-none">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : announcements.map((a) => {
          const dest = getDestinataireLabel(a);
          return (
            <div key={a.id} className="card border-0 shadow-sm mb-3 rounded-3 overflow-hidden">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={`badge rounded-1 px-2 py-1 small ${dest.class}`}>{dest.label}</span>
                  <small className="text-muted">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}</small>
                </div>
                <h5 className="fw-bold text-dark mb-1">{a.title}</h5>
                <p className="text-muted small text-truncate mb-3">{a.message}</p>
                <div className="d-grid gap-2 d-flex">
                  <Link to={`${a.id}`} className="btn btn-sm btn-outline-primary flex-grow-1"><IconEye /></Link>
                  {canManage && (
                    <>
                      <Link to={`${a.id}/edit`} className="btn btn-sm btn-outline-warning"><IconEdit /></Link>
                      <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-outline-danger"><IconTrash /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View (Table) */}
      <div className="d-none d-md-block card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-white border-bottom">
              <tr className="text-muted small">
                <th className="ps-4 py-3" style={{ width: '80px' }}>ID</th>
                <th className="py-3">DESTINATAIRE</th>
                <th className="py-3">SUJET</th>
                <th className="py-3">DATE</th>
                <th className="py-3 text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {!loading && announcements.map((a) => {
                const dest = getDestinataireLabel(a);
                return (
                  <tr key={a.id}>
                    <td className="ps-4 text-muted small">#{a.id}</td>
                    <td>
                      <span className={`badge fw-medium px-2 py-1 ${dest.class}`} style={{ fontSize: '0.75rem' }}>
                        {dest.label.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{a.title}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>{a.message}</div>
                    </td>
                    <td className="text-muted small">{a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : "-"}</td>
                    <td className="text-end pe-4">
                      <div className="btn-group shadow-sm rounded">
                        <Link to={`${a.id}`} className="btn btn-white btn-sm border-end px-3 text-primary" title="Voir"><IconEye /></Link>
                        {canManage && (
                          <>
                            <Link to={`${a.id}/edit`} className="btn btn-white btn-sm border-end px-3 text-warning" title="Modifier"><IconEdit /></Link>
                            <button onClick={() => handleDelete(a.id)} className="btn btn-white btn-sm px-3 text-danger" title="Supprimer"><IconTrash /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && announcements.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted mb-0">Aucune annonce trouvée.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
          <div className="text-muted small">
            Affichage de <span className="text-dark fw-bold">{announcements.length}</span> sur {meta.total} résultats
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0 shadow-sm">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <button className="page-link border-0 px-3 py-2" onClick={() => setPage(page - 1)}>Précédent</button>
              </li>
              <li className="page-item active">
                <span className="page-link border-0 px-3 py-2">{page}</span>
              </li>
              <li className={`page-item ${page >= meta.last_page ? 'disabled' : ''}`}>
                <button className="page-link border-0 px-3 py-2" onClick={() => setPage(page + 1)}>Suivant</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}