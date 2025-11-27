// src/modules/roles/list.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RoleService } from "./service";
import type { Role } from "./model";

// Définition de l'interface Meta pour améliorer la sûreté du typage
interface PaginationMeta {
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

export default function RoleList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Initialiser meta avec des valeurs par défaut sécurisées
  const [meta, setMeta] = useState<PaginationMeta>({ 
    current_page: 1, 
    last_page: 1, 
    prev_page_url: null, 
    next_page_url: null 
  });
  const [loading, setLoading] = useState(false);

  // Utilisation de useCallback pour stabiliser la fonction de chargement
  const load = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    try {
      const res = await RoleService.list(currentPage, currentSearch);
      // ✅ VÉRIFICATION CRITIQUE 1: Assurez-vous que res.data et res.meta existent
      if (res.data && res.meta) {
        setRoles(res.data);
        setMeta(res.meta as PaginationMeta);
      } else {
        // Gérer le cas où la structure de la réponse API est inattendue
        setRoles([]);
        setMeta({ current_page: 1, last_page: 1, prev_page_url: null, next_page_url: null });
        console.error("Structure de réponse API inattendue lors du chargement des rôles.");
      }
    } catch (error) {
        console.error("❌ Erreur de chargement des rôles:", error);
        // Afficher un message d'erreur si le chargement échoue
        alert("Impossible de charger la liste des rôles. Vérifiez l'API.");
    } finally {
        setLoading(false);
    }
  }, []); // La dépendance est vide car currentPage et currentSearch sont passés en arguments

  useEffect(() => {
    // ✅ VÉRIFICATION CRITIQUE 2: Déclencher le chargement lorsque page ou search change
    load(page, search);
  }, [page, search, load]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (page !== 1) {
      setPage(1); // Déclencher useEffect
    } else {
      // Si la page est déjà 1, le changement de 'search' seul ne déclenche pas 'useEffect'.
      // Donc, on force le rechargement ici pour la page 1.
      load(1, search);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Supprimer ce rôle ?")) return;
    setLoading(true);
    try {
      await RoleService.remove(id);
      // Après suppression, recharger la page actuelle.
      load(page, search); 
    } catch (error) {
        console.error("Erreur de suppression:", error);
        alert("Impossible de supprimer le rôle. Il est peut-être utilisé.");
    }
  };
  
  return (
    <div style={{ padding: 20 }}>
      <h2>Liste des rôles</h2>
      
      {/* ... (Formulaire de recherche et bouton de création) ... */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <form onSubmit={handleSearch}>
              <input
                placeholder="Recherche par nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px', marginRight: '10px' }}
              />
              <button type="submit" disabled={loading} style={{ padding: '8px 15px', backgroundColor: '#ccc', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}>Rechercher</button>
          </form>

          <Link to="create">
            <button style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Nouveau rôle</button>
          </Link>
      </div>

      {/* Affichage de l'état de chargement ou de la liste */}
      {loading && roles.length === 0 ? (
          <p>Chargement des rôles en cours...</p>
      ) : roles.length === 0 ? (
          <p>Aucun rôle trouvé.</p>
      ) : (
          <>
            <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {roles.map((r) => (
                      <tr key={r.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.id}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                          <Link to={`${r.id}`} style={{ marginRight: 10, color: '#007bff', textDecoration: 'none' }}>Voir</Link> |
                          <Link to={`${r.id}/edit`} style={{ margin: '0 10px', color: '#ffc107', textDecoration: 'none' }}>Modifier</Link> |
                          <button onClick={() => remove(r.id)} disabled={loading} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 10 }}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

            {/* Pagination */}
            <div style={{ marginTop: "20px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {meta.prev_page_url && (
                <button onClick={() => setPage(page - 1)} disabled={loading} style={{ padding: '8px 15px', marginRight: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>← Précédent</button>
              )}

              <span style={{ margin: "0 10px" }}>
                Page **{meta.current_page}** / **{meta.last_page}**
              </span>

              {meta.next_page_url && (
                <button onClick={() => setPage(page + 1)} disabled={loading} style={{ padding: '8px 15px', cursor: loading ? 'not-allowed' : 'pointer' }}>Suivant →</button>
              )}
            </div>
          </>
      )}
    </div>
  );
}