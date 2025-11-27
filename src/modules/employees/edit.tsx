// src/modules/employees/edit.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios"; // Assurez-vous que `api` est disponible ou utilisez `EmployeeService`
import { EmployeeService } from "./service";
import type { EmployeeFormData } from "./model";

// Interfaces (copiées/adaptées de create.tsx si non exportées de model.ts)
interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialisation du formulaire à null pour indiquer le chargement initial
  const [form, setForm] = useState<EmployeeFormData | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Styles (Copiez ceux de create.tsx pour une cohérence visuelle)
  const labelStyle: React.CSSProperties = { /* ... styles ... */ }; // À définir ou importer
  const inputStyle: React.CSSProperties = { /* ... styles ... */ };
  const inputErrorStyle: React.CSSProperties = { /* ... styles ... */ };
  const errorTextStyle: React.CSSProperties = { /* ... styles ... */ };

  // Définition des styles si non importés
  // (Pour garder ce code auto-suffisant et similaire à create.tsx)
  const baseInputStyle: React.CSSProperties = {
    width: "100%", padding: "10px", border: "1px solid #d1d5db",
    borderRadius: "5px", fontSize: "14px", boxSizing: "border-box",
  };
  Object.assign(labelStyle, { display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151", fontSize: "14px" });
  Object.assign(inputStyle, baseInputStyle);
  Object.assign(inputErrorStyle, { ...baseInputStyle, border: "1px solid #ef4444" });
  Object.assign(errorTextStyle, { color: "#ef4444", fontSize: "12px", marginTop: "5px" });


  // 1. Chargement des données (Employé, Départements, Rôles)
  useEffect(() => {
    const loadData = async () => {
      try {
        const employeeId = Number(id);
        if (isNaN(employeeId)) {
          setError("ID d'employé invalide.");
          return;
        }

        const [employeeRes, deptsRes, rolesRes] = await Promise.all([
          EmployeeService.get(employeeId),
          api.get("/departments"),
          api.get("/roles"),
        ]);

        const e = employeeRes.data;

        // Remplir le formulaire avec les données de l'employé
        setForm({
          first_name: e.first_name,
          last_name: e.last_name ?? null,
          email: e.email,
          phone: e.phone ?? null,
          contract_type: e.contract_type ?? null,
          // Formatage de la date pour le champ 'date' (important)
          hire_date: e.hire_date ? new Date(e.hire_date).toISOString().split('T')[0] : null,
          salary_base: e.salary_base ?? null,
          department_id: e.department_id ?? null,
          // Pas besoin de role_ids dans le state du formulaire ici, mais pour la cohérence
          // role_ids: e.roles?.map(r => r.id),
        });

        // Remplir les rôles sélectionnés
        setSelectedRoles(e.roles ? e.roles.map((r) => r.id) : []);

        // Remplir les listes de départements et rôles disponibles
        setDepartments(
          Array.isArray(deptsRes.data.data) ? deptsRes.data.data :
            Array.isArray(deptsRes.data) ? deptsRes.data : []
        );
        setRoles(
          Array.isArray(rolesRes.data.data) ? rolesRes.data.data :
            Array.isArray(rolesRes.data) ? rolesRes.data : []
        );

      } catch (err: any) {
        console.error("❌ Erreur chargement des données:", err);
        setError("Impossible de charger les données de l'employé, des départements ou des rôles.");
      }
    };

    loadData();
  }, [id]);

  // Validation du formulaire (copiée de create.tsx)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form) return false;

    if (!form.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    }

    if (!form.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!form.contract_type) {
      newErrors.contract_type = "Le type de contrat est requis";
    }

    if (!form.hire_date) {
      newErrors.hire_date = "La date d'embauche est requise";
    }

    if (form.salary_base && form.salary_base < 0) {
      newErrors.salary_base = "Le salaire ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 2. Gestion de la soumission (Mise à jour)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const employeeId = Number(id);

      console.log("📤 Envoi des données de mise à jour:", {
        ...form,
        role_ids: selectedRoles,
      });

      // Mettre à jour l'employé avec les rôles
      const response = await EmployeeService.update(employeeId, {
        ...form,
        role_ids: selectedRoles.length > 0 ? selectedRoles : undefined,
      });

      console.log("✅ Employé mis à jour:", response.data);

      alert("Employé mis à jour avec succès !");
      navigate("/admin/employees");
    } catch (err: any) {
      console.error("❌ Erreur mise à jour employé:", err);

      if (err.response?.data?.errors) {
        // Erreurs de validation Laravel
        const validationErrors = err.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = validationErrors[key][0];
        });

        setErrors(formattedErrors);
        setError("Erreurs de validation");
      } else {
        setError(
          err.response?.data?.message ||
          "Erreur lors de la mise à jour de l'employé"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Gestion de la sélection des rôles (copiée de create.tsx)
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };


  if (!form) return <p style={{ padding: "20px", textAlign: "center" }}>Chargement de l'employé...</p>;

  // 4. Rendu du formulaire (similaire à create.tsx, mais avec l'action de mise à jour)
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Modifier l'employé #{id}
        </h2>
        <button
          onClick={() => navigate("/admin/employees")}
          style={{
            padding: "8px 15px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ← Retour à la liste
        </button>
      </div>

      {error && (
        <div style={{
          padding: "15px", backgroundColor: "#fee", border: "1px solid #fcc",
          borderRadius: "5px", marginBottom: "20px", color: "#c00",
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: "white", padding: "30px", borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <form onSubmit={handleSubmit}>
          {/* Prénom */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>
              Prénom <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Prénom de l'employé"
              value={form.first_name}
              onChange={(e) => {
                setForm({ ...form, first_name: e.target.value });
                if (errors.first_name) { setErrors({ ...errors, first_name: "" }); }
              }}
              style={errors.first_name ? inputErrorStyle : inputStyle}
            />
            {errors.first_name && (<p style={errorTextStyle}>{errors.first_name}</p>)}
          </div>

          {/* Nom */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>Nom</label>
            <input
              type="text"
              placeholder="Nom de famille"
              value={form.last_name ?? ""}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>
              Email <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) { setErrors({ ...errors, email: "" }); }
              }}
              style={errors.email ? inputErrorStyle : inputStyle}
            />
            {errors.email && (<p style={errorTextStyle}>{errors.email}</p>)}
          </div>

          {/* Téléphone */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              placeholder="+228 XX XX XX XX"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Type de contrat */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>
              Type de contrat <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={form.contract_type ?? ""}
              onChange={(e) => {
                setForm({ ...form, contract_type: e.target.value });
                if (errors.contract_type) { setErrors({ ...errors, contract_type: "" }); }
              }}
              style={errors.contract_type ? inputErrorStyle : inputStyle}
            >
              <option value="">-- Sélectionner --</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Freelance">Freelance</option>
              <option value="Alternance">Alternance</option>
            </select>
            {errors.contract_type && (<p style={errorTextStyle}>{errors.contract_type}</p>)}
          </div>

          {/* Date d'embauche */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>
              Date d'embauche <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              value={form.hire_date ?? ""}
              onChange={(e) => {
                setForm({ ...form, hire_date: e.target.value });
                if (errors.hire_date) { setErrors({ ...errors, hire_date: "" }); }
              }}
              style={errors.hire_date ? inputErrorStyle : inputStyle}
            />
            {errors.hire_date && (<p style={errorTextStyle}>{errors.hire_date}</p>)}
          </div>

          {/* Salaire de base */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>Salaire de base (FCFA)</label>
            <input
              type="number"
              placeholder="500000"
              min="0"
              step="1000"
              value={form.salary_base ?? ""}
              onChange={(e) => {
                setForm({ ...form, salary_base: Number(e.target.value) || undefined });
                if (errors.salary_base) { setErrors({ ...errors, salary_base: "" }); }
              }}
              style={errors.salary_base ? inputErrorStyle : inputStyle}
            />
            {errors.salary_base && (<p style={errorTextStyle}>{errors.salary_base}</p>)}
          </div>

          {/* Département */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>Département</label>
            <select
              value={form.department_id ?? ""}
              onChange={(e) =>
                setForm({ ...form, department_id: Number(e.target.value) || null })
              }
              style={inputStyle}
            >
              <option value="">-- Aucun département --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rôles */}
          {roles.length > 0 && (
            <div style={{ marginBottom: "25px" }}>
              <label style={labelStyle}>Rôles</label>
              <div style={{
                border: "1px solid #d1d5db", borderRadius: "5px", padding: "15px",
                backgroundColor: "#f9fafb",
              }}>
                {roles.map((role) => (
                  <div key={role.id} style={{ marginBottom: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        style={{ marginRight: "10px", cursor: "pointer" }}
                      />
                      <span>{role.name}</span>
                    </label>
                  </div>
                ))}
              </div>
              <small style={{ color: "#6b7280", fontSize: "12px" }}>
                Sélectionnez un ou plusieurs rôles pour cet employé
              </small>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "12px",
                backgroundColor: loading ? "#9ca3af" : "#f59e0b", // Couleur pour la mise à jour
                color: "white", border: "none", borderRadius: "5px",
                fontSize: "16px", fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Mise à jour en cours..." : "Mettre à jour l'employé"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/employees")}
              disabled={loading}
              style={{
                padding: "12px 24px", backgroundColor: "white", color: "#374151",
                border: "1px solid #d1d5db", borderRadius: "5px",
                fontSize: "16px", fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

