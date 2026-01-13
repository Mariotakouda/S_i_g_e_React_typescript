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

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!window.confirm("Confirmer la suppression définitive de ce département ?")) return;
    try {
      await DepartmentService.remove(Number(id));
      navigate("/admin/departments", { state: { refresh: true } });
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-grow text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
        <p className="mt-3 text-muted fw-medium">Chargement des ressources...</p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm mx-auto p-5 text-center" style={{ maxWidth: "500px", borderRadius: "16px" }}>
          <div className="text-danger mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h4 className="fw-bold">Données indisponibles</h4>
          <p className="text-muted mb-4">{error || "Le département demandé n'existe pas ou a été déplacé."}</p>
          <Link to="/admin/departments" className="btn btn-dark px-4 py-2 rounded-3 text-decoration-none fw-bold">
            Retour à l'annuaire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 px-3 px-md-5" style={{ backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        
        {/* TOP NAVIGATION & ACTIONS */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <Link to="/admin/departments" className="btn btn-sm btn-white border shadow-xs mb-3 d-inline-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark fw-semibold" style={{ borderRadius: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Retour à la liste
            </Link>
            <h1 className="h2 fw-bold text-dark mb-0">{department.name}</h1>
            <p className="text-muted mb-0 small">Fiche détaillée de l'entité organisationnelle</p>
          </div>
          
          <div className="d-flex gap-2">
            <Link to={`/admin/departments/${department.id}/edit`} className="btn btn-white border shadow-sm px-4 py-2 d-flex align-items-center gap-2 fw-bold rounded-3 text-decoration-none text-dark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Éditer
            </Link>
            <button onClick={handleDelete} className="btn btn-outline-danger px-4 py-2 d-flex align-items-center gap-2 fw-bold rounded-3 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Supprimer
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* MAIN CONTENT CARD */}
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-header bg-white border-bottom p-4">
                <h6 className="text-secondary small text-uppercase fw-bold mb-0" style={{ letterSpacing: "1px" }}>Informations Générales</h6>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <label className="text-muted small fw-semibold text-uppercase d-block mb-2">Description du poste / département</label>
                  <div className="p-3 bg-light rounded-3 text-dark border-start border-4 border-primary" style={{ lineHeight: "1.7" }}>
                    {department.description || "Aucune description technique enregistrée pour ce département."}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <span className="text-muted small d-block">Identifiant unique</span>
                      <span className="fw-bold">REF-{department.id.toString().padStart(4, '0')}</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-white">
                      <span className="text-muted small d-block">Dernière mise à jour</span>
                      <span className="fw-bold text-truncate d-block">07 Janv. 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR : MANAGER INFO */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-bottom p-4">
                <h6 className="text-secondary small text-uppercase fw-bold mb-0" style={{ letterSpacing: "1px" }}>Responsable d'unité</h6>
              </div>
              <div className="card-body p-4 d-flex flex-column justify-content-center text-center">
                {department.manager ? (
                  <>
                    <div className="position-relative mx-auto mb-3" style={{ width: "90px" }}>
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                           style={{ width: "90px", height: "90px", fontSize: "2rem" }}>
                        {department.manager.first_name[0]}{department.manager.last_name[0]}
                      </div>
                      <span className="position-absolute bottom-0 end-0 bg-success border border-white border-3 rounded-circle p-2" title="Actif"></span>
                    </div>
                    
                    <h4 className="fw-bold text-dark mb-1">
                      {department.manager.first_name} {department.manager.last_name}
                    </h4>
                    <p className="text-muted small mb-4">{department.manager.email || "email-non-renseigne@entreprise.com"}</p>
                    
                    <div className="d-grid gap-2">
                      <button className="btn btn-dark rounded-3 fw-bold py-2 shadow-xs">
                        Consulter le profil
                      </button>
                      <button className="btn btn-outline-secondary rounded-3 fw-bold py-2">
                        Contacter via Teams/Email
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-4">
                    <div className="text-muted mb-3">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <p className="fw-medium text-muted mb-4 fst-italic">Ce département n'a actuellement aucun manager assigné.</p>
                    <Link to={`/admin/departments/${id}/edit`} className="btn btn-primary rounded-3 px-4 fw-bold shadow-sm text-decoration-none">
                      Assigner un responsable
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}