// src/modules/departments/edit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DepartmentService } from "./service";
import { api } from "../../api/axios";

interface Manager {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function DepartmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    manager_id: ""
  });
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManagers();
    load();
  }, []);

  const loadManagers = async () => {
    try {
      const res = await api.get("/managers");
      setManagers(res.data.data || res.data || []);
    } catch (err) {
      console.error("❌ Erreur chargement managers:", err);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📤 Chargement département ID:", id);
      const data = await DepartmentService.get(Number(id));
      
      setForm({
        name: data.name,
        description: data.description || "",
        manager_id: data.manager_id ? String(data.manager_id) : ""
      });
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err);
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        name: form.name,
        description: form.description,
        manager_id: form.manager_id ? Number(form.manager_id) : null
      };
      
      console.log("📤 Mise à jour département:", payload);
      await DepartmentService.update(Number(id), payload);
      
      alert("Département mis à jour avec succès !");
      navigate("/admin/departments");
    } catch (err: any) {
      console.error("❌ Erreur mise à jour:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <p>Chargement du département...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      {/* En-tête */}
      <div style={{ marginBottom: "30px" }}>
        <Link 
          to="/admin/departments"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "15px"
          }}
        >
          ← Retour à la liste
        </Link>
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
          ✏️ Modifier le département
        </h2>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "8px",
          color: "#c00",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form 
        onSubmit={submit}
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Nom du département *
          </label>
          <input 
            type="text"
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Manager
          </label>
          <select
            name="manager_id"
            value={form.manager_id}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
              backgroundColor: "white"
            }}
          >
            <option value="">-- Aucun manager --</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>
                {m.first_name} {m.last_name} ({m.email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontWeight: "500",
            color: "#374151"
          }}>
            Description
          </label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            rows={4}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              backgroundColor: saving ? "#9ca3af" : "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "14px"
            }}
          >
            {saving ? "Enregistrement..." : "✓ Mettre à jour"}
          </button>
          
          <Link
            to="/admin/departments"
            style={{
              padding: "12px 24px",
              backgroundColor: "#6b7280",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
              display: "inline-block"
            }}
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}