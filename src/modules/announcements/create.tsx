// src/modules/announcements/create.tsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createAnnouncement, checkManagerStatus } from "./service";
import { EmployeeService } from "../employees/service";
import { DepartmentService } from "../departments/service";
import type { Employee } from "../employees/model";

// --- Icônes SVG ---
const IconMegaphone = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-primary"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="m15 18-6-6 6-6"/></svg>;

interface DepartmentListItem {
  id: number;
  name: string;
}

export default function AnnouncementCreate() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // États des données (Listes)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // État du formulaire (Aligné sur Edit)
  const [targetType, setTargetType] = useState<"general" | "department" | "employee">("general");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    department_id: null as number | null,
    employee_id: null as number | null,
    is_general: true,
  });

  // État Manager (Sécurisé pour TS)
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
          // 1. Gestion du statut Manager (Correction TS ici)
          if (status.is_manager) {
            const dName = status.department_name || "votre département";
            setManagerInfo({ is_manager: true, dept_name: dName });
            
            // Si manager (et pas admin), on force la cible sur son département
            if (user?.role !== 'admin') {
              setTargetType("department");
              setFormData(p => ({ 
                ...p, 
                department_id: status.department_id, 
                is_general: false 
              }));
            }
          }

          // 2. Chargement des données pour Admins
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
        console.error("Init error:", err);
        setError("Erreur lors du chargement des paramètres.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (user) init();
    return () => { isMounted = false; };
  }, [user]);

  // Synchronisation de la logique de cible (Identique à l'Edit)
  useEffect(() => {
    if (targetType === "general") {
      setFormData(p => ({ ...p, is_general: true, employee_id: null, department_id: null }));
    } else if (targetType === "department") {
      // On garde le department_id si c'est un manager, sinon on reset
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
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary border-2" role="status"></div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container-fluid px-3 px-lg-5" style={{ maxWidth: "1200px" }}>
        
        {/* Header (Breadcrumb + Title) */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2 small fw-bold">
                <li className="breadcrumb-item">
                  <Link to="/admin/announcements" className="text-decoration-none text-muted">Annonces</Link>
                </li>
                <li className="breadcrumb-item active text-primary fw-bold">Nouvelle communication</li>
              </ol>
            </nav>
            <h2 className="fw-bold text-dark mb-0 d-flex align-items-center">
              <IconMegaphone /> Créer une communication
            </h2>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary border-0 fw-bold d-flex align-items-center transition-all">
            <IconChevronLeft /> Annuler
          </button>
        </div>

        {error && <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {/* Accent de couleur supérieur style Univer */}
          <div style={{ height: "6px", backgroundColor: "#2e2a5b" }}></div>
          
          <div className="card-body p-4 p-lg-5 bg-white">
            
            {/* SECTION : DESTINATAIRES */}
            <div className="row mb-5 align-items-center">
              <div className="col-lg-4">
                <h5 className="fw-bold mb-1">Cible de diffusion</h5>
                <p className="text-muted small">Qui doit recevoir cette notification ?</p>
              </div>
              <div className="col-lg-8">
                {managerInfo.is_manager && user?.role !== 'admin' ? (
                  <div className="p-3 bg-light rounded-3 border-2 border d-flex justify-content-between align-items-center">
                    <div>
                      <span className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Diffusion restreinte</span>
                      <span className="fw-bold text-dark">Département : {managerInfo.dept_name}</span>
                    </div>
                    <span className="badge bg-primary px-3 rounded-pill">Manager</span>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2 p-2 bg-light rounded-3">
                    {["general", "department", "employee"].map((type) => (
                      <label key={type} className={`btn btn-sm px-4 py-2 rounded-2 fw-bold transition-all ${targetType === type ? 'btn-dark shadow-sm' : 'btn-white border-0 text-muted'}`}>
                        <input 
                          type="radio" 
                          className="btn-check" 
                          checked={targetType === type} 
                          onChange={() => setTargetType(type as any)} 
                        />
                        {type === 'general' ? 'Tout le monde' : type === 'department' ? 'Département' : 'Employé spécifique'}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SELECTION DYNAMIQUE (Si Admin) */}
            {user?.role === 'admin' && (targetType === "department" || targetType === "employee") && (
              <div className="row mb-5 animate-fade-in">
                <div className="col-lg-4">
                  <h5 className="fw-bold mb-1">Sélection de la cible</h5>
                </div>
                <div className="col-lg-8">
                  {targetType === "department" ? (
                    <select 
                      className="form-select form-select-lg border-2 shadow-none" 
                      value={formData.department_id || ""} 
                      onChange={e => setFormData({...formData, department_id: e.target.value ? Number(e.target.value) : null})}
                      required
                    >
                      <option value="">Sélectionner un département...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <select 
                      className="form-select form-select-lg border-2 shadow-none" 
                      value={formData.employee_id || ""} 
                      onChange={e => setFormData({...formData, employee_id: e.target.value ? Number(e.target.value) : null})}
                      required
                    >
                      <option value="">Sélectionner un employé...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            )}

            <hr className="my-5 opacity-10" />

            {/* SECTION : CONTENU (Titre & Message) */}
            <div className="row mb-4 g-4">
              <div className="col-lg-4">
                <h5 className="fw-bold mb-1">Contenu du message</h5>
                <p className="text-muted small">Rédigez un titre percutant et un message clair.</p>
              </div>
              <div className="col-lg-8">
                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase text-muted">Sujet de l'annonce</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-2 shadow-none" 
                    required 
                    placeholder="Ex: Information importante concernant..."
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label fw-bold small text-uppercase text-muted">Message détaillé</label>
                  <textarea 
                    className="form-control border-2 shadow-none p-3" 
                    rows={2} 
                    required 
                    placeholder="Saisissez votre contenu ici..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{ resize: 'none', fontSize: '1.05rem' }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION : ACTIONS */}
            <div className="row mt-5 pt-4 border-top">
              <div className="col-lg-8 offset-lg-4">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn btn-lg px-5 py-3 fw-bold text-white shadow-sm transition-all border-0 rounded-3"
                  style={{ backgroundColor: "#2e2a5b" }}
                >
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span> Publication...</>
                  ) : (
                    "Publier l'annonce maintenant"
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      <style>{`
        .btn-white { background: #fff; }
        .form-control:focus, .form-select:focus { border-color: #2e2a5b !important; }
        .form-control, .form-select { border-radius: 10px; border-color: #eef2f7; }
        .transition-all { transition: all 0.2s ease; }
        .transition-all:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .breadcrumb-item + .breadcrumb-item::before { content: "›"; font-size: 1.2rem; line-height: 1; }
      `}</style>
    </div>
  );
}