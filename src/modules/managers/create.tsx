import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import type { Department, Employee, ManagerFormData } from "./model";

export default function ManagerCreate() {
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
    loadData(); // C'est ici que l'appel API est déclenché au chargement du composant
}, []); 

const loadData = async () => {
    try {
        setLoading(true);
        const [employeesRes, departmentsRes] = await Promise.all([
            api.get("/employees"), 
            api.get("/departments"),
        ]);

        // 🎯 AJOUTEZ CECI :
        console.log("Employés reçus par ManagerCreate:", employeesRes.data.data);

        setEmployees(employeesRes.data.data || []);
        setDepartments(departmentsRes.data.data || []);
    } catch (err: any) {
        // ...
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
      setError("Veuillez sélectionner un employé");
      return;
    }

    try {
      await api.post("/managers", formData); // Utilise la fonction createManager du service si vous l'aviez importée

      alert("✅ Manager créé avec succès !");
      navigate("/admin/managers");
    // ... dans handleSubmit
} catch (err: any) {
    console.error("❌ Erreur création:", err);

    if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
        setError(err.response.data.message || "Erreur de validation");
    } else if (err.response?.status === 500) {
        // Ajout spécifique pour l'erreur 500
        setError("Erreur serveur (500) : Une erreur inattendue s'est produite côté API. Veuillez vérifier les logs du serveur.");
    } 
    else {
        setError(err.response?.data?.message || "Erreur lors de la création");
    }
}
// ...
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Créer un Manager</h1>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c33",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Employé */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
            Employé <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="employee_id"
            value={formData.employee_id || ""}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: validationErrors.employee_id
                ? "2px solid #c33"
                : "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">-- Sélectionner un employé --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} ({emp.email})
              </option>
            ))}
          </select>
          {validationErrors.employee_id && (
            <p style={{ color: "#c33", fontSize: "12px", marginTop: "4px" }}>
              {validationErrors.employee_id[0]}
            </p>
          )}
        </div>

        {/* Département */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}
          >
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
              borderRadius: "4px",
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
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ✅ Créer
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
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Info */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#e7f3ff",
          border: "1px solid #b3d9ff",
          borderRadius: "4px",
        }}
      >
        <h3 style={{ marginTop: 0, fontSize: "14px", fontWeight: "600" }}>
          ℹ️ Information
        </h3>
        <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6" }}>
          Sélectionnez un employé existant pour lui attribuer le rôle de manager.
          Vous pouvez optionnellement lui assigner un département à gérer.
        </p>
      </div>
    </div>
  );
}