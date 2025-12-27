// src/modules/roles/list.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RoleService } from "./service";
import type { Role, LaravelPaginationResponse } from "./model";

const initialPaginationState: LaravelPaginationResponse<Role> = {
  current_page: 1, data: [], last_page: 1, per_page: 10, total: 0,
  first_page_url: '', last_page_url: '', next_page_url: null, prev_page_url: null,
  from: null, to: null, path: '',
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Composant icône réutilisable pour la clarté
const Icon = ({ name }: { name: 'eye' | 'edit' | 'trash' | 'plus' | 'search' }) => {
  const icons = {
    eye: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  };
  return icons[name];
};

export default function RoleList() {
  const [paginationData, setPaginationData] = useState<LaravelPaginationResponse<Role>>(initialPaginationState);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: roles, total, current_page, last_page } = paginationData;

  const load = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await RoleService.list(currentPage, currentSearch);
      setPaginationData(res); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement.");
      setPaginationData(prev => ({ ...prev, data: [] })); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); 
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const remove = async (id: number, name: string) => {
    if (!window.confirm(`Supprimer le rôle "${name}" ?`)) return;
    try {
      await RoleService.remove(id);
      load(page, search);
    } catch (err: any) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-5 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">Rôles Utilisateurs</h2>
          <p className="text-muted small mb-0 font-monospace" style={{ fontSize: '11px' }}>TOTAL: {total}</p>
        </div>
        <Link to="create" className="btn btn-primary btn-sm d-inline-flex align-items-center shadow-sm px-3 py-2 rounded-3">
          <Icon name="plus" />
          <span className="fw-bold ms-2">Nouveau rôle</span>
        </Link>
      </div>

      {/* Recherche */}
      <div className="card border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-2">
          <form onSubmit={handleSearch} className="row g-2 text-center text-md-start">
            <div className="col-12 col-md">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                  <Icon name="search" />
                </span>
                <input 
                  className="form-control border-0 bg-transparent small" 
                  placeholder="Rechercher un rôle..." 
                  value={searchInput} 
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-auto d-flex gap-2 p-1">
              <button type="submit" className="btn btn-dark btn-sm px-4 fw-bold flex-grow-1" disabled={loading}>Filtrer</button>
              {search && <button type="button" onClick={handleClearSearch} className="btn btn-outline-secondary btn-sm px-2 border-0">✕</button>}
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm small py-2">{error}</div>}

      {/* Contenu principal */}
      {loading && roles.length === 0 ? (
        <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></div>
      ) : roles.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm small text-muted">Aucune donnée disponible.</div>
      ) : (
        <>
          {/* VUE MOBILE : Cartes avec SVG */}
          <div className="d-block d-md-none">
            {roles.map((r) => (
              <div key={r.id} className="card border-0 shadow-sm mb-3 rounded-4">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>{r.name}</h6>
                    <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: '10px' }}>{r.employees_count ?? 0} pers.</span>
                  </div>
                  <div className="text-muted mb-3" style={{ fontSize: '11px' }}>Créé le {formatDate(r.created_at)}</div>
                  <div className="d-flex gap-2">
                    <Link to={`${r.id}`} className="btn btn-white btn-sm flex-grow-1 border shadow-sm d-flex align-items-center justify-content-center py-2">
                      <Icon name="eye" /><span className="ms-2 fw-bold" style={{ fontSize: '12px' }}>Détails</span>
                    </Link>
                    <Link to={`${r.id}/edit`} className="btn btn-white btn-sm border shadow-sm px-3 text-warning d-flex align-items-center"><Icon name="edit" /></Link>
                    <button onClick={() => remove(r.id, r.name)} className="btn btn-white btn-sm border shadow-sm px-3 text-danger d-flex align-items-center"><Icon name="trash" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VUE DESKTOP : Tableau */}
          <div className="card border-0 shadow-sm d-none d-md-block rounded-4 overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.8px' }}>
                    <th className="px-4 py-3">ID</th>
                    <th className="py-3">Intitulé du rôle</th>
                    <th className="py-3 text-center">Effectif</th>
                    <th className="py-3">Date</th>
                    <th className="py-3 text-center px-4">Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '13px' }}>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-muted">#{r.id}</td>
                      <td className="py-3 fw-bold text-dark">{r.name}</td>
                      <td className="py-3 text-center">
                        <span className="fw-bold px-2 py-1 bg-light rounded text-primary" style={{ fontSize: '12px' }}>{r.employees_count ?? 0}</span>
                      </td>
                      <td className="py-3 text-muted small">{formatDate(r.created_at)}</td>
                      <td className="text-center px-4">
                        <div className="d-inline-flex gap-2">
                          <Link to={`${r.id}`} className="btn btn-outline-primary btn-sm rounded-3 p-2 d-flex shadow-sm"><Icon name="eye" /></Link>
                          <Link to={`${r.id}/edit`} className="btn btn-outline-warning btn-sm rounded-3 p-2 d-flex shadow-sm"><Icon name="edit" /></Link>
                          <button onClick={() => remove(r.id, r.name)} className="btn btn-outline-danger btn-sm rounded-3 p-2 d-flex shadow-sm"><Icon name="trash" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {last_page > 1 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
              <div className="text-muted" style={{ fontSize: '11px' }}>Page {current_page} sur {last_page}</div>
              <div className="d-flex gap-1 w-100 w-md-auto">
                <button className="btn btn-white border btn-sm flex-grow-1 px-3 py-2 fw-bold small shadow-sm" onClick={() => setPage(page - 1)} disabled={loading || current_page === 1}>Précédent</button>
                <button className="btn btn-white border btn-sm flex-grow-1 px-3 py-2 fw-bold small shadow-sm" onClick={() => setPage(page + 1)} disabled={loading || current_page === last_page}>Suivant</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}