// src/modules/announcements/list.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnnouncements, deleteAnnouncement } from "./service";
import type { Announcement } from "./model";

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  async function load() {
    const data = await fetchAnnouncements(search, page);
    setAnnouncements(data.data);
    setMeta(data.meta);
  }

  useEffect(() => {
    load();
  }, [search, page]);

  async function handleDelete(id: number) {
    if (confirm("Supprimer cette annonce ?")) {
      await deleteAnnouncement(id);
      load();
    }
  }

  return (
    <div>
      <h1>Annonces</h1>

      <div>
        <input
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="create">Ajouter</Link>
      </div>

      <table border={1} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Employé</th>
            <th>Titre</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.employee_id || "-"}</td>
              <td>{a.title}</td>
              <td>{a.message}</td>
              <td>
                <Link to={`${a.id}`}>Voir</Link> |
                <Link to={`${a.id}/edit`}>Modifier</Link> |
                <button onClick={() => handleDelete(a.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && (
        <div>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </button>
          <span> Page {meta.current_page} / {meta.last_page} </span>
          <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
