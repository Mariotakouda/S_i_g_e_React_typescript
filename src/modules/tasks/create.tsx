// src/modules/tasks/create.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TaskService } from "./service";
import { api } from "../../api/axios"; // Utiliser l'instance axios configurée

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
      // Gérer différents formats de réponse API
      const data = res.data.data || res.data || [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erreur de chargement des employés:", error);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }
      
      // En cas d'erreur, on permet quand même d'afficher le formulaire
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
    
    // Préparer les données avec le bon typage
    const payload = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      due_date: form.due_date || null,
      employee_id: form.employee_id ? Number(form.employee_id) : null,
    };

    console.log("Payload envoyé:", payload);

    try {
      const response = await TaskService.create(payload);
      console.log("Réponse:", response);
      alert("Tâche créée avec succès !");
      navigate("/admin/tasks");
    } catch (error: any) {
      console.error("Erreur complète:", error);
      console.error("Réponse du serveur:", error.response?.data);
      
      // Gérer l'erreur d'authentification
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || "Erreur lors de la création de la tâche";
      
      alert(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}>
      <h2>Nouvelle tâche</h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Chargement du formulaire...</p>
        </div>
      ) : (
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
            {employees.length === 0 && (
              <small style={{ color: "#999", display: "block", marginTop: "5px" }}>
                Aucun employé disponible
              </small>
            )}
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
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Créer
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
      )}
    </div>
  );
}