// src/modules/tasks/edit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TaskService } from "./service";
import { api } from "../../api/axios"; // Utiliser l'instance axios configurée

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
      console.error("Erreur de chargement des employés:", error);
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
      }
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
      console.error("Erreur de chargement de la tâche:", error);
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
      }
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
      ...form,
      employee_id: form.employee_id ? Number(form.employee_id) : null,
    };

    try {
      await TaskService.update(Number(id), payload);
      alert("Tâche mise à jour avec succès !");
      navigate("/admin/tasks");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }
      
      alert("Erreur lors de la mise à jour de la tâche");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}>
      <h2>Modifier la tâche</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Titre *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Statut *
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Employé assigné
          </label>
          <select
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="">-- Non assigné --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Date limite
          </label>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/tasks")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#999",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}