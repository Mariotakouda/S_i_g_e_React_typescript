import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAnnouncement, updateAnnouncement } from "./service";
import { EmployeeService } from "../employees/service";
import { DepartmentService } from "../departments/service";
import type { Employee } from "../employees/model";

// Type pour l'interface du département (compatible avec votre service existant)
interface DepartmentListItem {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
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

  // Charger l'annonce et les données
  useEffect(() => {
    async function loadData() {
      try {
        console.log("🔄 Chargement annonce #" + id);
        
        // Charger l'annonce
        const announcement = await getAnnouncement(Number(id));
        console.log("✅ Annonce chargée:", announcement);
        
        // Déterminer le type de cible
        let type: "general" | "department" | "employee" = "general";
        if (announcement.employee_id) {
          type = "employee";
        } else if (announcement.department_id) {
          type = "department";
        } else if (announcement.is_general) {
          type = "general";
        }
        
        setTargetType(type);
        setForm({
          employee_id: announcement.employee_id || null,
          department_id: announcement.department_id || null,
          is_general: announcement.is_general || false,
          title: announcement.title,
          message: announcement.message,
        });

        // Charger les employés et départements
        try {
          const [empData, deptResponse] = await Promise.all([
            EmployeeService.fetchAllForSelect().catch(() => []),
            DepartmentService.list().catch(() => ({ data: [], meta: null }))
          ]);
          setEmployees(empData);
          setDepartments(deptResponse.data || []);
        } catch (dataError) {
          console.warn("⚠️ Impossible de charger les données:", dataError);
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

  // Gérer le changement de type de cible
  useEffect(() => {
    if (targetType === "general") {
      setForm(prev => ({ ...prev, is_general: true, employee_id: null, department_id: null }));
    } else if (targetType === "department") {
      setForm(prev => ({ ...prev, is_general: false, employee_id: null }));
    } else if (targetType === "employee") {
      setForm(prev => ({ ...prev, is_general: false, department_id: null }));
    }
  }, [targetType]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "employee_id" || name === "department_id" 
        ? (value ? Number(value) : null) 
        : value,
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

  if (loading) return <p style={{ padding: "20px" }}>Chargement...</p>;
  if (error && !form.title) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Modifier l'annonce #{id}</h1>
      
      {error && <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#fee", borderRadius: "4px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {/* Type de destinataire */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Type d'annonce
          </label>
          <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="radio"
                checked={targetType === "general"}
                onChange={() => setTargetType("general")}
              />
              Générale (tous les employés)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="radio"
                checked={targetType === "department"}
                onChange={() => setTargetType("department")}
              />
              Par département
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="radio"
                checked={targetType === "employee"}
                onChange={() => setTargetType("employee")}
              />
              Employé spécifique
            </label>
          </div>
        </div>

        {/* Sélection du département */}
        {targetType === "department" && (
          <div>
            <label htmlFor="department_id" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Département destinataire *
            </label>
            <select
              id="department_id"
              name="department_id"
              value={form.department_id || ""}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            >
              <option value="">-- Sélectionner un département --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sélection de l'employé */}
        {targetType === "employee" && (
          <div>
            <label htmlFor="employee_id" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Employé destinataire *
            </label>
            <select
              id="employee_id"
              name="employee_id"
              value={form.employee_id || ""}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            >
              <option value="">-- Sélectionner un employé --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
        )}

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