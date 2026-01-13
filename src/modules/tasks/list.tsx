import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import type { Task } from "./model";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";

// --- Icônes SVG ---
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

export default function TaskList() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [isManager, setIsManager] = useState(false);

  const isAdmin = user?.role === "admin";
  const routePrefix = isAdmin ? "/admin/tasks" : "/employee/tasks";

  useEffect(() => {
    const checkManagerStatus = async () => {
      if (user?.role === "employee") {
        try {
          const res = await api.get("/me");
          const hasManagerRole = res.data.employee?.roles?.some((r: any) => r.name === "manager");
          setIsManager(hasManagerRole || false);
        } catch (e) { console.error(e); }
      } else { setIsManager(user?.role === "manager"); }
    };
    checkManagerStatus();
  }, [user]);

  const canManage = isAdmin || isManager;

  const load = async () => {
    setLoading(true);
    try {
      const endpoint = canManage ? `/tasks?page=${page}` : `/me/tasks`;
      const res = await api.get(endpoint);
      const data = res.data.data || res.data;
      setTasks(Array.isArray(data) ? data : []);
      setMeta(res.data.meta || {});
    } catch (error) { setTasks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, canManage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette mission ?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const colors = s === 'completed' ? 'st-green' : s === 'in_progress' ? 'st-blue' : 'st-amber';
    const label = s === 'completed' ? 'Terminée' : s === 'in_progress' ? 'En cours' : 'En attente';
    return <span className={`status-pill ${colors}`}>{label}</span>;
  };

  if (loading && tasks.length === 0) return <div className="loader-p">Chargement...</div>;

  return (
    <div className="task-page-container">
      {/* HEADER ADAPTATIF */}
      <div className="task-header">
        <div className="header-text">
          <h2>Gestion des Missions</h2>
          <p>Suivi des tâches opérationnelles</p>
        </div>
        {canManage && (
          <Link to={`${routePrefix}/create`} className="add-task-btn">
            <IconPlus /> <span>Nouvelle mission</span>
          </Link>
        )}
      </div>

      {/* VUE TABLEAU (DESKTOP) */}
      <div className="desktop-view shadow-sm">
        <table className="task-table">
          <thead>
            <tr>
              <th>Mission</th>
              <th>Assignée à</th>
              <th>Statut</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td className="fw-bold">{t.title}</td>
                <td><IconUser /> {t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : 'Non assignée'}</td>
                <td>{getStatusBadge(t.status)}</td>
                <td className="text-end">
                  <div className="action-group">
                    <Link to={`${routePrefix}/${t.id}`} className="btn-v">Voir</Link>
                    {canManage && <Link to={`${routePrefix}/${t.id}/edit`} className="btn-e">Modifier</Link>}
                    {isAdmin && (
                      <button onClick={() => handleDelete(t.id)} className="btn-d" title="Supprimer">
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VUE MOBILE (CARTES) */}
      <div className="mobile-view">
        {tasks.map(t => (
          <div key={t.id} className="task-mobile-card">
            <div className="card-top">
              <span className="card-title">{t.title}</span>
              {getStatusBadge(t.status)}
            </div>
            <div className="card-body">
              <IconUser /> {t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : 'Non assignée'}
            </div>
            <div className="card-actions">
              <Link to={`${routePrefix}/${t.id}`} className="m-btn view">Voir</Link>
              {canManage && <Link to={`${routePrefix}/${t.id}/edit`} className="m-btn edit">Modifier</Link>}
              {isAdmin && (
                <button onClick={() => handleDelete(t.id)} className="m-btn delete">
                  <IconTrash /> Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {canManage && meta.last_page > 1 && (
        <div className="pagination-box shadow-sm">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
          <span className="page-info">{page} / {meta.last_page}</span>
          <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
      )}

      <style>{`
        .task-page-container { padding: 20px; background: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
        .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 15px; }
        .header-text h2 { font-weight: 800; color: #1e293b; margin: 0; font-size: 1.5rem; }
        .header-text p { color: #64748b; margin: 0; font-size: 0.9rem; }
        .add-task-btn { background: #059669; color: white; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }

        .desktop-view { display: block; background: white; border-radius: 16px; overflow: hidden; }
        .mobile-view { display: none; }

        .task-table { width: 100%; border-collapse: collapse; }
        .task-table th { background: #f1f5f9; padding: 15px 20px; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #64748b; }
        .task-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 0.95rem; }
        
        .status-pill { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .st-green { background: #dcfce7; color: #166534; }
        .st-blue { background: #e0f2fe; color: #0369a1; }
        .st-amber { background: #fef3c7; color: #92400e; }

        .action-group { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
        .btn-v, .btn-e, .btn-d { padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; }
        .btn-v { border: 1px solid #e2e8f0; color: #1e293b; }
        .btn-e { background: #f59e0b; color: white; }
        .btn-d { background: #fee2e2; color: #ef4444; border: none; cursor: pointer; }
        .btn-d:hover { background: #ef4444; color: white; }

        .task-mobile-card { background: white; padding: 18px; border-radius: 16px; margin-bottom: 15px; border: 1px solid #f1f5f9; }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .card-title { font-weight: 800; color: #1e293b; font-size: 1.05rem; }
        .card-body { color: #64748b; font-size: 0.9rem; margin-bottom: 18px; display: flex; align-items: center; }
        
        .card-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; }
        .m-btn { border: none; text-align: center; padding: 10px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .m-btn.view { background: #f1f5f9; color: #1e293b; }
        .m-btn.edit { background: #fef3c7; color: #92400e; }
        .m-btn.delete { background: #fee2e2; color: #ef4444; width: 100%; grid-column: span 2; }

        .pagination-box { margin-top: 20px; background: white; padding: 15px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .pagination-box button { border: 1px solid #e2e8f0; background: white; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .pagination-box button:disabled { opacity: 0.5; cursor: not-allowed; }
        .page-info { font-weight: 700; color: #1e293b; }

        @media (max-width: 768px) {
          .desktop-view { display: none; }
          .mobile-view { display: block; }
          .task-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .add-task-btn { width: 100%; justify-content: center; padding: 14px; }
          .m-btn.delete { grid-column: span 2; }
        }
      `}</style>
    </div>
  );
}