import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import type { Task } from "./model";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";

// --- Composants Icônes SVG ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

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
          const employee = res.data.employee;
          const hasManagerRole = employee?.roles?.some((r: any) => r.name === "manager");
          setIsManager(hasManagerRole || false);
        } catch (e) {
          console.error("Erreur vérification manager:", e);
        }
      } else {
        setIsManager(user?.role === "manager");
      }
    };
    checkManagerStatus();
  }, [user]);

  const canManage = isAdmin || isManager;

  const load = async () => {
    setLoading(true);
    try {
      let res;
      if (canManage) {
        res = await api.get(`/tasks?page=${page}`);
      } else {
        res = await api.get(`/me/tasks`);
      }
      const data = res.data.data || res.data;
      setTasks(Array.isArray(data) ? data : []);
      setMeta(res.data.meta || {});
    } catch (error: any) {
      console.error("Erreur chargement tâches:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, canManage]);

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
    switch (status.toLowerCase()) {
      case 'completed': return <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Terminée</span>;
      case 'pending': return <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">En attente</span>;
      case 'in_progress': return <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">En cours</span>;
      default: return <span className="badge bg-light text-dark border rounded-pill px-3">{status}</span>;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span className="text-muted fw-medium">Chargement des missions...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">Gestion des Missions</h2>
          <p className="text-muted small mb-0">Suivi et administration des tâches opérationnelles</p>
        </div>
        
        {canManage && (
          <Link to={`${routePrefix}/create`} className="btn btn-success d-flex align-items-center gap-2 shadow-sm fw-bold px-4 py-2 text-decoration-none">
            <IconPlus /> Nouvelle mission
          </Link>
        )}
      </div>

      {/* Table Container */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-bottom text-nowrap">
              <tr>
                <th className="ps-4 py-3 text-muted fw-bold small text-uppercase" style={{ width: '35%' }}>Mission</th>
                <th className="py-3 text-muted fw-bold small text-uppercase">Assignée à</th>
                <th className="py-3 text-muted fw-bold small text-uppercase">Statut</th>
                <th className="pe-4 py-3 text-end text-muted fw-bold small text-uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map(t => (
                  <tr key={t.id}>
                    <td className="ps-4 py-3 text-dark fw-medium">
                      {t.title}
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center text-dark">
                        <IconUser />
                        {t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : <span className="text-muted fst-italic">Non assignée</span>}
                      </div>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="pe-4 py-3 text-end text-nowrap">
                      <div className="d-flex justify-content-end gap-2">
                        {/* Bouton VOIR */}
                        <Link to={`${routePrefix}/${t.id}`} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3 text-decoration-none">
                          <IconEye /> <span className="d-none d-lg-inline">Voir</span>
                        </Link>

                        {/* Bouton MODIFIER */}
                        {canManage && (
                          <Link to={`${routePrefix}/${t.id}/edit`} className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-3 text-decoration-none">
                            <IconEdit /> <span className="d-none d-lg-inline">Modifier</span>
                          </Link>
                        )}

                        {/* Bouton SUPPRIMER */}
                        {isAdmin && (
                          <button onClick={() => handleDelete(t.id)} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3">
                            <IconTrash /> <span className="d-none d-lg-inline">Supprimer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted fst-italic">
                    {!canManage ? "Aucune tâche ne vous a été assignée." : "Aucune mission trouvée."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {canManage && meta.last_page > 1 && (
          <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
            <button 
              className="btn btn-sm btn-outline-secondary px-3 shadow-none"
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Précédent
            </button>
            <span className="small text-muted">
              Page <strong>{meta.current_page || 1}</strong> sur {meta.last_page || 1}
            </span>
            <button 
              className="btn btn-sm btn-outline-secondary px-3 shadow-none"
              disabled={page === meta.last_page} 
              onClick={() => setPage(p => p + 1)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      <style>{`
        .table thead th { letter-spacing: 0.05em; border-bottom-width: 0; }
        .btn-success { background-color: #059669; border-color: #059669; }
        .btn-success:hover { background-color: #047857; border-color: #047857; }
        .bg-success-subtle { background-color: #dcfce7 !important; color: #166534 !important; }
        .bg-primary-subtle { background-color: #eff6ff !important; color: #1e40af !important; }
        .bg-warning-subtle { background-color: #fffbeb !important; color: #92400e !important; }
        .btn-outline-primary { color: #2563eb; border-color: #2563eb; }
        .btn-outline-primary:hover { background-color: #2563eb; color: white; }
        .text-nowrap { white-space: nowrap; }
      `}</style>
    </div>
  );
}