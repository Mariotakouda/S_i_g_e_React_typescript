import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; 
import { fetchManagers, deleteManager } from "./service";
import type { Manager } from "./model";

export default function ManagerList() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const loadManagers = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const data = await fetchManagers(page, search);
      // 🎯 Correction : Assurer que managers est toujours un tableau
      setManagers(data.data || []); 
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setError("");
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err);
      setError("Impossible de charger la liste des managers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagers(currentPage, searchQuery);
  }, [currentPage, searchQuery, loadManagers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Retour à la première page pour la recherche
    loadManagers(1, searchQuery);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce manager ?")) {
      setIsDeleting(id);
      try {
        await deleteManager(id);
        alert("✅ Manager supprimé avec succès !");
        loadManagers(currentPage, searchQuery); // Recharger la liste
      } catch (err: any) {
        console.error("❌ Erreur suppression:", err);
        setError("Erreur lors de la suppression du manager.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (loading && managers.length === 0) {
    return <div style={{ padding: "20px" }}>Chargement de la liste...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Liste des Managers ({lastPage > 0 ? lastPage : '0'} pages)</h1>
        <Link to="/admin/managers/create"
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "600",
          }}
        >
          ➕ Créer un Manager
        </Link>
      </div>

      {error && (
        <div style={{ padding: "12px", marginBottom: "20px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "4px", color: "#c33" }}>
          {error}
        </div>
      )}

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Rechercher par nom, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flexGrow: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <button type="submit" style={{ padding: "10px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          🔍 Chercher
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Employé (Email)</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Département</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.length > 0 ? (
            managers.map((manager) => (
              <tr key={manager.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <Link to={`/admin/managers/${manager.id}`} style={{ color: "#007bff", textDecoration: "none" }}>
                    {manager.employee.first_name} {manager.employee.last_name}
                  </Link>
                  <br />
                  <span style={{ fontSize: "12px", color: "#666" }}>({manager.employee.email})</span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {manager.department ? manager.department.name : "Non assigné"}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center", display: "flex", gap: "5px", justifyContent: "center" }}>
                  <Link to={`/admin/managers/${manager.id}/edit`}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffc107",
                      color: "black",
                      textDecoration: "none",
                      borderRadius: "3px",
                      fontSize: "12px",
                    }}
                  >
                    ✏️ Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(manager.id)}
                    disabled={isDeleting === manager.id}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "12px",
                      opacity: isDeleting === manager.id ? 0.6 : 1,
                    }}
                  >
                    {isDeleting === manager.id ? "Suppression..." : "🗑️ Supprimer"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                Aucun manager trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {lastPage > 1 && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            style={{ padding: "8px 15px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
          >
            Précédent
          </button>
          <span style={{ padding: "8px 15px" }}>
            Page {currentPage} sur {lastPage}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
            disabled={currentPage === lastPage || loading}
            style={{ padding: "8px 15px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}