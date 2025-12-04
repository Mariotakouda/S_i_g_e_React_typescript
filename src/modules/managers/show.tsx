import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getManager } from "./service";
import type { Manager } from "./model";

export default function ManagerShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadManager();
  }, [id]);

  const loadManager = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getManager(id);
      setManager(data);
      setError("");
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err);
      setError("Impossible de charger les détails du manager.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Chargement des détails...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <div style={{ padding: "12px", marginBottom: "20px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "4px", color: "#c33" }}>
          {error}
        </div>
        <button
          onClick={() => navigate("/admin/managers")}
          style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!manager) {
    return <div style={{ padding: "20px" }}>Manager non trouvé.</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: 
      // ... (Assurez-vous qu'il n'y a pas d'affichage de manager.phone ici)
      
      // La ligne ci-dessous est juste un exemple pour compléter le bloc, 
      // car le reste du code de ManagerShow n'était pas fourni:
      "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Détails du Manager</h1>
        {/* Assurez-vous d'avoir des boutons d'action ici */}
      </div>

      <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "4px" }}>
        <p><strong>Employé :</strong> {manager.employee.first_name} {manager.employee.last_name} ({manager.employee.email})</p>
        <p><strong>ID Employé :</strong> {manager.employee_id}</p>
        <p><strong>Département :</strong> {manager.department ? manager.department.name : "Non assigné"}</p>
        <p><strong>Date de création :</strong> {new Date(manager.created_at).toLocaleDateString()}</p>
      </div>

      <button
        onClick={() => navigate("/admin/managers")}
        style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        Retour à la liste
      </button>
    </div>
  );
}