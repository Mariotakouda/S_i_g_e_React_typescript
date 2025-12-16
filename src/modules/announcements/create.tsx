import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "./service";
import { EmployeeService } from "../employees/service";
import { DepartmentService } from "../departments/service";
import type { Employee } from "../employees/model";

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

export default function AnnouncementCreate() {
  const nav = useNavigate();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
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
        const [empData, deptResponse] = await Promise.all([
          EmployeeService.fetchAllForSelect().catch(() => []),
          DepartmentService.list().catch(() => ({ data: [], meta: null }))
        ]);
        setEmployees(empData);
        setDepartments(deptResponse.data || []);
      } catch (error: any) {
        console.warn("⚠️ Impossible de charger les données:", error);
      }
    }
    loadData();
  }, []);

  // FIX: Mettre à jour le formulaire quand le type change
  useEffect(() => {
    if (targetType === "general") {
      setForm(prev => ({ 
        ...prev, 
        is_general: true, 
        employee_id: null, 
        department_id: null 
      }));
    } else if (targetType === "department") {
      setForm(prev => ({ 
        ...prev, 
        is_general: false, 
        employee_id: null,
        // Ne pas réinitialiser department_id ici pour garder la sélection
      }));
    } else if (targetType === "employee") {
      setForm(prev => ({ 
        ...prev, 
        is_general: false, 
        department_id: null,
        // Ne pas réinitialiser employee_id ici pour garder la sélection
      }));
    }
  }, [targetType]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    // FIX: Conversion correcte des valeurs
    let finalValue: any = value;
    
    if (name === "employee_id" || name === "department_id") {
      // Convertir en nombre ou null (pas de chaîne vide)
      finalValue = value === "" || value === "0" ? null : Number(value);
    }
    
    setForm(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // FIX: Préparer les données à envoyer
    const payload: any = {
      title: form.title.trim(),
      message: form.message.trim(),
    };

    if (targetType === "general") {
      payload.is_general = true;
      payload.employee_id = null;
      payload.department_id = null;
    } else if (targetType === "department") {
      if (!form.department_id) {
        setError("Veuillez sélectionner un département");
        setLoading(false);
        return;
      }
      payload.is_general = false;
      payload.department_id = form.department_id;
      payload.employee_id = null;
    } else if (targetType === "employee") {
      if (!form.employee_id) {
        setError("Veuillez sélectionner un employé");
        setLoading(false);
        return;
      }
      payload.is_general = false;
      payload.employee_id = form.employee_id;
      payload.department_id = null;
    }

    console.log("📤 Envoi de l'annonce:", payload);

    try {
      const result = await createAnnouncement(payload);
      console.log("✅ Annonce créée:", result);
      nav("/admin/announcements");
    } catch (err: any) {
      console.error("❌ Erreur création:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Créer une annonce</h1>
      
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          marginBottom: "10px", 
          padding: "12px", 
          backgroundColor: "#ffebee", 
          borderRadius: "4px",
          border: "1px solid #f44336"
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {/* Type de destinataire */}
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#f5f5f5", 
          borderRadius: "4px",
          border: "1px solid #ddd"
        }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
            Type d'annonce *
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "8px",
              backgroundColor: targetType === "general" ? "#e3f2fd" : "white",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              <input
                type="radio"
                checked={targetType === "general"}
                onChange={() => setTargetType("general")}
              />
              <span>🌐 Générale (visible par tous les employés)</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "8px",
              backgroundColor: targetType === "department" ? "#fff3e0" : "white",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              <input
                type="radio"
                checked={targetType === "department"}
                onChange={() => setTargetType("department")}
              />
              <span>🏢 Par département</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "8px",
              backgroundColor: targetType === "employee" ? "#f3e5f5" : "white",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              <input
                type="radio"
                checked={targetType === "employee"}
                onChange={() => setTargetType("employee")}
              />
              <span>👤 Employé spécifique</span>
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
              style={{ 
                width: "100%", 
                padding: "10px", 
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            >
              <option value="">-- Sélectionner un département --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {departments.length === 0 && (
              <small style={{ color: "#f57c00", display: "block", marginTop: "5px" }}>
                ⚠️ Aucun département disponible
              </small>
            )}
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
              style={{ 
                width: "100%", 
                padding: "10px", 
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ddd"
              }}
            >
              <option value="">-- Sélectionner un employé --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.email})
                </option>
              ))}
            </select>
            {employees.length === 0 && (
              <small style={{ color: "#f57c00", display: "block", marginTop: "5px" }}>
                ⚠️ Aucun employé disponible
              </small>
            )}
          </div>
        )}

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
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
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
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              resize: "vertical",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: loading ? "#ccc" : "#4CAF50", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            {loading ? "Création en cours..." : "✓ Créer l'annonce"}
          </button>
          
          <button 
            type="button"
            onClick={() => nav("/admin/announcements")}
            disabled={loading}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: "#999", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px"
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}