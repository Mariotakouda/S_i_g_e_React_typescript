// src/modules/tasks/show.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TaskService } from "./service";
import type { Task } from "./model";

export default function TaskShow() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await TaskService.get(Number(id));
      setTask(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "in_progress":
        return "#2196F3";
      case "completed":
        return "#4CAF50";
      default:
        return "#999";
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!task) return <p>Tâche non trouvée</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      <h2>Détails de la tâche</h2>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#666" }}>ID :</strong>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>{task.id}</p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#666" }}>Titre :</strong>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>{task.title}</p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#666" }}>Description :</strong>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            {task.description || "Aucune description"}
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#666" }}>Statut :</strong>
          <p style={{ margin: "5px 0" }}>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                backgroundColor: getStatusColor(task.status),
                color: "white",
                fontSize: "14px",
                display: "inline-block",
              }}
            >
              {getStatusLabel(task.status)}
            </span>
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#666" }}>Assignée à :</strong>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            {task.employee
              ? `${task.employee.first_name} ${task.employee.last_name}`
              : "Non assignée"}
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#666" }}>Date limite :</strong>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            {task.due_date || "—"}
          </p>
        </div>

        {task.created_at && (
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#666" }}>Créée le :</strong>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "#999" }}>
              {new Date(task.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <Link to="/admin/tasks">
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            ← Retour à la liste
          </button>
        </Link>
        <Link to={`/admin/tasks/${task.id}/edit`}>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Modifier
          </button>
        </Link>
      </div>
    </div>
  );
}