import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { DepartmentService } from "./service";
import type { Department } from "./model";

export default function DepartmentList() {
  const location = useLocation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await DepartmentService.list(page, search);
      setDepartments(res.data || []);
      setMeta(res.meta || {});
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useEffect(() => {
    if (location.state && (location.state as any).refresh) {
      page !== 1 ? setPage(1) : load();
    }
  }, [location.state, load, page]);

  const remove = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return;
    try {
      await DepartmentService.remove(id);
      setReloadKey(prev => prev + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            Départements
          </h2>
          <p className="text-muted small m-0">Gérez la structure organisationnelle</p>
        </div>
        <Link to="/admin/departments/create" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 shadow-sm fw-bold border-0 rounded-3" style={{ backgroundColor: "#2563eb" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="d-md-inline">Nouveau département</span>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-2 p-md-3 rounded-4 shadow-sm border mb-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="row g-2">
          <div className="col-12 col-md-10 position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="form-control ps-5 py-2 border-light-subtle shadow-none"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </div>
          <div className="col-12 col-md-2">
            <button type="submit" className="btn btn-dark w-100 py-2 fw-bold" style={{ borderRadius: "10px" }}>
              Filtrer
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4">{error}</div>}

      <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
        
        {/* DESKTOP TABLE VIEW - ID REMOVED */}
        <div className="d-none d-md-block">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted uppercase">
                <th className="ps-4 py-3">Nom</th>
                <th className="py-3">Manager</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-5">Chargement...</td></tr>
              ) : departments.map((d) => (
                <tr key={d.id}>
                  <td className="ps-4 fw-bold text-dark">{d.name}</td>
                  <td>
                    {d.manager ? (
                       <span className="badge bg-blue-soft text-primary px-2 py-1 fw-normal" style={{ backgroundColor: "#eff6ff" }}>
                         {d.manager.first_name} {d.manager.last_name}
                       </span>
                    ) : <span className="text-muted small italic">Aucun</span>}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <ActionButtons d={d} remove={remove} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW - ID REMOVED */}
        <div className="d-md-none">
          {loading ? (
            <div className="p-5 text-center text-muted">Chargement...</div>
          ) : departments.map((d) => (
            <div key={d.id} className="p-3 border-bottom">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold m-0 text-dark">{d.name}</h6>
                </div>
                <div className="d-flex gap-2">
                  <ActionButtons d={d} remove={remove} isMobile />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="small text-muted">Manager:</span>
                <span className="small fw-medium">{d.manager ? `${d.manager.first_name} ${d.manager.last_name}` : "Non assigné"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && departments.length === 0 && (
          <div className="p-5 text-center text-muted">Aucun département trouvé.</div>
        )}

        {/* PAGINATION */}
        {!loading && meta.last_page > 1 && (
          <div className="p-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 bg-light-subtle">
            <span className="small text-muted fw-medium">Page {meta.current_page} sur {meta.last_page}</span>
            <div className="btn-group shadow-sm w-100 w-md-auto">
              <button onClick={() => setPage(page - 1)} disabled={!meta.prev_page_url} className="btn btn-sm btn-white border flex-fill px-4 py-2">Précédent</button>
              <button onClick={() => setPage(page + 1)} disabled={!meta.next_page_url} className="btn btn-sm btn-white border flex-fill px-4 py-2">Suivant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ d, remove, isMobile = false }: { d: any, remove: any, isMobile?: boolean }) {
  const size = isMobile ? 18 : 16;
  return (
    <>
      <Link to={`/admin/departments/${d.id}`} className="btn btn-sm btn-light border p-2 rounded-2 text-primary" title="Voir">
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      </Link>
      <Link to={`/admin/departments/${d.id}/edit`} className="btn btn-sm btn-light border p-2 rounded-2 text-warning" title="Modifier">
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
      </Link>
      <button onClick={() => remove(d.id)} className="btn btn-sm btn-light border p-2 rounded-2 text-danger" title="Supprimer">
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
      </button>
    </>
  );
}