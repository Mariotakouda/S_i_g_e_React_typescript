// src/modules/leave_requests/list.tsx (Réécrit pour afficher le nom)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLeaveRequests, deleteLeaveRequest } from "./service";
import type { LeaveRequest } from "./model";

export default function LeaveRequestList() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  async function load() {
    // 💡 La fonction fetchLeaveRequests doit retourner les données de congé incluant l'objet employee (nom).
    try {
        const data = await fetchLeaveRequests(search, page);
        setLeaves(data.data);
        setMeta(data.meta);
    } catch (error) {
        console.error("Erreur lors du chargement des demandes:", error);
        // Gérer l'erreur si nécessaire
    }
  }

  useEffect(() => {
    load();
  }, [search, page]);

  async function handleDelete(id: number) {
    if (confirm("Supprimer cette demande de congé ?")) {
      await deleteLeaveRequest(id);
      load();
    }
  }

  // Fonction utilitaire pour obtenir le nom complet
  const getEmployeeName = (leave: LeaveRequest): string => {
    if (leave.employee) {
      // Si l'objet employee est disponible
      return `${leave.employee.first_name} ${leave.employee.last_name || ''}`;
    }
    // Afficher l'ID si l'objet employee est manquant (solution de repli)
    return `ID: ${leave.employee_id}`;
  };

  return (
    <div>
      <h1>Demandes de congé</h1>

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
            <th>Employé</th> {/* 🎯 Titre mis à jour : "Employé" au lieu de "ID Employé" */}
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              {/* 🎯 Affichage du nom complet de l'employé */}
              <td>{getEmployeeName(l)}</td> 
              <td>{l.type}</td>
              <td>{l.start_date}</td>
              <td>{l.end_date}</td>
              <td>{l.status}</td>
              <td>
                <Link to={`${l.id}`}>Voir</Link> |
                <Link to={`${l.id}/edit`}>Modifier</Link> |
                <button onClick={() => handleDelete(l.id)}>Supprimer</button>
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