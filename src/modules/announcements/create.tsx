// src/modules/announcements/create.tsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createAnnouncement, checkManagerStatus } from "./service";
import { EmployeeService } from "../employees/service";
import { DepartmentService } from "../departments/service";
import type { Employee } from "../employees/model";

// --- Icônes SVG Professionnelles ---
const IconMegaphone = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3 text-primary"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="m15 18-6-6 6-6"/></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconEditPen = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

interface DepartmentListItem {
  id: number;
  name: string;
}

export default function AnnouncementCreate() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [targetType, setTargetType] = useState<"general" | "department" | "employee">("general");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    department_id: null as number | null,
    employee_id: null as number | null,
    is_general: true,
  });

  const [managerInfo, setManagerInfo] = useState({ 
    is_manager: false, 
    dept_name: "" 
  });

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setLoading(true);
        const status = await checkManagerStatus();
        if (isMounted) {
          if (status.is_manager) {
            const dName = status.department_name || "votre département";
            setManagerInfo({ is_manager: true, dept_name: dName });
            if (user?.role !== 'admin') {
              setTargetType("department");
              setFormData(p => ({ ...p, department_id: status.department_id, is_general: false }));
            }
          }
          if (user?.role === 'admin') {
            const [empData, deptResponse] = await Promise.all([
              EmployeeService.fetchAllForSelect().catch(() => []),
              DepartmentService.list().catch(() => ({ data: [] }))
            ]);
            setEmployees(empData);
            setDepartments(deptResponse.data || []);
          }
        }
      } catch (err) {
        setError("Erreur lors du chargement des paramètres.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (user) init();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    if (targetType === "general") {
      setFormData(p => ({ ...p, is_general: true, employee_id: null, department_id: null }));
    } else if (targetType === "department") {
      setFormData(p => ({ ...p, is_general: false, employee_id: null, department_id: managerInfo.is_manager ? p.department_id : null }));
    } else if (targetType === "employee") {
      setFormData(p => ({ ...p, is_general: false, department_id: null }));
    }
  }, [targetType, managerInfo.is_manager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createAnnouncement(formData);
      navigate(user?.role === 'admin' ? "/admin/announcements" : "/employee/announcements");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la publication");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <span className="text-muted fw-medium">Préparation du formulaire...</span>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 py-lg-5">
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        {/* Header Navigation */}
        <div className="row mb-4 align-items-center g-3 text-center text-md-start">
          <div className="col-md-8">
            <nav aria-label="breadcrumb" className="d-none d-md-block">
              <ol className="breadcrumb mb-2 small text-uppercase ls-1">
                <li className="breadcrumb-item"><Link to="/admin/announcements" className="text-decoration-none text-muted fw-bold">Communications</Link></li>
                <li className="breadcrumb-item active text-primary fw-bold" aria-current="page">Création</li>
              </ol>
            </nav>
            <h2 className="fw-bold text-dark mb-0 d-flex align-items-center justify-content-center justify-content-md-start">
              <IconMegaphone /> Nouvelle Communication
            </h2>
          </div>
          <div className="col-md-4 text-md-end">
            <button onClick={() => navigate(-1)} className="btn btn-white border shadow-sm px-4 fw-bold text-muted transition-all">
              <IconChevronLeft /> Retour
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center p-3 animate-fade-in">
             <IconAlert /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card border-0 shadow-lg rounded-4 overflow-hidden shadow-hover">
          <div style={{ height: "5px", background: "linear-gradient(90deg, #2e2a5b 0%, #4e44a8 100%)" }}></div>
          
          <div className="card-body p-4 p-md-5 bg-white">
            
            {/* SECTION 1: AUDIENCE */}
            <div className="row mb-5">
              <div className="col-lg-4 border-end-lg">
                <div className="d-flex align-items-center mb-2">
                  <div className="p-2 bg-primary-subtle rounded-3 text-primary me-2"><IconUsers /></div>
                  <h5 className="fw-bold mb-0 text-dark">Audience</h5>
                </div>
                <p className="text-muted small pe-lg-3">Définissez la visibilité de cette annonce au sein de l'organisation.</p>
              </div>
              <div className="col-lg-8 ps-lg-4">
                {managerInfo.is_manager && user?.role !== 'admin' ? (
                  <div className="p-4 rounded-4 border-2 border border-primary-subtle bg-primary-subtle bg-opacity-10">
                    <span className="badge bg-primary mb-2 px-3 rounded-pill">Mode Manager</span>
                    <h6 className="fw-bold text-dark mb-1">Cible : {managerInfo.dept_name}</h6>
                    <p className="small text-muted mb-0">Visible uniquement par les membres de votre département.</p>
                  </div>
                ) : (
                  <div className="bg-light p-2 rounded-4 d-flex flex-column flex-sm-row gap-1">
                    {[
                      { id: "general", label: "Tout le monde" },
                      { id: "department", label: "Département" },
                      { id: "employee", label: "Individuel" }
                    ].map((t) => (
                      <label key={t.id} className={`flex-fill btn border-0 py-3 fw-bold transition-all rounded-3 ${targetType === t.id ? 'btn-white shadow text-primary' : 'text-muted'}`}>
                        <input type="radio" className="btn-check" checked={targetType === t.id} onChange={() => setTargetType(t.id as any)} />
                        {t.label}
                      </label>
                    ))}
                  </div>
                )}

                {user?.role === 'admin' && targetType !== "general" && (
                  <div className="mt-3 animate-fade-in">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2 ps-1">Sélectionner la cible</label>
                    <select 
                      className="form-select form-select-lg border-2 shadow-none py-3 px-4 rounded-3 fw-medium" 
                      value={targetType === 'department' ? (formData.department_id || "") : (formData.employee_id || "")}
                      onChange={e => setFormData({
                        ...formData, 
                        [targetType === 'department' ? 'department_id' : 'employee_id']: e.target.value ? Number(e.target.value) : null
                      })}
                      required
                    >
                      <option value="">Choisir dans la liste...</option>
                      {targetType === "department" 
                        ? departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                        : employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)
                      }
                    </select>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-5 border-light" />

            {/* SECTION 2: CONTENU */}
            <div className="row mb-4">
              <div className="col-lg-4 border-end-lg">
                <div className="d-flex align-items-center mb-2">
                  <div className="p-2 bg-warning-subtle rounded-3 me-2">
                    <IconEditPen />
                  </div>
                  <h5 className="fw-bold mb-0 text-dark">Message</h5>
                </div>
                <p className="text-muted small pe-lg-3">Rédigez un titre percutant pour capter l'attention rapidement.</p>
              </div>
              <div className="col-lg-8 ps-lg-4">
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase ls-1">Sujet de l'annonce</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-2 shadow-none py-3 px-4 rounded-3 fw-bold" 
                    placeholder="Ex: Information importante concernant..."
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="form-label fw-bold small text-muted text-uppercase ls-1">Corps du message</label>
                  <textarea 
                    className="form-control border-2 shadow-none p-4 rounded-3" 
                    rows={6} 
                    placeholder="Saisissez votre contenu ici..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{ fontSize: '1.05rem', lineHeight: '1.6' }}
                    required 
                  />
                  <div className="text-end mt-2">
                    <span className="small text-muted fw-medium">{formData.message.length} caractères rédigés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="row mt-5">
              <div className="col-lg-8 offset-lg-4 ps-lg-4">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn btn-lg w-100 py-3 fw-bold text-white shadow shadow-hover border-0 rounded-3 transition-all d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#4e44a8" }}
                >
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-3"></span> Publication...</>
                  ) : (
                    <><IconSend /> Publier l'annonce maintenant</>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      <style>{`
        .ls-1 { letter-spacing: 0.05rem; }
        .btn-white { background: #fff; color: #6c757d; }
        .btn-white:hover { background: #f8f9fa; }
        .form-control:focus, .form-select:focus { border-color: #2e2a5b !important; }
        .shadow-hover { transition: box-shadow 0.3s ease; }
        .shadow-hover:hover { box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (min-width: 992px) { .border-end-lg { border-right: 1px solid #f0f0f0; } }
        .bg-primary-subtle { background-color: #eef2f7 !important; }
        .bg-warning-subtle { background-color: #fff8eb !important; }
        .text-primary { color: #2e2a5b !important; }
        .breadcrumb-item + .breadcrumb-item::before { content: "›"; font-size: 1.2rem; line-height: 1; vertical-align: middle; }
      `}</style>
    </div>
  );
}