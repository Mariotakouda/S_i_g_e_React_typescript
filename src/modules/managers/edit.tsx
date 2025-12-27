import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getManager, updateManager, fetchEmployeesAndDepartments } from "./service";
import type { Employee, Department, ManagerFormData } from "./model";

export default function ManagerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  const [formData, setFormData] = useState<ManagerFormData>({
    employee_id: null,
    department_id: null,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) {
      setError("ID du manager manquant");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [manager, dependencies] = await Promise.all([
        getManager(id),
        fetchEmployeesAndDepartments(),
      ]);
      setEmployees(dependencies.employees);
      setDepartments(dependencies.departments);
      setFormData({
        employee_id: manager.employee_id || null,
        department_id: manager.department_id || null,
      });
    } catch (err: any) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = value === "" ? null : Number(value);
    setFormData({ ...formData, [name]: processedValue });
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    try {
      await updateManager(Number(id), formData);
      navigate("/admin/managers");
    } catch (err: any) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
      } else {
        setError(err.response?.data?.message || "Erreur de mise à jour");
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#f8fafc" }}>
        <div className="spinner-border" style={{ color: "#6366f1" }} role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4 py-md-5" style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            
            {/* Header */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h1 className="h3 fw-bold mb-0" style={{ color: "#0f172a" }}>Manager Profile</h1>
                  <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}>
                    <i className="bi bi-shield-lock me-1"></i> Admin Access
                  </span>
                </div>
                <p className="mb-0 text-secondary">Identifiant unique du système : <span className="fw-bold text-dark">#{id}</span></p>
              </div>
              <Link to="/admin/managers" className="btn btn-white shadow-sm border-0 px-4 py-2" style={{ borderRadius: "10px", fontWeight: "500", color: "#64748b" }}>
                Annuler
              </Link>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "20px" }}>
              {/* Decorative top bar */}
              <div style={{ height: "6px", background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)" }}></div>
              
              <div className="card-body p-4 p-md-5 bg-white">
                
                {error && (
                  <div className="alert d-flex align-items-center mb-4 border-0" style={{ backgroundColor: "#fff1f2", color: "#be123c", borderRadius: "12px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 text-danger"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span className="fw-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    
                    {/* Colonne 1 : Employé */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold small text-uppercase mb-3" style={{ color: "#475569", letterSpacing: "0.05em" }}>
                        Assignation de l'individu
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-0 bg-light px-3" style={{ borderRadius: "12px 0 0 12px" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <select
                          name="employee_id"
                          className={`form-select border-0 bg-light py-2 fw-bold ${validationErrors.employee_id ? 'is-invalid' : ''}`}
                          style={{ borderRadius: "0 12px 12px 0", height: "50px", color: "#334155" }}
                          value={formData.employee_id || ""}
                          onChange={handleChange}
                        >
                          <option value="">Sélectionner un collaborateur</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-2 p-2 rounded-3" style={{ backgroundColor: "#fff7ed", border: "1px solid #ffedd5" }}>
                        <p className="mb-0 small text-warning-emphasis">
                          ⚠️ Action sensible : impacte la liaison base de données.
                        </p>
                      </div>
                    </div>

                    {/* Colonne 2 : Département */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold small text-uppercase mb-3" style={{ color: "#475569", letterSpacing: "0.05em" }}>
                        Périmètre de gestion
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-0 bg-light px-3" style={{ borderRadius: "12px 0 0 12px" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#6366f1" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                        </span>
                        <select
                          name="department_id"
                          className={`form-select border-0 bg-light py-2 fw-semibold ${validationErrors.department_id ? 'is-invalid' : ''}`}
                          style={{ borderRadius: "0 12px 12px 0", height: "50px", color: "#334155" }}
                          value={formData.department_id || ""}
                          onChange={handleChange}
                        >
                          <option value="">Aucun département (Flottant)</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="col-12 mt-5 pt-4">
                      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between p-4" style={{ backgroundColor: "#707580ff", borderRadius: "16px" }}>
                        <div className="text-white-50 mb-3 mb-md-0 d-flex align-items-center">
                          <i className="bi bi-info-circle me-2"></i>
                          <span className="small">Validation requise pour la mise à jour globale.</span>
                        </div>
                        <div className="d-flex gap-3 w-100 w-md-auto">
                          <button
                            type="submit"
                            className="btn px-5 py-2 fw-bold text-white shadow-lg w-100 w-md-auto"
                            style={{ backgroundColor: "#b11e1eff", borderRadius: "10px", border: "none", transition: "all 0.3s ease" }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
                          >
                            Sauvegarder les modifications
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}