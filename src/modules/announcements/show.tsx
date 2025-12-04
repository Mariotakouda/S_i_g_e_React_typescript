import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnnouncement, deleteAnnouncement } from "./service";
import type { Announcement } from "./model";

export default function AnnouncementShow() {
  const { id } = useParams();
  const nav = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnnouncement(Number(id))
      .then(data => {
        setAnnouncement(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setError("Impossible de charger l'annonce");
        setLoading(false);
      });
  }, [id]);

  async function handleDelete() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      await deleteAnnouncement(Number(id));
      nav("/admin/announcements");
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  }

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!announcement) return <p>Annonce introuvable</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/admin/announcements" style={{ color: "#2196F3" }}>
          ← Retour à la liste
        </Link>
      </div>

      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "20px",
        backgroundColor: "#f9f9f9"
      }}>
        <h1 style={{ marginTop: 0 }}>{announcement.title}</h1>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "150px 1fr", 
          gap: "10px",
          marginBottom: "20px"
        }}>
          <div><strong>ID :</strong></div>
          <div>{announcement.id}</div>

          <div><strong>Destinataire :</strong></div>
          <div>
            {announcement.employee ? (
              <span>
                {announcement.employee.first_name} {announcement.employee.last_name}
                <br />
                <small style={{ color: "#666" }}>{announcement.employee.email}</small>
              </span>
            ) : (
              <em style={{ color: "#999" }}>Tous les employés (annonce générale)</em>
            )}
          </div>

          <div><strong>Date de création :</strong></div>
          <div>
            {announcement.created_at 
              ? new Date(announcement.created_at).toLocaleString('fr-FR')
              : "-"
            }
          </div>

          {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
            <>
              <div><strong>Dernière modification :</strong></div>
              <div>{new Date(announcement.updated_at).toLocaleString('fr-FR')}</div>
            </>
          )}
        </div>

        <div>
          <strong>Message :</strong>
          <div style={{ 
            marginTop: "10px", 
            padding: "15px", 
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            whiteSpace: "pre-wrap"
          }}>
            {announcement.message}
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <Link 
            to={`/admin/announcements/${id}/edit`}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#FF9800", 
              color: "white", 
              textDecoration: "none",
              borderRadius: "4px"
            }}
          >
            ✏️ Modifier
          </Link>
          
          <button 
            onClick={handleDelete}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#f44336", 
              color: "white", 
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}