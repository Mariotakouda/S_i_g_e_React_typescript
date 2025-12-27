// src/modules/announcements/list.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnnouncements, deleteAnnouncement } from "./service";
import type { Announcement } from "./model";

// --- Composants d'icônes SVG ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await fetchAnnouncements(search, page);
      setAnnouncements(data.data);
      setMeta(data.meta);
      setError("");
    } catch (err: any) {
      setError("Impossible de charger les annonces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search, page]);

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await deleteAnnouncement(id);
      load();
    } catch (err: any) {
      alert("Erreur lors de la suppression");
    }
  }

  function getDestinataireLabel(announcement: Announcement) {
    if (announcement.is_general) return { label: "Général", class: "bg-primary-subtle text-primary border border-primary" };
    if (announcement.department) return { label: announcement.department.name, class: "bg-warning-subtle text-warning-emphasis border border-warning" };
    if (announcement.employee) return { label: `${announcement.employee.first_name} ${announcement.employee.last_name}`, class: "bg-info-subtle text-info-emphasis border border-info" };
    return { label: "Général", class: "bg-secondary-subtle border border-secondary" };
  }

  return (
    <div className="container-fluid py-5 px-md-5 bg-light min-vh-100">
      
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h1 className="display-6 fw-bold text-dark mb-2">Gestion des Annonces</h1>
          {meta && <p className="text-muted fs-5 mb-0 font-monospace">Total : {meta.total} annonces</p>}
        </div>
        <Link to="create" className="btn btn-primary btn-lg d-inline-flex align-items-center shadow px-4 py-3 rounded-3">
          <IconPlus />
          <span className="fw-bold ms-2">Nouvelle annonce</span>
        </Link>
      </div>

      {/* Recherche */}
      <div className="card border-0 shadow-sm mb-5 rounded-4 overflow-hidden">
        <div className="card-body p-3 bg-white">
          <div className="input-group input-group-lg">
            <span className="input-group-text bg-transparent border-0 text-muted ps-4">
              <IconSearch />
            </span>
            <input 
              className="form-control border-0 bg-transparent fs-5 py-3" 
              placeholder="Rechercher par titre ou contenu..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm fs-5 p-4 mb-4">{error}</div>}

      {/* Vue Mobile : Cartes (Emojis remplacés par SVG) */}
      <div className="d-block d-md-none">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : announcements.map((a) => {
          const dest = getDestinataireLabel(a);
          return (
            <div key={a.id} className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`badge rounded-pill px-3 py-2 fs-6 ${dest.class}`}>{dest.label}</span>
                  <span className="text-muted small">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}</span>
                </div>
                <h4 className="fw-bold text-dark mb-2">{a.title}</h4>
                <p className="text-muted fs-5 text-truncate mb-4">{a.message}</p>
                <div className="d-flex gap-2 mt-3">
                  <Link to={`${a.id}`} className="btn btn-light btn-lg flex-grow-1 border d-flex align-items-center justify-content-center gap-2">
                    <IconEye /> Détails
                  </Link>
                  <Link to={`${a.id}/edit`} className="btn btn-light btn-lg border text-warning d-flex align-items-center px-3"><IconEdit /></Link>
                  <button onClick={() => handleDelete(a.id)} className="btn btn-light btn-lg border text-danger d-flex align-items-center px-3"><IconTrash /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vue Desktop : Tableau */}
      <div className="card border-0 shadow rounded-4 overflow-hidden bg-white d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-secondary fw-bold fs-6" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th className="px-4 py-4 border-0">ID</th>
                <th className="py-4 border-0">Destinataire</th>
                <th className="py-4 border-0" style={{ width: '45%' }}>Annonce</th>
                <th className="py-4 border-0">Date</th>
                <th className="py-4 border-0 text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="fs-5">
              {!loading && announcements.map((a) => {
                const dest = getDestinataireLabel(a);
                return (
                  <tr key={a.id} className="border-top">
                    <td className="px-4 py-4 text-muted fs-6">#{a.id}</td>
                    <td className="py-4">
                      <span className={`badge rounded-3 px-3 py-2 fw-semibold fs-6 ${dest.class}`}>{dest.label}</span>
                    </td>
                    <td className="py-4">
                      <div className="fw-bold text-dark mb-1 fs-4">{a.title}</div>
                      <div className="text-muted text-truncate fs-6" style={{ maxWidth: '400px' }}>{a.message}</div>
                    </td>
                    <td className="py-4 text-muted fs-6">{a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : "-"}</td>
                    <td className="text-center px-4 py-4">
                      <div className="d-inline-flex gap-3">
                        <Link to={`${a.id}`} className="btn btn-outline-primary border-2 p-2 rounded-3"><IconEye /></Link>
                        <Link to={`${a.id}/edit`} className="btn btn-outline-warning border-2 p-2 rounded-3"><IconEdit /></Link>
                        <button onClick={() => handleDelete(a.id)} className="btn btn-outline-danger border-2 p-2 rounded-3"><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination XXL */}
      {meta && meta.last_page > 1 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 gap-4">
          <div className="text-muted fs-5 fw-medium">Page <span className="text-primary fw-bold">{meta.current_page}</span> sur {meta.last_page}</div>
          <div className="d-flex gap-3 w-100 w-md-auto">
            <button className="btn btn-white border-2 btn-lg flex-grow-1 px-5 fw-bold shadow-sm rounded-pill" onClick={() => setPage(page - 1)} disabled={loading || page <= 1}>Précédent</button>
            <button className="btn btn-white border-2 btn-lg flex-grow-1 px-5 fw-bold shadow-sm rounded-pill" onClick={() => setPage(page + 1)} disabled={loading || page >= meta.last_page}>Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}