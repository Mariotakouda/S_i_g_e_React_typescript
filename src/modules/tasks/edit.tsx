// src/modules/tasks/edit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TaskService } from "./service";

export default function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    assigned_to: 1,
    due_date: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await TaskService.get(Number(id));
    setForm({
      title: data.title,
      description: data.description || "",
      status: data.status,
      assigned_to: data.assigned_to,
      due_date: data.due_date || "",
    });
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await TaskService.update(Number(id), form);
    navigate("/admin/tasks");
  };

  return (
    <div>
      <h2>Modifier la tâche</h2>

      <form onSubmit={submit}>
        <div>
          <label>Titre</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div>
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div>
          <label>Statut</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
          </select>
        </div>

        <div>
          <label>ID Employé assigné</label>
          <input
            type="number"
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date limite</label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
        </div>

        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
}
