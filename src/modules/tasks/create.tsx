import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

// --- COMPOSANTS ICONES SVG (Style Lucide) ---
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-primary"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-danger"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: {
    id: number;
    name: string;
  };
}

export default function TaskCreate() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) as any;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    employee_id: "",
    due_date: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    checkManagerStatus();
    loadEmployees();
  }, []);

  const checkManagerStatus = async () => {
    try {
      const res = await api.get("/check-manager-status");
      setIsManager(res.data.is_manager || false);
    } catch (err) {
      setIsManager(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      setError(null);
      const res = await api.get("/employees");
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        setError("Format de données invalide");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Seuls les fichiers PDF sont acceptés");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id) return alert("Veuillez assigner un employé.");

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("status", form.status);
    formData.append("employee_id", form.employee_id);
    if (form.due_date) formData.append("due_date", form.due_date);
    if (file) formData.append("task_file", file);

    try {
      await api.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // On utilise un petit délai pour éviter le crash 'removeChild' de React avec l'alerte
      alert("Mission créée avec succès !");
      setTimeout(() => {
        if (isAdmin) navigate("/admin/tasks");
        else if (isManager) navigate("/employee/team-tasks");
        else navigate("/employee/tasks");
      }, 100);

    } catch (err: any) {
      alert("Erreur : " + (err.response?.data?.message || "Erreur lors de la création"));
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmployees) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-muted fw-bold">Initialisation du formulaire...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9 col-xl-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              
              {/* En-tête */}
              <div className="mb-5 border-bottom pb-4">
                <h2 className="card-title fw-bold d-flex align-items-center mb-2">
                  <IconTarget /> Créer une nouvelle mission
                </h2>
                <p className="text-muted mb-0 small">
                  {isAdmin 
                    ? "Attribuez des objectifs clairs à n'importe quel collaborateur de l'organisation." 
                    : "Attribuez une tâche aux membres de votre département."}
                </p>
              </div>

              {/* Message d'erreur */}
              {error && employees.length === 0 && (
                <div className="alert alert-danger rounded-3 d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <IconAlert /> {error}
                  </div>
                  <button onClick={loadEmployees} className="btn btn-sm btn-outline-danger">Actualiser</button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  
                  {/* Titre */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small">Titre de la mission *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg border-2 shadow-none fs-6" 
                      required 
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})} 
                      placeholder="Saisissez le titre de la tâche"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small">Consignes détaillées</label>
                    <textarea 
                      className="form-control border-2 shadow-none fs-6" 
                      rows={4}
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})} 
                      placeholder="Décrivez les livrables attendus..."
                    />
                  </div>

                  {/* Assigner à */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small d-flex align-items-center">
                      <IconUser /> Assigner à *
                    </label>
                    <select 
                      className="form-select form-select-lg border-2 shadow-none fs-6" 
                      required 
                      value={form.employee_id}
                      onChange={e => setForm({...form, employee_id: e.target.value})} 
                      disabled={employees.length === 0}
                    >
                      <option value="">-- Sélectionner un employé --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} {emp.department ? `(${emp.department.name})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Statut & Date (Alignés avec hauteur fixe) */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark small">Statut initial</label>
                    <select 
                      className="form-select border-2 shadow-none" 
                      style={{ height: '48px' }}
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}
                    >
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark small d-flex align-items-center">
                      <IconCalendar /> Date limite
                    </label>
                    <input 
                      type="date" 
                      className="form-control border-2 shadow-none" 
                      style={{ height: '48px' }}
                      value={form.due_date}
                      onChange={e => setForm({...form, due_date: e.target.value})} 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Zone de téléchargement */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small">Fichier joint (PDF uniquement)</label>
                    <div className="border border-2 border-dashed rounded-3 p-4 text-center bg-light position-relative" style={{ borderStyle: 'dashed !important' }}>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange}
                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                        style={{ cursor: 'pointer' }}
                      />
                      {fileName ? (
                        <div className="d-flex align-items-center justify-content-center text-success">
                          <IconFile /> <span className="fw-bold">{fileName}</span>
                          <button type="button" className="btn btn-sm btn-link text-danger ms-2" onClick={() => {setFile(null); setFileName("")}}>Supprimer</button>
                        </div>
                      ) : (
                        <div className="text-muted">
                          <IconFile />
                          <p className="mb-0 mt-2 small">Cliquez pour importer un document</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="col-12 mt-5">
                    <div className="d-flex flex-column flex-md-row gap-3">
                      <button 
                        type="submit" 
                        disabled={loading || employees.length === 0}
                        className="btn btn-primary btn-lg flex-grow-1 fw-bold rounded-3 shadow-sm py-3 px-4"
                      >
                        {loading ? "Création en cours..." : "Enregistrer la mission"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-light btn-lg px-4 fw-semibold border rounded-3"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .border-dashed { border-style: dashed !important; border-color: #dee2e6 !important; }
        .form-control:focus, .form-select:focus { border-color: #0d6efd !important; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.05) !important; }
        .btn-primary { background-color: #0d6efd; border: none; transition: transform 0.1s ease; }
        .btn-primary:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}