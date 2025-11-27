// src/modules/announcements/show.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnnouncement } from "./service";
import type { Announcement } from "./model";

export default function AnnouncementShow() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    getAnnouncement(Number(id)).then(setAnnouncement);
  }, []);

  if (!announcement) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Détails de l'annonce #{id}</h1>
      <p><b>ID Employé :</b> {announcement.employee_id || "-"}</p>
      <p><b>Titre :</b> {announcement.title}</p>
      <p><b>Message :</b> {announcement.message}</p>
      <Link to="/admin/announcements">Retour</Link>
    </div>
  );
}
