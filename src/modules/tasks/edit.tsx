import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TaskService } from "./service";
import { api } from "../../api/axios";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

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

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
    loadTask();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.data || res.data || []);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const loadTask = async () => {
    try {
      const data = await TaskService.get(Number(id));
      setForm({
        title: data.title,
        description: data.description || "",
        status: data.status,
        employee_id: data.employee_id ? String(data.employee_id) : "",
        due_date: data.due_date || "",
      });
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: any) => {
    console.error("Erreur API:", error);
    if (error.response?.status === 401) {
      alert("Session expirée. Veuillez vous reconnecter.");
      navigate("/login");
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      employee_id: form.employee_id ? Number(form.employee_id) : null,
    };

    try {
      await TaskService.update(Number(id), payload);
      navigate("/admin/tasks");
    } catch (error: any) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur lors de la mise à jour de la tâche");
    }
  };

  // --- Icons SVG (Clean & Pro) ---
  const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  const IconBack = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "#64748b" }}>
      Chargement du formulaire...
    </div>
  );

  return (
    <div className="edit-container">
      <style>{`
        .edit-container { max-width: 700px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; }
        .header { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
        .title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
        
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
          background-color: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .btn-group { display: flex; gap: 12px; margin-top: 12px; }
        .btn { 
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none; transition: all 0.2s; flex: 1;
        }
        .btn-submit { background-color: #f59e0b; color: white; }
        .btn-submit:hover { background-color: #d97706; }
        .btn-cancel { background-color: #f1f5f9; color: #64748b; }
        .btn-cancel:hover { background-color: #e2e8f0; }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .form-card { padding: 20px; }
        }
      `}</style>

      <div className="header">
        <div style={{ color: "#f59e0b" }}>
          <IconEdit />
        </div>
        <h2 className="title">Modifier la tâche</h2>
      </div>

      <div className="form-card">
        <form onSubmit={submit} className="form-grid">
          
          <div className="field-group full-width">
            <label>Titre de la mission *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Analyse des données trimestrielles"
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
            />
          </div>

          <div className="field-group">
            <label>Statut *</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          </div>

          <div className="field-group">
            <label>Date limite</label>
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
          </div>

          <div className="btn-group full-width">
            <button type="submit" className="btn btn-submit">
              Enregistrer les modifications
            </button>
            <button type="button" onClick={() => navigate("/admin/tasks")} className="btn btn-cancel">
              <IconBack /> Annuler
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}