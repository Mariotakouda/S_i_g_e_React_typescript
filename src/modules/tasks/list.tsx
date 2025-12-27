// src/modules/tasks/list.tsx
import React, { useEffect, useState } from "react";
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "#FFF7ED", text: "#C2410C" };
      case "in_progress": return { bg: "#EFF6FF", text: "#1D4ED8" };
      case "completed": return { bg: "#F0FDF4", text: "#15803D" };
      default: return { bg: "#F3F4F6", text: "#374151" };
    }
  };

  // --- Icons SVG ---
  const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
  const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
  const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
  const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

  return (
    <div className="task-list-wrapper">
      <style>{`
        .task-list-wrapper { padding: 24px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; background-color: #f9fafb; min-height: 100vh; }
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .title { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
        
        .controls { display: flex; gap: 12px; width: 100%; flex-wrap: wrap; }
        .search-form { display: flex; flex: 1; min-width: 280px; position: relative; }
        .search-input { width: 100%; padding: 10px 12px 10px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border 0.2s; }
        .search-input:focus { border-color: #2563eb; ring: 2px solid #dbeafe; }
        .search-icon-pos { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }

        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; }
        .btn-primary { background-color: #2563eb; color: white; }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-success { background-color: #059669; color: white; }
        .btn-success:hover { background-color: #047857; }
        .btn-outline { background: white; border: 1px solid #d1d5db; color: #374151; }
        .btn-danger-text { color: #dc2626; background: #fee2e2; padding: 6px; }

        .content-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        
        /* Table styles */
        table { width: 100%; border-collapse: collapse; display: table; }
        th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
        td { padding: 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; vertical-align: middle; }
        
        /* Status Badge */
        .badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }

        /* Pagination */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
        .page-info { font-size: 14px; color: #6b7280; font-weight: 500; }

        /* Responsive Mobile Cards */
        .mobile-task-card { display: none; padding: 16px; border-bottom: 1px solid #eee; }

        @media (max-width: 768px) {
          table thead { display: none; }
          table, tbody, tr, td { display: block; width: 100%; }
          tr { margin-bottom: 8px; padding: 8px; border-bottom: 4px solid #f3f4f6; }
          td { border: none; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; }
          td::before { content: attr(data-label); font-weight: 600; color: #6b7280; font-size: 12px; }
          .header-section { flex-direction: column; align-items: flex-start; }
          .btn-new-task { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="header-section">
        <h2 className="title">Liste des tâches</h2>
        <Link to="create" className="btn btn-success btn-new-task">
          <IconPlus /> Nouvelle tâche
        </Link>
      </div>

      <div className="controls" style={{ marginBottom: "20px" }}>
        <form onSubmit={handleSearch} className="search-form">
          <span className="search-icon-pos"><IconSearch /></span>
          <input
            className="search-input"
            placeholder="Rechercher par titre, employé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ marginLeft: "8px" }}>
            Rechercher
          </button>
        </form>
      </div>

      <div className="content-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Chargement en cours...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Assignée à</th>
                  <th>Statut</th>
                  <th>Échéance</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                      Aucune tâche trouvée
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const statusStyle = getStatusStyle(t.status);
                    return (
                      <tr key={t.id}>
                        <td data-label="ID" style={{ color: "#9ca3af", fontWeight: 500 }}>#{t.id}</td>
                        <td data-label="Titre" style={{ fontWeight: 600 }}>{t.title}</td>
                        <td data-label="Assignée à">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#e5e7eb", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {t.employee ? t.employee.first_name[0] : "?"}
                            </div>
                            {t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : "Non assignée"}
                          </div>
                        </td>
                        <td data-label="Statut">
                          <span className="badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                            {getStatusLabel(t.status)}
                          </span>
                        </td>
                        <td data-label="Échéance">{t.due_date || "—"}</td>
                        <td data-label="Actions">
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <Link to={`${t.id}`} className="btn btn-outline" style={{ padding: "6px 10px" }} title="Voir">
                              Voir
                            </Link>
                            <Link to={`${t.id}/edit`} className="btn btn-outline" style={{ padding: "6px 10px", color: "#f59e0b" }} title="Modifier">
                              <IconEdit />
                            </Link>
                            <button onClick={() => remove(t.id)} className="btn btn-danger-text" title="Supprimer">
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && tasks.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!meta?.prev_page_url}
            className="btn btn-outline"
            style={{ opacity: meta?.prev_page_url ? 1 : 0.5 }}
          >
            &larr; Précédent
          </button>

          <span className="page-info">
            Page {meta?.current_page || 1} sur {meta?.last_page || 1}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={!meta?.next_page_url}
            className="btn btn-outline"
            style={{ opacity: meta?.next_page_url ? 1 : 0.5 }}
          >
            Suivant &rarr;
          </button>
        </div>
      )}
    </div>
  );
}