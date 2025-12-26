// src/modules/announcements/show.tsx
import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnnouncement, deleteAnnouncement, checkManagerStatus } from "./service";
import { AuthContext } from "../../context/AuthContext";
import type { Announcement } from "./model";
import type { ManagerStatus } from "./service";

export default function AnnouncementShow() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [announcementData, status] = await Promise.all([
          getAnnouncement(Number(id)),
          checkManagerStatus()
        ]);
        
        setAnnouncement(announcementData);
        setManagerStatus(status);
        setLoading(false);
      } catch (err: any) {
        console.error("Erreur:", err);
        setError(err.response?.data?.message || "Impossible de charger l'annonce");
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      await deleteAnnouncement(Number(id));
      nav("/admin/announcements");
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  }

  function canManageAnnouncement(): boolean {
    if (!announcement) return false;
    if (user?.role === "admin") return true;
    if (managerStatus?.is_manager) {
      return announcement.department_id === managerStatus.department_id;
    }
    return false;
  }

  function getDestinataireInfo(): { label: string; color: string; icon: string } {
    if (!announcement) return { label: "", color: "#f5f5f5", icon: "" };
    
    if (announcement.is_general) {
      return { 
        label: "Tous les employés (Général)", 
        color: "#e3f2fd", 
        icon: "🌐" 
      };
    }
    if (announcement.department) {
      return { 
        label: `Département: ${announcement.department.name}`, 
        color: "#fff3e0", 
        icon: "🏢" 
      };
    }
    if (announcement.employee) {
      return { 
        label: `${announcement.employee.first_name} ${announcement.employee.last_name}`, 
        color: "#f3e5f5", 
        icon: "👤" 
      };
    }
    return { label: "Général", color: "#f5f5f5", icon: "📢" };
  }

  if (loading) return <p style={{ padding: "20px" }}>Chargement...</p>;
  
  if (error) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{
          padding: "20px",
          backgroundColor: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "8px",
          color: "#d32f2f"
        }}>
          {error}
        </div>
        <button
          onClick={() => nav("/admin/announcements")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Retour à la liste
        </button>
      </div>
    );
  }
  
  if (!announcement) return <p style={{ padding: "20px" }}>Annonce introuvable</p>;

  const destinataireInfo = getDestinataireInfo();
  const canManage = canManageAnnouncement();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link 
          to="/admin/announcements" 
          style={{ 
            color: "#2196F3",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          ← Retour à la liste
        </Link>
      </div>

      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "24px",
        backgroundColor: "#f9f9f9"
      }}>
        {/* Badge de type */}
        <div style={{
          padding: "6px 12px",
          backgroundColor: destinataireInfo.color,
          borderRadius: "4px",
          fontSize: "14px",
          display: "inline-block",
          marginBottom: "20px",
          fontWeight: "500"
        }}>
          {destinataireInfo.icon} {destinataireInfo.label}
        </div>

        <h1 style={{ marginTop: 0, marginBottom: "20px" }}>{announcement.title}</h1>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "150px 1fr", 
          gap: "12px",
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "white",
          borderRadius: "4px",
          border: "1px solid #e0e0e0"
        }}>
          <div style={{ fontWeight: "500", color: "#666" }}>ID :</div>
          <div>{announcement.id}</div>

          <div style={{ fontWeight: "500", color: "#666" }}>Date de création :</div>
          <div>
            {announcement.created_at 
              ? new Date(announcement.created_at).toLocaleString('fr-FR', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })
              : "-"
            }
          </div>

          {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
            <>
              <div style={{ fontWeight: "500", color: "#666" }}>Dernière modification :</div>
              <div>
                {new Date(announcement.updated_at).toLocaleString('fr-FR', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </div>
            </>
          )}
        </div>

        <div>
          <strong style={{ display: "block", marginBottom: "10px", fontSize: "16px" }}>
            Message :
          </strong>
          <div style={{ 
            padding: "20px", 
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
            fontSize: "15px"
          }}>
            {announcement.message}
          </div>
        </div>

        {canManage && (
          <div style={{ 
            marginTop: "24px", 
            display: "flex", 
            gap: "10px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0"
          }}>
            <Link 
              to={`/admin/announcements/${id}/edit`}
              style={{ 
                padding: "10px 24px", 
                backgroundColor: "#FF9800", 
                color: "white", 
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "500"
              }}
            >
              ✏️ Modifier
            </Link>
            
            <button 
              onClick={handleDelete}
              style={{ 
                padding: "10px 24px", 
                backgroundColor: "#f44336", 
                color: "white", 
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              🗑️ Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}