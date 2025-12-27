import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DepartmentService } from "./service";
import { api } from "../../api/axios";

interface Manager {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function DepartmentCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    manager_id: ""
  });
  
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadManagers = useCallback(async () => {
    try {
      const res = await api.get("/managers");
      let fetchedManagers = [];
      if (Array.isArray(res.data.data)) {
        fetchedManagers = res.data.data;
      } else if (Array.isArray(res.data)) {
        fetchedManagers = res.data;
      }
      setManagers(fetchedManagers);
    } catch (err) {
      console.error("❌ Erreur chargement managers:", err);
      setManagers([]); 
    }
  }, []);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: form.name,
        description: form.description || undefined,
        manager_id: form.manager_id ? Number(form.manager_id) : undefined
      };
      
      await DepartmentService.create(payload);
      navigate("/admin/departments", { state: { refresh: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "800px" }}>
        
        {/* Navigation */}
        <Link to="/admin/departments" className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-flex align-items-center gap-2 fw-bold small">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          RETOUR À LA LISTE
        </Link>

        {/* Header Section */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-white shadow-sm p-3 rounded-3 border border-light-subtle text-primary">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div>
            <h2 className="fw-bold text-dark m-0">Nouveau département</h2>
            <p className="text-muted small m-0">Configurez les détails et le responsable de l'entité.</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center gap-2 fw-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <form onSubmit={submit} className="card-body p-4 p-md-5">
            <div className="row g-4">
              
              {/* Nom du département */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase">Nom du département <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted px-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  </span>
                  <input 
                    type="text" 
                    name="name"
                    className="form-control form-control-lg bg-light border-start-0 fs-6 shadow-none"
                    placeholder="ex: Marketing & Communication"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Manager */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase">Responsable (Manager)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted px-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <select 
                    name="manager_id"
                    className="form-select form-select-lg bg-light border-start-0 fs-6 shadow-none"
                    value={form.manager_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Sélectionner un manager --</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name} — {m.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase">Description / Missions</label>
                <div className="position-relative">
                  <textarea 
                    name="description"
                    className="form-control bg-light fs-6 shadow-none"
                    rows={5}
                    placeholder="Décrivez les objectifs ou le rôle de ce département..."
                    value={form.description}
                    onChange={handleChange}
                    style={{ paddingLeft: "15px" }}
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-12 pt-3">
                <div className="d-flex flex-column flex-md-row gap-3">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary btn-lg px-5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
                    style={{ minWidth: "220px", backgroundColor: "#2563eb" }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {loading ? "Création en cours..." : "Créer le département"}
                  </button>
                  
                  <Link to="/admin/departments" className="btn btn-light btn-lg px-4 fw-bold text-muted border shadow-sm">
                    Annuler
                  </Link>
                </div>
              </div>

            </div>
          </form>
        </div>

        <p className="text-center text-muted mt-4 small">
          Les champs marqués d'une <span className="text-danger">*</span> sont obligatoires.
        </p>
      </div>
    </div>
  );
}