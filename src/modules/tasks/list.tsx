// src/modules/tasks/list.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TaskService } from "./service";
import type { Task } from "./model";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});

  const load = async () => {
    const res = await TaskService.list(page, search);
    setTasks(res.data);
    setMeta(res.meta);
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await TaskService.remove(id);
    load();
  };

  return (
    <div>
      <h2>Liste des tâches</h2>

      <form onSubmit={handleSearch}>
        <input
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Rechercher</button>
      </form>

      <Link to="create">
        <button>+ Nouvelle tâche</button>
      </Link>

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Assignée à</th>
            <th>Statut</th>
            <th>Date limite</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.assigned_to}</td>
              <td>{t.status}</td>
              <td>{t.due_date || "—"}</td>
              <td>
                <Link to={`${t.id}`}>Voir</Link> |
                <Link to={`${t.id}/edit`}>Modifier</Link> |
                <button onClick={() => remove(t.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "10px" }}>
        {meta.prev_page_url && (
          <button onClick={() => setPage(page - 1)}>← Précédent</button>
        )}

        <span style={{ margin: "0 10px" }}>
          Page {meta.current_page} / {meta.last_page}
        </span>

        {meta.next_page_url && (
          <button onClick={() => setPage(page + 1)}>Suivant →</button>
        )}
      </div>
    </div>
  );
}
