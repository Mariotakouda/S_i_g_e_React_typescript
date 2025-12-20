import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

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
    switch (status) {
      case "completed": 
        return <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3">Terminée</span>;
      case "in_progress": 
        return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3">En cours</span>;
      default: 
        return <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle px-3">À faire</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Header avec Bootstrap Flex */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "35px", height: "35px" }}>
              <i className="bi bi-arrow-left">←</i>
            </button>
            <h1 className="h3 mb-0 fw-bold text-dark">Mes Missions Professionnelles</h1> <br /> <br />
          </div>
          <span className="text-muted small fw-medium"> ● {tasks.length}  Tâches au total</span>
        </div>

        {/* Liste des tâches */}
        <div className="row g-3">
          {tasks.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm p-5 text-center">
                <p className="text-muted mb-0">Aucune mission assignée pour le moment.</p>
              </div>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="col-12">
                <div className="card border-0 shadow-sm hover-shadow transition-all">
                  <div className="card-body p-4">
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title fw-bold text-primary-emphasis mb-1">{task.title}</h5>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted">
                            <i className="bi bi-calendar-event me-1"></i>
                            Échéance : {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Non définie"}
                          </small>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>

                    <p className="card-text text-secondary mb-3" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                      {task.description || "Aucune description détaillée fournie."}
                    </p>

                    <div className="border-top pt-3 d-flex justify-content-end">
                      <button className="btn btn-link btn-sm text-decoration-none fw-semibold p-0">
                        Consulter les détails →
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}