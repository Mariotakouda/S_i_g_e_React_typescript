import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TaskService } from "./service";
import { api } from "../../api/axios";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

export default function TaskCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    employee_id: "",
    due_date: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      const data = res.data.data || res.data || [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erreur de chargement des employés:", error);
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      due_date: form.due_date || null,
      employee_id: form.employee_id ? Number(form.employee_id) : null,
    };

    try {
      await TaskService.create(payload);
      alert("Tâche créée avec succès !");
      navigate("/admin/tasks");
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }
      const errorMessage = error.response?.data?.message || "Erreur lors de la création";
      alert(errorMessage);
    }
  };

  // --- Icons SVG Professionnelles ---
  const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
  const IconBack = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

  return (
    <div className="create-container">
      <style>{`
        .create-container { max-width: 700px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; }
        .header-area { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
        
        .form-card { background: white; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .full-width { grid-column: span 2; }
        
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }
        
        input, select, textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-group { display: flex; gap: 12px; margin-top: 10px; }
        .btn { 
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none; transition: all 0.2s; flex: 1;
        }
        .btn-create { background-color: #10b981; color: white; }
        .btn-create:hover { background-color: #059669; }
        .btn-cancel { background-color: #f1f5f9; color: #64748b; }
        .btn-cancel:hover { background-color: #e2e8f0; }

        .loader { text-align: center; padding: 50px; color: #64748b; font-size: 14px; }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .btn-group { flex-direction: column; }
        }
      `}</style>

      <div className="header-area">
        <div style={{ backgroundColor: "#ecfdf5", color: "#10b981", padding: "10px", borderRadius: "10px" }}>
          <IconPlus />
        </div>
        <h2 className="title">Nouvelle tâche</h2>
      </div>

      {loading ? (
        <div className="form-card loader">Préparation du formulaire...</div>
      ) : (
        <div className="form-card">
          <form onSubmit={submit} className="form-grid">
            
            <div className="field-group full-width">
              <label>Titre de la mission *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Refonte de l'interface utilisateur"
                required
              />
            </div>

            <div className="field-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Détaillez les objectifs de cette tâche..."
              />
            </div>

            <div className="field-group">
              <label>Statut initial *</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>

            <div className="field-group">
              <label>Échéance souhaitée</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>

            <div className="field-group full-width">
              <label>Collaborateur assigné</label>
              <select name="employee_id" value={form.employee_id} onChange={handleChange}>
                <option value="">Aucun employé assigné</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
              {employees.length === 0 && (
                <small style={{ color: "#94a3b8", marginTop: "4px" }}>
                  Aucun employé disponible dans la base.
                </small>
              )}
            </div>

            <div className="btn-group full-width">
              <button type="submit" className="btn btn-create">
                Confirmer la création
              </button>
              <button type="button" onClick={() => navigate("/admin/tasks")} className="btn btn-cancel">
                <IconBack /> Annuler
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}