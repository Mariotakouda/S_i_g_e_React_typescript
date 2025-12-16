import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnnouncements, deleteAnnouncement } from "./service";
import type { Announcement } from "./model";

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await fetchAnnouncements(search, page);
      setAnnouncements(data.data);
      setMeta(data.meta);
      setError("");
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      setError("Impossible de charger les annonces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [search, page]);

  async function handleDelete(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      await deleteAnnouncement(id);
      load();
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  }

  function getDestinataireLabel(announcement: Announcement): string {
    if (announcement.is_general) {
      return "🌐 Tous les employés (Général)";
    }
    if (announcement.department) {
      return `🏢 Département: ${announcement.department.name}`;
    }
    if (announcement.employee) {
      return `👤 ${announcement.employee.first_name} ${announcement.employee.last_name}`;
    }
    return "📢 Général";
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestion des Annonces</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          placeholder="Rechercher une annonce..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", flex: 1, maxWidth: "400px" }}
        />
        <Link 
          to="create"
          style={{ 
            padding: "8px 16px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "4px"
          }}
        >
          + Nouvelle annonce
        </Link>
      </div>

      {error && <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#fee", borderRadius: "4px" }}>{error}</div>}

      {loading ? (
        <p>Chargement...</p>
      ) : announcements.length === 0 ? (
        <p>Aucune annonce trouvée</p>
      ) : (
        <table border={1} width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px" }}>ID</th>
              <th style={{ padding: "10px" }}>Destinataire</th>
              <th style={{ padding: "10px" }}>Titre</th>
              <th style={{ padding: "10px" }}>Message</th>
              <th style={{ padding: "10px" }}>Date</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "10px", textAlign: "center" }}>{a.id}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: "4px",
                    backgroundColor: a.is_general ? "#e3f2fd" : a.department_id ? "#fff3e0" : "#f3e5f5",
                    fontSize: "13px"
                  }}>
                    {getDestinataireLabel(a)}
                  </span>
                </td>
                <td style={{ padding: "10px", fontWeight: "bold" }}>{a.title}</td>
                <td style={{ padding: "10px" }}>
                  {a.message.length > 100 
                    ? a.message.substring(0, 100) + "..." 
                    : a.message
                  }
                </td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#666" }}>
                  {a.created_at ? new Date(a.created_at).toLocaleString('fr-FR') : "-"}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <Link 
                    to={`${a.id}`}
                    style={{ marginRight: "10px", color: "#2196F3" }}
                  >
                    👁️ Voir
                  </Link>
                  <Link 
                    to={`${a.id}/edit`}
                    style={{ marginRight: "10px", color: "#FF9800" }}
                  >
                    ✏️ Modifier
                  </Link>
                  <button 
                    onClick={() => handleDelete(a.id)}
                    style={{ 
                      color: "#f44336", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer" 
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {meta && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(page - 1)}
            style={{ 
              padding: "8px 16px", 
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.5 : 1
            }}
          >
            ← Précédent
          </button>
          
          <span>
            Page {meta.current_page} / {meta.last_page} 
            ({meta.total} annonce{meta.total > 1 ? "s" : ""})
          </span>
          
          <button 
            disabled={page >= meta.last_page} 
            onClick={() => setPage(page + 1)}
            style={{ 
              padding: "8px 16px", 
              cursor: page >= meta.last_page ? "not-allowed" : "pointer",
              opacity: page >= meta.last_page ? 0.5 : 1
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}