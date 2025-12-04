import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAnnouncement, updateAnnouncement } from "./service";
import { EmployeeService } from "../employees/service";
import type { Employee } from "../employees/model";

interface AnnouncementForm {
  employee_id: number | null;
  title: string;
  message: string;
}

export default function AnnouncementEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState<AnnouncementForm>({
    employee_id: null,
    title: "",
    message: "",
  });

  // Charger l'annonce et les employés
  useEffect(() => {
    async function loadData() {
      try {
        console.log("🔄 Chargement annonce #" + id);
        
        // Charger l'annonce
        const announcement = await getAnnouncement(Number(id));
        console.log("✅ Annonce chargée:", announcement);
        
        setForm({
          employee_id: announcement.employee_id || null,
          title: announcement.title,
          message: announcement.message,
        });

        // Charger les employés
        try {
          const employeesList = await EmployeeService.fetchAllForSelect();
          console.log("✅ Employés chargés:", employeesList);
          setEmployees(employeesList);
        } catch (empError) {
          console.warn("⚠️ Impossible de charger les employés:", empError);
          // On continue sans les employés, l'utilisateur pourra entrer un ID manuellement
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur chargement annonce:", err);
        setError("Impossible de charger l'annonce");
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "employee_id" ? (value ? Number(value) : null) : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await updateAnnouncement(Number(id), form);
      nav("/admin/announcements");
    } catch (err: any) {
      console.error("Erreur modification:", err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
      setSubmitting(false);
    }
  }

  if (loading) return <p>Chargement...</p>;
  if (error && !form.title) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Modifier l'annonce #{id}</h1>
      
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
            Laissez vide pour une annonce générale
          </small>
        </div>

        <div>
          <label htmlFor="title" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Titre *
          </label>
          <input
            id="title"
            name="title"
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
            disabled={submitting}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: submitting ? "#ccc" : "#2196F3", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: submitting ? "not-allowed" : "pointer" 
            }}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
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