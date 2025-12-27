import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/axios";
import type { Department, Employee, ManagerFormData } from "./model";

export default function ManagerCreate() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<ManagerFormData>({
    employee_id: null,
    department_id: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes] = await Promise.all([
        api.get("/employees"),
        api.get("/departments"),
      ]);
      setEmployees(employeesRes.data.data || []);
      setDepartments(departmentsRes.data.data || []);
    } catch (err: any) {
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = value === "" ? null : Number(value);
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
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

    if (!formData.employee_id) {
      setError("Veuillez sélectionner un employé.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/managers", formData);
      navigate("/admin/managers");
    } catch (err: any) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
      } else {
        setError(err.response?.data?.message || "Erreur lors de la création.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      {/* container-fluid pour maximiser l'espace, px-md-5 pour les marges latérales sur PC */}
      <div className="container-fluid px-md-5">
        <div className="row justify-content-center">
          
          {/* Élargissement ici : col-xl-10 pour une vue large, col-xxl-8 pour éviter d'être trop étiré sur écrans géants */}
          <div className="col-12 col-lg-11 col-xl-10 col-xxl-9">
            
            {/* Header de page */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
              <div>
                <h1 className="h2 fw-bold text-dark mb-1">Nouveau Manager</h1>
                <p className="text-muted mb-0">Attribuez des responsabilités d'encadrement à un employé.</p>
              </div>
              <Link to="/admin/managers" className="btn btn-outline-secondary rounded-pill px-4 shadow-sm">
                <i className="bi bi-arrow-left me-2"></i>Retour
              </Link>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Ligne d'accentuation en haut */}
              <div className="bg-primary" style={{ height: '5px' }}></div>
              
              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4 animate__animated animate__fadeIn">
                    <i className="bi bi-exclamation-octagon-fill fs-4 me-3"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="row g-4">
                  
                  {/* Utilisation de col-md-6 pour mettre les champs côte à côte sur large écran */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-secondary small text-uppercase mb-2">
                      Sélection de l'Employé <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 rounded-start-3">
                        <i className="bi bi-person-badge text-primary"></i>
                      </span>
                      <select
                        name="employee_id"
                        className={`form-select form-select-lg border-start-0 rounded-end-3 ${validationErrors.employee_id ? 'is-invalid' : ''}`}
                        value={formData.employee_id || ""}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="">Choisir un membre de l'équipe...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} — {emp.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.employee_id && (
                      <div className="text-danger small mt-1 fw-medium">{validationErrors.employee_id[0]}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-secondary small text-uppercase mb-2">
                      Département de Gestion
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 rounded-start-3">
                        <i className="bi bi-building text-primary"></i>
                      </span>
                      <select
                        name="department_id"
                        className="form-select form-select-lg border-start-0 rounded-end-3"
                        value={formData.department_id || ""}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="">Aucun département assigné</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-12 mt-5">
                    <div className="bg-light p-4 rounded-4 border border-dashed d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                      <div className="text-muted small">
                        <i className="bi bi-info-circle me-2"></i>
                        L'employé sélectionné recevra immédiatement ses accès de manager après validation.
                      </div>
                      <div className="d-flex gap-3 w-100 w-md-auto">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5 fw-bold flex-grow-1 shadow"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="bi bi-check-circle me-2"></i>
                          )}
                          Créer le profil
                        </button>
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