// src/modules/managers/list.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchManagers, deleteManager } from "./service";
import type { Manager } from "./model";

export default function ManagerList() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  async function load() {
    const data = await fetchManagers(search, page);
    setManagers(data.data);
    setMeta(data.meta);
  }

  useEffect(() => {
    load();
  }, [search, page]);

  async function handleDelete(id: number) {
    if (confirm("Voulez-vous vraiment supprimer ce manager ?")) {
      await deleteManager(id);
      load();
    }
  }

  return (
    <div>
      <h1>Liste des managers</h1>

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
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Département</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {managers.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>{m.department_id}</td>
              <td>
                <Link to={`${m.id}`}>Voir</Link> |{" "}
                <Link to={`${m.id}/edit`}>Modifier</Link> |{" "}
                <button onClick={() => handleDelete(m.id)}>Supprimer</button>
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
          <button
            disabled={page >= meta.last_page}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
