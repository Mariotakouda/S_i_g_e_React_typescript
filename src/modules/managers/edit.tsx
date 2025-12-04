import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getManager, updateManager, fetchEmployeesAndDepartments } from "./service";
import type { Employee, Department, ManagerFormData } from "./model"; 

export default function ManagerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<ManagerFormData>({
    employee_id: null,
    department_id: null,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) {
      setError("ID du manager manquant");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError("");

      console.log("📤 Chargement manager #" + id);
      
      // Charger les données en parallèle
      const [manager, dependencies] = await Promise.all([
        getManager(id),
        fetchEmployeesAndDepartments(),
      ]);

      console.log("✅ Manager chargé:", manager);
      console.log("✅ Dépendances chargées:", dependencies);

      setEmployees(dependencies.employees);
      setDepartments(dependencies.departments);

      // Assurer les valeurs par défaut pour le formulaire
      setFormData({
        employee_id: manager.employee_id || null,
        department_id: manager.department_id || null,
      });

      console.log("✅ FormData initialisé:", {
        employee_id: manager.employee_id,
        department_id: manager.department_id
      });

    } catch (err: any) {
      console.error("❌ Erreur chargement:", err);
      console.error("❌ Détails:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      setError(
        err.response?.data?.message || 
        "Impossible de charger les données du manager ou les dépendances."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name.includes("_id")) {
      processedValue = value === "" ? null : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
    
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    
    if (!formData.employee_id) { 
      setError("Erreur interne : Employé non sélectionné.");
      return;
    }

    if (!id) {
      setError("ID du manager manquant");
      return;
    }

    try {
      console.log("📤 Mise à jour manager #" + id, formData);
      
      await updateManager(Number(id), formData);
      
      console.log("✅ Manager mis à jour avec succès");
      alert("✅ Manager mis à jour avec succès !");
      navigate("/admin/managers");
      
    } catch (err: any) {
      console.error("❌ Erreur mise à jour:", err);
      console.error("❌ Détails:", {
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
        setError(err.response.data.message || "Erreur de validation");
      } else {
        setError(err.response?.data?.message || "Erreur lors de la mise à jour");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Chargement des données du manager...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Modifier le Manager #{id}</h1>
      
      {error && (
        <div style={{ 
          padding: "12px", 
          marginBottom: "20px", 
          backgroundColor: "#fee", 
          border: "1px solid #fcc", 
          borderRadius: "4px", 
          color: "#c33" 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Employé (lecture seule) */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Employé
          </label>
          <select
            name="employee_id"
            value={formData.employee_id || ""}
            disabled={true}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ccc", 
              borderRadius: "4px", 
              backgroundColor: "#f9f9f9" 
            }}
          >
            <option value="">-- Chargement --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} ({emp.email})
              </option>
            ))}
          </select>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            L'employé manager ne peut pas être modifié.
          </p>
        </div>

        {/* Département */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Département à gérer
          </label>
          <select
            name="department_id"
            value={formData.department_id || ""}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
          >
            <option value="">-- Optionnel --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer", 
              fontWeight: "600" 
            }}
          >
            💾 Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/managers")}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#6c757d", 
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