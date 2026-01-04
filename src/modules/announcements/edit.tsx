import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAnnouncement, updateAnnouncement } from "./service";
import { EmployeeService } from "../employees/service";
import { DepartmentService } from "../departments/service";
import type { Employee } from "../employees/model";

interface DepartmentListItem {
  id: number;
  name: string;
}

interface AnnouncementForm {
  employee_id: number | null;
  department_id: number | null;
  is_general: boolean;
  title: string;
  message: string;
}

export default function AnnouncementEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [targetType, setTargetType] = useState<"general" | "department" | "employee">("general");
  
  const [form, setForm] = useState<AnnouncementForm>({
    employee_id: null,
    department_id: null,
    is_general: true,
    title: "",
    message: "",
  });

  useEffect(() => {
  async function loadData() {
    try {
      // On récupère les réponses
      const [response, empData, deptResponse]: [any, Employee[], any] = await Promise.all([
        getAnnouncement(Number(id)),
        EmployeeService.fetchAllForSelect().catch(() => []),
        DepartmentService.list().catch(() => ({ data: [] }))
      ]);
      
      // ✅ Extraction sécurisée : On cherche la propriété 'data' 
      // Si Laravel renvoie { data: { id: 1... } }, on prend response.data
      const announcement = response.data ? response.data : response;

      // ... reste de la logique de mapping (setForm, setTargetType)
      setForm({
        employee_id: announcement.employee_id || null,
        department_id: announcement.department_id || null,
        is_general: !!announcement.is_general,
        title: announcement.title || "",
        message: announcement.message || "",
      });

      setEmployees(empData);
      setDepartments(deptResponse.data || []);
      setLoading(false);
    } catch (err) {
      setError("Impossible de charger l'annonce");
      setLoading(false);
    }
  }
  loadData();
}, [id]);

  // 2. Gestion du changement de type (uniquement suite à une action utilisateur)
  const handleTypeChange = (newType: "general" | "department" | "employee") => {
    setTargetType(newType);
    setForm(prev => ({
      ...prev,
      is_general: newType === "general",
      employee_id: null, // On réinitialise seulement lors d'un vrai changement manuel
      department_id: null
    }));
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes("_id") ? (value ? Number(value) : null) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateAnnouncement(Number(id), form);
      nav(`/admin/announcements/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la modification");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-light"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container-fluid px-3 px-lg-5" style={{ maxWidth: "1200px" }}>
        
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item"><Link to="/admin/announcements" className="text-decoration-none">Annonces</Link></li>
                <li className="breadcrumb-item active">Édition</li>
              </ol>
            </nav>
            <h2 className="fw-bold text-dark mb-0">Modifier l'annonce <span className="text-primary">#{id}</span></h2>
          </div>
          <button type="button" onClick={() => nav(-1)} className="btn btn-outline-secondary border-0 fw-bold">
            Annuler
          </button>
        </div>

        {error && <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-lg-5">
            
            {/* Section : Cible */}
            <div className="row mb-5 align-items-center">
              <div className="col-lg-4">
                <h5 className="fw-bold mb-1">Destinataires</h5>
                <p className="text-muted small">Sélectionnez la nouvelle cible si besoin.</p>
              </div>
              <div className="col-lg-8">
                <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded-3">
                  {(["general", "department", "employee"] as const).map((type) => (
                    <label key={type} className={`btn btn-sm px-4 py-2 rounded-2 fw-bold transition-all ${targetType === type ? 'btn-dark' : 'btn-white border'}`}>
                      <input 
                        type="radio" 
                        name="targetType"
                        className="btn-check" 
                        checked={targetType === type} 
                        onChange={() => handleTypeChange(type)} 
                      />
                      {type === 'general' ? 'Tout le monde' : type === 'department' ? 'Département' : 'Employé spécifique'}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Sélections dynamiques */}
            {(targetType === "department" || targetType === "employee") && (
              <div className="row mb-5 animate-fade-in">
                <div className="col-lg-4">
                  <h5 className="fw-bold mb-1">Sélection de la cible</h5>
                </div>
                <div className="col-lg-8">
                  {targetType === "department" ? (
                    <select name="department_id" className="form-select form-select-lg border-2" value={form.department_id || ""} onChange={handleChange} required>
                      <option value="">Sélectionner un département...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <select name="employee_id" className="form-select form-select-lg border-2" value={form.employee_id || ""} onChange={handleChange} required>
                      <option value="">Sélectionner un employé...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.email})</option>)}
                    </select>
                  )}
                </div>
              </div>
            )}

            <hr className="my-5 opacity-10" />

            {/* Contenu */}
            <div className="row mb-4">
              <div className="col-lg-4">
                <h5 className="fw-bold mb-1">Contenu du message</h5>
              </div>
              <div className="col-lg-8">
                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase opacity-75">Titre de l'annonce</label>
                  <input type="text" name="title" className="form-control form-control-lg border-2" value={form.title} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label fw-bold small text-uppercase opacity-75">Message</label>
                  <textarea name="message" className="form-control border-2" rows={10} value={form.message} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="row mt-5 pt-4 border-top">
              <div className="col-lg-8 offset-lg-4 d-flex gap-3">
                <button type="submit" disabled={submitting} className="btn btn-primary btn-lg px-5 fw-bold shadow-sm rounded-3">
                  {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      <style>{`
        .btn-white { background: #fff; }
        .form-control:focus, .form-select:focus { border-color: #0d6efd; box-shadow: none; }
        .form-control, .form-select { border-radius: 10px; border-color: #eee; }
        .transition-all { transition: all 0.2s ease; }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}