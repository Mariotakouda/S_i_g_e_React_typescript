// src/modules/departments/list.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // 👈 Importer useLocation
import { DepartmentService } from "./service";
import type { Department } from "./model";

export default function DepartmentList() {
  const location = useLocation(); // 👈 Initialiser useLocation
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // 👈 Utilisé pour forcer le rechargement après suppression

  // On encapsule la fonction load dans un useCallback si on veut l'ajouter comme dépendance,
  // ou on la laisse telle quelle et on l'appelle dans les effets
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📤 Chargement des départements...", { page, search });
      
      const res = await DepartmentService.list(page, search);
      console.log("✅ Départements reçus:", res);
      
      setDepartments(res.data || []);
      setMeta(res.meta || {});
    } catch (err: any) {
      console.error("❌ Erreur chargement départements:", err);
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, reloadKey]); // L'effet se déclenche lors du changement de page ou de reloadKey

  useEffect(() => {
    // Vérifier l'état passé par la navigation (e.g., depuis la page de création/édition)
    if (location.state && (location.state as any).refresh) {
      console.log("🔄 Rafraîchissement forcé par état de navigation.");
      // Réinitialiser la pagination et recharger
      if (page !== 1) {
        setPage(1); // Force le useEffect ci-dessus à recharger
      } else {
        load(); // Recharger immédiatement si on est déjà sur la page 1
      }
      
      // OPTIONNEL: Si vous souhaitez supprimer l'état après le rechargement :
      // window.history.replaceState({}, document.title, location.pathname); 
    }
  }, [location.state]); // 👈 NOUVEL EFFET POUR LE RECHARGEMENT POST-CRÉATION

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const remove = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return;
    
    try {
      await DepartmentService.remove(id);
      alert("Département supprimé avec succès !");
      setReloadKey(prev => prev + 1); // 👈 Déclenche le rechargement via reloadKey
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // ... (le reste du composant, inchangé)

  return (
    <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* En-tête */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px" 
      }}>
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
          🏢 Départements
        </h2>
        <Link 
          to="/admin/departments/create"
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          + Nouveau département
        </Link>
      </div>

      {/* Barre de recherche */}
      <form 
        onSubmit={handleSearch}
        style={{ 
          marginBottom: "20px",
          display: "flex",
          gap: "10px"
        }}
      >
        <input
          type="text"
          placeholder="Rechercher un département..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px"
          }}
        />
        <button 
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          🔍 Rechercher
        </button>
      </form>

      {/* Erreur */}
      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "8px",
          color: "#c00",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Chargement des départements...</p>
        </div>
      ) : (
        <>
          {/* Tableau */}
          <div style={{ 
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse" 
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                    ID
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                    Nom
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                    Manager
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                    Description
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", color: "#374151" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      padding: "40px", 
                      textAlign: "center",
                      color: "#6b7280"
                    }}>
                      Aucun département trouvé
                    </td>
                  </tr>
                ) : (
                  departments.map((d) => (
                    <tr 
                      key={d.id}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
                      <td style={{ padding: "16px" }}>{d.id}</td>
                      <td style={{ padding: "16px", fontWeight: "500" }}>{d.name}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>
                        {d.manager ? (
                          <span>
                            {d.manager.first_name} {d.manager.last_name}
                          </span>
                        ) : (
                          <span style={{ fontStyle: "italic", color: "#9ca3af" }}>
                            Aucun manager
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>
                        {d.description || "—"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <Link 
                            to={`/admin/departments/${d.id}`}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#10b981",
                              color: "white",
                              textDecoration: "none",
                              borderRadius: "5px",
                              fontSize: "14px"
                            }}
                          >
                            👁️ Voir
                          </Link>
                          <Link 
                            to={`/admin/departments/${d.id}/edit`}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#f59e0b",
                              color: "white",
                              textDecoration: "none",
                              borderRadius: "5px",
                              fontSize: "14px"
                            }}
                          >
                            ✏️ Modifier
                          </Link>
                          <button 
                            onClick={() => remove(d.id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontSize: "14px"
                            }}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div style={{ 
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px"
            }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={!meta.prev_page_url}
                style={{
                  padding: "8px 16px",
                  backgroundColor: meta.prev_page_url ? "#6366f1" : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: meta.prev_page_url ? "pointer" : "not-allowed"
                }}
              >
                ← Précédent
              </button>

              <span style={{ color: "#374151", fontWeight: "500" }}>
                Page {meta.current_page || 1} / {meta.last_page || 1}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!meta.next_page_url}
                style={{
                  padding: "8px 16px",
                  backgroundColor: meta.next_page_url ? "#6366f1" : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: meta.next_page_url ? "pointer" : "not-allowed"
                }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}