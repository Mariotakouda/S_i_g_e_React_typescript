import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "./service";
import { EmployeeService } from "../employees/service";
import type { Employee } from "../employees/model";

interface AnnouncementForm {
  employee_id: number | null;
  title: string;
  message: string;
}

export default function AnnouncementCreate() {
  const nav = useNavigate();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<AnnouncementForm>({
    employee_id: null,
    title: "",
    message: "",
  });

  // Charger la liste des employés au montage
  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await EmployeeService.fetchAllForSelect();
        console.log("✅ Employés chargés:", data);
        setEmployees(data);
      } catch (error: any) {
        console.warn("⚠️ Impossible de charger les employés:", error);
        // On continue sans les employés, l'utilisateur pourra entrer un ID manuellement
      }
    }

    loadEmployees();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "employee_id" ? (value ? Number(value) : null) : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createAnnouncement(form);
      nav("/admin/announcements");
    } catch (err: any) {
      console.error("Erreur création:", err);
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Créer une annonce</h1>
      
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label htmlFor="employee_id" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Employé destinataire
          </label>
          
          {employees.length > 0 ? (
            <select
              id="employee_id"
              name="employee_id"
              value={form.employee_id || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            >
              <option value="">-- Tous les employés --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="employee_id"
              type="number"
              name="employee_id"
              placeholder="ID de l'employé (optionnel)"
              value={form.employee_id || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          )}
          
          <small style={{ color: "#666" }}>
            Laissez vide pour une annonce générale à tous les employés
          </small>
        </div>

        <div>
          <label htmlFor="title" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Titre *
          </label>
          <input
            id="title"
            name="title"
            placeholder="Titre de l'annonce"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
          />
        </div>

        <div>
          <label htmlFor="message" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Contenu de l'annonce"
            value={form.message}
            onChange={handleChange}
            required
            rows={6}
            style={{ width: "100%", padding: "8px", fontSize: "14px", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: loading ? "#ccc" : "#4CAF50", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer" 
            }}
          >
            {loading ? "Création..." : "Créer l'annonce"}
          </button>
          
          <button 
            type="button"
            onClick={() => nav("/admin/announcements")}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#999", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer" 
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}