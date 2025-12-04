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
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await TaskService.list(page, search);
      setTasks(res.data || []);
      setMeta(res.meta);
    } catch (error) {
      console.error("Erreur de chargement des tâches:", error);
    } finally {
      setLoading(false);
    }
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
    try {
      await TaskService.remove(id);
      load();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "in_progress": return "En cours";
      case "completed": return "Terminée";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#FFA500";
      case "in_progress": return "#2196F3";
      case "completed": return "#4CAF50";
      default: return "#999";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Liste des tâches</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flex: 1 }}>
          <input
            placeholder="Recherche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Rechercher
          </button>
        </form>

        <Link to="create">
          <button
            style={{
              padding: "8px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + Nouvelle tâche
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>ID</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Titre</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Assignée à</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Statut</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Date limite</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                      Aucune tâche trouvée
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{t.id}</td>
                      <td style={{ padding: "12px" }}>{t.title}</td>
                      <td style={{ padding: "12px" }}>
                        {t.employee
                          ? `${t.employee.first_name} ${t.employee.last_name}`
                          : "Non assignée"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: getStatusColor(t.status),
                            color: "white",
                            fontSize: "12px",
                          }}
                        >
                          {getStatusLabel(t.status)}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>{t.due_date || "—"}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link to={`${t.id}`}>
                            <button
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Voir
                            </button>
                          </Link>
                          <Link to={`${t.id}/edit`}>
                            <button
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#FF9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Modifier
                            </button>
                          </Link>
                          <button
                            onClick={() => remove(t.id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={!meta?.prev_page_url}
              style={{
                padding: "8px 16px",
                backgroundColor: meta?.prev_page_url ? "#2196F3" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: meta?.prev_page_url ? "pointer" : "not-allowed",
              }}
            >
              ← Précédent
            </button>

            <span style={{ margin: "0 10px", fontWeight: "bold" }}>
              Page {meta?.current_page || 1} / {meta?.last_page || 1}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={!meta?.next_page_url}
              style={{
                padding: "8px 16px",
                backgroundColor: meta?.next_page_url ? "#2196F3" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: meta?.next_page_url ? "pointer" : "not-allowed",
              }}
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </div>
  );
}