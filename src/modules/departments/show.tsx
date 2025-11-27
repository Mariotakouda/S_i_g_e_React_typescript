// src/modules/departments/show.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DepartmentService } from "./service";
import type { Department } from "./model";

export default function DepartmentShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      load();
    } else {
      setError("ID invalide");
      setLoading(false);
    }
  }, [id]); // ✅ dépendance ajoutée

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📤 Chargement département ID:", id);
      const data = await DepartmentService.get(Number(id));
      setDepartment(data);
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err);
      setError(err.response?.data?.message || err.message || "Département introuvable");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return;

    try {
      await DepartmentService.remove(Number(id));
      alert("Département supprimé avec succès !");
      navigate("/admin/departments");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div style={{ padding: "30px" }}>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c00",
            marginBottom: "20px",
          }}
        >
          {error || "Département introuvable"}
        </div>
        <Link to="/admin/departments" style={{ color: "#3b82f6" }}>
          ← Retour à la liste
        </Link>
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
            marginBottom: "15px",
          }}
        >
          ← Retour à la liste
        </Link>
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
          🏢 Détails du département
        </h2>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            ID
          </p>
          <p style={{ fontSize: "18px", fontWeight: "500", margin: 0 }}>
            {department.id}
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            Nom
          </p>
          <p style={{ fontSize: "18px", fontWeight: "500", margin: 0 }}>
            {department.name}
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            Manager
          </p>
          {department.manager ? (
            <p style={{ fontSize: "16px", margin: 0, color: "#374151" }}>
              {department.manager.first_name} {department.manager.last_name}
              <br />
              <small style={{ color: "#6b7280" }}>
                {department.manager.email}
              </small>
            </p>
          ) : (
            <p
              style={{
                fontSize: "16px",
                margin: 0,
                color: "#9ca3af",
                fontStyle: "italic",
              }}
            >
              Aucun manager assigné
            </p>
          )}
        </div>

        <div style={{ marginBottom: "30px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            Description
          </p>
          <p style={{ fontSize: "16px", margin: 0, color: "#374151" }}>
            {department.description || "Aucune description"}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
          }}
        >
          <Link
            to={`/admin/departments/${department.id}/edit`}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f59e0b",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "500",
            }}
          >
            ✏️ Modifier
          </Link>

          <button
            onClick={handleDelete}
            aria-label="Supprimer le département"
            style={{
              padding: "10px 20px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
