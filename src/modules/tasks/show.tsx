// src/modules/tasks/show.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TaskService } from "./service";
import type { Task } from "./model";

export default function TaskShow() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await TaskService.get(Number(id));
    setTask(data);
  };

  if (!task) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Détails de la tâche</h2>

      <p><strong>ID :</strong> {task.id}</p>
      <p><strong>Titre :</strong> {task.title}</p>
      <p><strong>Description :</strong> {task.description}</p>
      <p><strong>Statut :</strong> {task.status}</p>
      <p><strong>Assignée à :</strong> {task.assigned_to}</p>
      <p><strong>Date limite :</strong> {task.due_date || "—"}</p>

      <Link to="/admin/tasks">← Retour à la liste</Link>
    </div>
  );
}
