import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getManager, deleteManager } from "./service";
import type { Manager } from "./model";

export default function ManagerShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadManager();
  }, [id]);

  const loadManager = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getManager(id);
      setManager(data);
    } catch (err: any) {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Supprimer ce manager ?")) {
      try {
        await deleteManager(Number(id));
        navigate("/admin/managers");
      } catch (err) {
        alert("Erreur");
      }
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
    </div>
  );

  if (error || !manager) return (
    <div className="container py-4 text-center">
      <div className="alert alert-light border shadow-sm py-3 small">
        <span className="text-danger fw-bold">Erreur :</span> {error || "Manager non trouvé"}
        <div className="mt-2">
          <button onClick={() => navigate("/admin/managers")} className="btn btn-sm btn-dark rounded-pill px-3">Retour</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Header réduit */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button onClick={() => navigate("/admin/managers")} className="btn btn-white btn-sm shadow-sm rounded-circle me-2 border" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-chevron-left small"></i>
            </button>
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0" style={{ fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <li className="breadcrumb-item"><Link to="/admin/managers" className="text-decoration-none text-muted">Managers</Link></li>
                  <li className="breadcrumb-item active text-primary">Détails</li>
                </ol>
              </nav>
              <h5 className="fw-bold text-dark mb-0">Fiche Manager</h5>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to={`/admin/managers/${id}/edit`} className="btn btn-primary btn-sm rounded-pill px-3 fw-bold small">
              <i className="bi bi-pencil me-1"></i> Éditer
            </Link>
            <button onClick={handleDelete} className="btn btn-outline-danger btn-sm rounded-pill px-2 border-0">
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div className="row g-3">
          {/* Carte Identité - Compacte */}
          <div className="col-12 col-md-5">
            <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '50px', height: '50px', fontSize: '14px' }}>
                  {manager.employee.first_name[0]}{manager.employee.last_name[0]}
                </div>
                <div className="ms-3">
                  <div className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>{manager.employee.first_name} {manager.employee.last_name}</div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>{manager.employee.email}</div>
                </div>
              </div>
              
              <div className="pt-2 border-top">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-muted fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>ID Employé</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>#{manager.employee_id}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Création</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{new Date(manager.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Département - Compacte */}
          <div className="col-12 col-md-7">
            <div className="row g-3 h-100">
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 d-flex flex-column justify-content-center">
                  <div className="text-muted fw-bold mb-1" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Département Assigné</div>
                  <div className="h4 fw-bold text-dark mb-0">
                    {manager.department ? manager.department.name : "Non assigné"}
                  </div>
                </div>
              </div>

              {/* Activité - Taille réduite */}
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted fw-bold mb-1" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Mise à jour système</div>
                      <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                        {new Date(manager.updated_at || manager.created_at).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <i className="bi bi-clock-history text-muted opacity-25 fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}