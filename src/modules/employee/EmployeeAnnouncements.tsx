// src/modules/employee/EmployeeAnnouncementsView.tsx

import { useEffect, useState } from "react";
import { fetchMyAnnouncements } from "../announcements/service";
import type { Announcement } from "../announcements/model";

export default function EmployeeAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const data = await fetchMyAnnouncements();
      setAnnouncements(data);
      setError("");
    } catch (err: any) {
      console.error("Erreur chargement annonces:", err);
      setError("Impossible de charger les annonces");
    } finally {
      setLoading(false);
    }
  }

  function getAnnouncementType(announcement: Announcement): { label: string; color: string; icon: string } {
    if (announcement.is_general) {
      return { label: "Général", color: "#e3f2fd", icon: "🌐" };
    }
    if (announcement.department) {
      return { label: `Département: ${announcement.department.name}`, color: "#fff3e0", icon: "🏢" };
    }
    if (announcement.employee) {
      return { label: "Personnel", color: "#f3e5f5", icon: "👤" };
    }
    return { label: "Général", color: "#f5f5f5", icon: "📢" };
  }

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Chargement des annonces...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>📢 Mes Annonces</h1>

      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "5px",
          marginBottom: "20px",
          color: "#c00"
        }}>
          {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <div style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #e0e0e0"
        }}>
          <p style={{ fontSize: "18px", color: "#666" }}>Aucune annonce pour le moment</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {announcements.map((announcement) => {
            const type = getAnnouncementType(announcement);
            return (
              <div
                key={announcement.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
                onClick={() => setSelectedAnnouncement(announcement)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Badge de type */}
                <div style={{
                  padding: "4px 10px",
                  backgroundColor: type.color,
                  borderRadius: "4px",
                  fontSize: "12px",
                  display: "inline-block",
                  marginBottom: "12px",
                  fontWeight: "500"
                }}>
                  {type.icon} {type.label}
                </div>

                {/* Titre */}
                <h3 style={{ 
                  margin: "0 0 10px 0", 
                  fontSize: "18px",
                  color: "#333"
                }}>
                  {announcement.title}
                </h3>

                {/* Aperçu du message */}
                <p style={{ 
                  margin: "0 0 12px 0", 
                  color: "#666",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  {announcement.message.length > 150 
                    ? announcement.message.substring(0, 150) + "..." 
                    : announcement.message
                  }
                </p>

                {/* Date */}
                <div style={{ 
                  fontSize: "12px", 
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  🕒 {announcement.created_at 
                    ? new Date(announcement.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : "-"
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de détail */}
      {selectedAnnouncement && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "700px",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge de type */}
            <div style={{
              padding: "6px 12px",
              backgroundColor: getAnnouncementType(selectedAnnouncement).color,
              borderRadius: "4px",
              fontSize: "13px",
              display: "inline-block",
              marginBottom: "15px",
              fontWeight: "500"
            }}>
              {getAnnouncementType(selectedAnnouncement).icon} {getAnnouncementType(selectedAnnouncement).label}
            </div>

            {/* Titre */}
            <h2 style={{ 
              margin: "0 0 15px 0",
              color: "#333"
            }}>
              {selectedAnnouncement.title}
            </h2>

            {/* Date */}
            <div style={{ 
              fontSize: "13px", 
              color: "#999",
              marginBottom: "20px",
              paddingBottom: "15px",
              borderBottom: "1px solid #e0e0e0"
            }}>
              Publié le {selectedAnnouncement.created_at 
                ? new Date(selectedAnnouncement.created_at).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })
                : "-"
              }
            </div>

            {/* Message complet */}
            <div style={{
              fontSize: "15px",
              lineHeight: "1.7",
              color: "#333",
              whiteSpace: "pre-wrap",
              marginBottom: "20px"
            }}>
              {selectedAnnouncement.message}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedAnnouncement(null)}
              style={{
                padding: "10px 24px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}