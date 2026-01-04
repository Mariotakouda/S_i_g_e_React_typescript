import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TaskService } from "./service";
import { api } from "../../api/axios";

// --- ICONS SVG ---
const Icons = {
  Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  File: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
};

export default function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    employee_id: "",
    due_date: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [empRes, taskData] = await Promise.all([
          api.get("/employees"),
          TaskService.show(Number(id))
        ]);
        setEmployees(empRes.data.data || empRes.data || []);
        setForm({
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status || "pending",
          employee_id: taskData.employee_id ? String(taskData.employee_id) : "",
          due_date: taskData.due_date ? taskData.due_date.split(' ')[0] : "", 
        });
      } catch (error: any) {
        console.error("Erreur lors de l'initialisation :", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("_method", "PUT"); 
    formData.append("title", form.title);
    formData.append("description", form.description || "");
    formData.append("status", form.status);
    formData.append("due_date", form.due_date || "");
    if (form.employee_id) formData.append("employee_id", form.employee_id);
    if (file) formData.append("task_file", file);

    try {
      await api.post(`/tasks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate(-1); 
    } catch (error: any) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <span className="text-muted fw-bold">Chargement de la mission...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          
          {/* Header avec bouton retour */}
          <div className="d-flex align-items-center mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-white shadow-sm rounded-circle p-2 me-3 border"
              title="Retour"
            >
              <Icons.ArrowLeft />
            </button>
            <h2 className="h4 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <Icons.Edit /> Modifier la mission
            </h2>
          </div>

          {/* Carte Formulaire */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={submit}>
                
                {/* Titre */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary d-flex align-items-center gap-2">
                    <Icons.File /> Titre de la mission
                  </label>
                  <input 
                    className="form-control form-control-lg border-2 bg-light shadow-none focus-border-primary rounded-3"
                    style={{ fontSize: '0.95rem' }}
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    required 
                    placeholder="Ex: Refonte du dashboard..."
                  />
                </div>

                <div className="row">
                  {/* Assigner à */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold text-secondary d-flex align-items-center gap-2">
                      <Icons.User /> Responsable
                    </label>
                    <select 
                      className="form-select border-2 bg-light shadow-none rounded-3"
                      value={form.employee_id} 
                      onChange={e => setForm({...form, employee_id: e.target.value})}
                    >
                      <option value="">Sélectionner</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date d'échéance */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold text-secondary d-flex align-items-center gap-2">
                      <Icons.Calendar /> Échéance
                    </label>
                    <input 
                      type="date"
                      className="form-control border-2 bg-light shadow-none rounded-3"
                      value={form.due_date} 
                      onChange={e => setForm({...form, due_date: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary d-flex align-items-center gap-2">
                    <Icons.Check /> Statut actuel
                  </label>
                  <select 
                    className="form-select border-2 bg-light shadow-none rounded-3"
                    style={{ fontWeight: 600 }}
                    value={form.status} 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <option value="pending">🟡 En attente</option>
                    <option value="in_progress">🔵 En cours</option>
                    <option value="completed">🟢 Terminée</option>
                    <option value="cancelled">🔴 Annulée</option>
                  </select>
                </div>

                {/* File Upload */}
                <div className="mb-5 p-3 rounded-3 border-2 border-dashed bg-light text-center">
                  <label className="form-label fw-bold text-primary cursor-pointer d-block mb-0">
                    <div className="mb-2"><Icons.File /></div>
                    {file ? file.name : "Cliquez pour remplacer le document PDF"}
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={e => setFile(e.target.files?.[0] || null)} 
                      className="d-none" 
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg px-5 rounded-3 fw-bold flex-grow-1 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>Enregistrer les modifications</>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)} 
                    className="btn btn-outline-secondary btn-lg px-4 rounded-3 fw-semibold"
                  >
                    Annuler
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .focus-border-primary:focus {
          border-color: #0d6efd !important;
          background-color: #fff !important;
        }
        .border-dashed { border-style: dashed !important; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}