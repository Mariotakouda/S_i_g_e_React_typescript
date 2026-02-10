import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { DepartmentService } from "./service";
import type { Department } from "./model";

// --- Composant Skeleton pour un aspect plus fluide au chargement ---
const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i} className="skeleton-row">
        <td className="ps-4"><div className="skeleton-line" style={{ width: '60%' }}></div></td>
        <td><div className="skeleton-line" style={{ width: '40%' }}></div></td>
        <td className="text-center"><div className="skeleton-line mx-auto" style={{ width: '100px' }}></div></td>
      </tr>
    ))}
  </>
);

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
      setError(err.response?.data?.message || "Erreur de chargement des départements");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Recherche avec Debounce (500ms) pour éviter les appels excessifs
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Si on recherche, on repart à la page 1
      if (search !== "") {
          setPage(1);
      }
      load();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, reloadKey, load]);

  // Gestion de la pagination (appel direct sans délai)
  useEffect(() => {
    load();
  }, [page, load]);

  // Écoute du rafraîchissement demandé par d'autres pages
  useEffect(() => {
    if (location.state && (location.state as any).refresh) {
      setReloadKey(prev => prev + 1);
    }
  }, [location.state]);

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
          <p className="text-muted small m-0">Gérez la structure organisationnelle de l'entreprise</p>
        </div>
        <Link to="/admin/departments/create" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 shadow-sm fw-bold border-0 rounded-3" style={{ backgroundColor: "#2563eb" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nouveau département</span>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-2 p-md-3 rounded-4 shadow-sm border mb-4">
        <div className="position-relative">
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
      </div>

      {/* ERROR DISPLAY (Option 1 : Résout l'erreur ts6133) */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="fw-medium">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted text-uppercase ls-1">
                <th className="ps-4 py-3">Nom du département</th>
                <th className="py-3">Responsable (Manager)</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : departments.length > 0 ? (
                departments.map((d) => (
                  <tr key={d.id} className="transition-all">
                    <td className="ps-4 fw-bold text-dark">{d.name}</td>
                    <td>
                      {d.manager ? (
                         <span className="badge px-3 py-2 fw-medium rounded-pill" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
                           {d.manager.first_name} {d.manager.last_name}
                         </span>
                      ) : <span className="text-muted small fst-italic">Non assigné</span>}
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <ActionButtons d={d} remove={remove} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && departments.length === 0 && (
          <div className="p-5 text-center">
            <div className="mb-3 text-muted opacity-50">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </div>
            <p className="text-muted fw-medium">Aucun département trouvé.</p>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && meta.last_page > 1 && (
          <div className="p-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 bg-light-subtle">
            <span className="small text-muted fw-bold">Page {meta.current_page} sur {meta.last_page}</span>
            <div className="btn-group shadow-sm">
              <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1} 
                className="btn btn-sm btn-white border px-4"
              >
                Précédent
              </button>
              <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === meta.last_page} 
                className="btn btn-sm btn-white border px-4"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ls-1 { letter-spacing: 0.05rem; }
        .btn-white { background: #fff; color: #64748b; font-weight: 600; }
        .btn-white:hover:not(:disabled) { background: #f1f5f9; color: #1e293b; }
        .skeleton-line { height: 12px; background: #f1f5f9; border-radius: 4px; position: relative; overflow: hidden; }
        .skeleton-line::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: wave 1.5s infinite; }
        @keyframes wave { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .transition-all { transition: all 0.2s ease; }
        .table-hover tbody tr:hover { background-color: #f8fafc; }
      `}</style>
    </div>
  );
}

function ActionButtons({ d, remove }: { d: any, remove: any }) {
  return (
    <>
      <Link to={`/admin/departments/${d.id}`} className="btn btn-sm btn-light border p-2 rounded-2 text-primary shadow-sm shadow-hover" title="Voir les détails">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      </Link>
      <Link to={`/admin/departments/${d.id}/edit`} className="btn btn-sm btn-light border p-2 rounded-2 text-warning shadow-sm shadow-hover" title="Modifier">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
      </Link>
      <button onClick={() => remove(d.id)} className="btn btn-sm btn-light border p-2 rounded-2 text-danger shadow-sm shadow-hover" title="Supprimer">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
      </button>
    </>
  );
}