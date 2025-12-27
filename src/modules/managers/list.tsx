import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchManagers, deleteManager } from "./service";
import type { Manager } from "./model";

export default function ManagerList() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const loadManagers = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const data = await fetchManagers(page, search);
      setManagers(data.data || []);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setError("");
    } catch (err: any) {
      setError("Impossible de charger la liste des managers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagers(currentPage, searchQuery);
  }, [currentPage, searchQuery, loadManagers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadManagers(1, searchQuery);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce manager ?")) {
      setIsDeleting(id);
      try {
        await deleteManager(id);
        loadManagers(currentPage, searchQuery);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="container-fluid py-4 px-2 px-md-5 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark">Gestion des Managers</h1>
          <p className="text-muted small mb-0">Total : {managers.length} managers</p>
        </div>
        <Link to="/admin/managers/create" className="btn btn-primary d-inline-flex align-items-center justify-content-center shadow-sm py-2 px-4 rounded-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M5 12h14m-7-7v14"/></svg>
          <span className="fw-bold">Nouveau Manager</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm border-0 mb-4 rounded-3 small">
          {error}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="card border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-2">
          <form onSubmit={handleSearch} className="row g-2">
            <div className="col-12 col-md">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent border-0 ps-0 small"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-auto">
              <button type="submit" className="btn btn-dark btn-sm w-100 px-4 fw-bold">Chercher</button>
            </div>
          </form>
        </div>
      </div>

      {/* --- VUE MOBILE : Cartes --- */}
      <div className="d-block d-md-none">
        {loading && <div className="text-center py-4 small text-muted">Chargement...</div>}
        {!loading && managers.map((manager) => (
          <div key={manager.id} className="card border-0 shadow-sm mb-3 rounded-4">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <div className="fw-bold text-dark small">{manager.employee.first_name} {manager.employee.last_name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{manager.employee.email}</div>
                </div>
                <span className="badge bg-primary-subtle text-primary rounded-pill small" style={{ fontSize: '10px' }}>
                  {manager.department?.name || "Sans dép."}
                </span>
              </div>
              <div className="d-grid gap-2">
                {/* EMOJI UTILISÉ ICI POUR LE BOUTON MOBILE */}
                <Link to={`/admin/managers/${manager.id}`} className="btn btn-sm btn-light fw-bold py-2 border shadow-sm rounded-3">
                   👁️ Voir les détails
                </Link>
                <div className="d-flex gap-2">
                    <Link to={`/admin/managers/${manager.id}/edit`} className="btn btn-sm btn-outline-warning flex-grow-1 py-2">
                    Modifier
                    </Link>
                    <button onClick={() => handleDelete(manager.id)} className="btn btn-sm btn-outline-danger flex-grow-1 py-2">
                    Supprimer
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- VUE DESKTOP : Tableau --- */}
      <div className="card border-0 shadow-sm d-none d-md-block rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
              <tr>
                <th className="px-4 py-3">Gestionnaire</th>
                <th className="py-3">Département</th>
                <th className="py-3 text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px' }}>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-5">Chargement...</td></tr>
              ) : managers.length > 0 ? (
                managers.map((manager) => (
                  <tr key={manager.id}>
                    <td className="px-4 py-3 fw-bold text-dark">
                      {manager.employee.first_name} {manager.employee.last_name}
                      <div className="fw-normal text-muted small" style={{ fontSize: '11px' }}>{manager.employee.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="fw-medium">{manager.department?.name || "—"}</span>
                    </td>
                    <td className="text-center px-4">
                      <div className="d-inline-flex gap-2">
                        
                        {/* SVG UTILISÉ ICI POUR LE BOUTON DESKTOP (Icône Œil) */}
                        <Link to={`/admin/managers/${manager.id}`} className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', borderRadius: '8px' }} title="Détails">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </Link>
                        
                        <Link to={`/admin/managers/${manager.id}/edit`} className="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', borderRadius: '8px' }} title="Modifier">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Link>

                        <button onClick={() => handleDelete(manager.id)} disabled={isDeleting === manager.id} className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                          {isDeleting === manager.id ? <span className="spinner-border spinner-border-sm"></span> : 
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center py-5">Aucun manager.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-2">
          <div className="text-muted" style={{ fontSize: '11px' }}>Page {currentPage}/{lastPage}</div>
          <div className="d-flex gap-1">
            <button className="btn btn-white btn-sm border px-3 fw-bold" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1 || loading}>‹</button>
            <button className="btn btn-white btn-sm border px-3 fw-bold" onClick={() => setCurrentPage(p => Math.min(lastPage, p+1))} disabled={currentPage === lastPage || loading}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}