import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

// --- ICONES SVG ---
const Icons = {
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Empty: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
};

export default function EmployeeTaskList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/me/tasks")
      .then(res => setTasks(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-success-subtle text-success border-success-subtle",
      in_progress: "bg-primary-subtle text-primary border-primary-subtle",
      pending: "bg-secondary-subtle text-secondary border-secondary-subtle"
    };
    const labels = { completed: "Terminée", in_progress: "En cours", pending: "À faire" };
    
    const currentStyle = styles[status as keyof typeof styles] || styles.pending;
    const currentLabel = labels[status as keyof typeof labels] || labels.pending;

    return (
      <span className={`badge rounded-pill border px-3 py-2 ${currentStyle}`}>
        {currentLabel}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-white shadow-sm rounded-circle d-flex align-items-center justify-content-center border"
              style={{ width: "40px", height: "40px" }}>
              <Icons.Back />
            </button>
            <div>
              <h1 className="h4 mb-0 fw-bold text-dark">Missions Professionnelles</h1>
              <p className="text-muted small mb-0">{tasks.length} tâches assignées</p>
            </div>
          </div>
        </div>

        {/* LISTE */}
        <div className="row g-4">
          {tasks.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm p-5 text-center rounded-4">
                <div className="mb-3"><Icons.Empty /></div>
                <p className="text-muted mb-0 fw-medium">Aucune mission assignée pour le moment.</p>
              </div>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="col-12">
                <div className="card border-0 shadow-sm rounded-4 task-hover transition-all">
                  <div className="card-body p-4">
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h5 className="fw-bold text-dark mb-2" style={{ letterSpacing: "-0.02em" }}>
                          {task.title}
                        </h5>
                        <div className="d-flex align-items-center text-muted small">
                          <Icons.Calendar />
                          <span className="fw-medium">
                            Échéance : {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : "Non définie"}
                          </span>
                        </div>
                      </div>
                      <div className="ms-3">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>

                    <p className="text-secondary mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                      {task.description || "Aucune description détaillée fournie."}
                    </p>

                    <div className="pt-3 border-top d-flex justify-content-end">
                      <button className="btn btn-link btn-sm text-decoration-none fw-bold p-0 d-flex align-items-center gap-2 text-primary">
                        Détails de la mission
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .task-hover { transition: all 0.2s ease-in-out; background: #fff; }
        .task-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important; }
        .btn-white { background: #fff; color: #64748b; transition: all 0.2s; }
        .btn-white:hover { color: #3b82f6; border-color: #3b82f6; }
      `}</style>
    </div>
  );
}