import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DepartmentService } from "./service";
import type { Department } from "./model";

export default function DepartmentShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await DepartmentService.get(Number(id));
      setDepartment(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Département introuvable");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return;
    try {
      await DepartmentService.remove(Number(id));
      navigate("/admin/departments", { state: { refresh: true } });
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary shadow-sm" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4">
          <h4 className="fw-bold text-danger">Erreur technique</h4>
          <p className="text-muted">{error || "Données introuvables"}</p>
          <Link to="/admin/departments" className="btn btn-danger mt-2 fw-bold rounded-pill px-4 text-decoration-none shadow-sm">
            Retourner à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "1000px" }}>
        
        {/* HEADER SECTION */}
        <div className="mb-4">
          <Link to="/admin/departments" className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-flex align-items-center gap-2 small fw-bold text-uppercase" style={{ letterSpacing: "1px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Retour
          </Link>
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white shadow-sm p-3 rounded-4 border border-light-subtle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </div>
              <div>
                <h2 className="fw-bold text-dark m-0 h3">{department.name}</h2>
                <div className="d-flex align-items-center gap-2 mt-1">
                   <span className="badge bg-primary-subtle text-primary border-0 fw-bold px-2 py-1">ID #{department.id}</span>
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Link to={`/admin/departments/${department.id}/edit`} className="btn btn-white border shadow-sm px-4 d-flex align-items-center gap-2 fw-bold rounded-3 text-decoration-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Modifier
              </Link>
              <button onClick={handleDelete} className="btn btn-danger px-4 d-flex align-items-center gap-2 fw-bold rounded-3 shadow-sm border-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* DESCRIPTION SECTION */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="mb-4">
                <h6 className="text-muted small text-uppercase fw-bold mb-3" style={{ letterSpacing: "0.5px" }}>Description du département</h6>
                <div className="p-4 bg-light rounded-4 text-secondary" style={{ minHeight: "200px", border: "1px solid #edf2f7" }}>
                  <p className="mb-0 fs-6" style={{ lineHeight: "1.8" }}>
                    {department.description || <span className="text-muted fst-italic">Aucune description détaillée n'a été fournie.</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MANAGER SECTION */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h6 className="text-muted small text-uppercase fw-bold mb-4" style={{ letterSpacing: "0.5px" }}>Manager Responsable</h6>
              
              {department.manager ? (
                <div className="text-center py-2">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold shadow-sm" 
                       style={{ width: "70px", height: "70px", fontSize: "1.4rem", border: "3px solid #fff" }}>
                    {department.manager.first_name[0]}{department.manager.last_name[0]}
                  </div>
                  
                  <h5 className="fw-bold text-dark mb-1">
                    {department.manager.first_name} {department.manager.last_name}
                  </h5>
                  <p className="text-muted small mb-4">{department.manager.email}</p>
                  
                  <div className="d-grid px-3">
                    <button className="btn btn-outline-primary rounded-pill fw-bold btn-sm py-2">
                      Envoyer un message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted small fst-italic mb-3">Aucun responsable assigné</p>
                  <Link to={`/admin/departments/${id}/edit`} className="btn btn-sm btn-light border rounded-pill px-4 fw-bold text-primary shadow-sm text-decoration-none">
                    Assigner un manager
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}