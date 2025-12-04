// src/modules/roles/list.tsx

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RoleService } from "./service";
import type { Role, LaravelPaginationResponse } from "./model";

// État initial sécurisé
const initialPaginationState: LaravelPaginationResponse<Role> = {
  current_page: 1, data: [], last_page: 1, per_page: 10, total: 0,
  first_page_url: '', last_page_url: '', next_page_url: null, prev_page_url: null,
  from: null, to: null, path: '',
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function RoleList() {
  // Un seul état pour toutes les données de pagination
  const [paginationData, setPaginationData] = useState<LaravelPaginationResponse<Role>>(initialPaginationState);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Déstructuration pour un accès facile
  const { data: roles, total, current_page, last_page, prev_page_url, next_page_url } = paginationData;

  const load = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await RoleService.list(currentPage, currentSearch);
      setPaginationData(res); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible de charger la liste des rôles.");
      // Réinitialise les données pour forcer l'affichage de l'erreur
      setPaginationData(prev => ({ ...prev, data: [] })); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); 
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const remove = async (id: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${name}" ?`)) return;
    
    setLoading(true);
    try {
      await RoleService.remove(id);
      alert("Rôle supprimé avec succès !");
      load(page, search); // Recharger la page actuelle
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Impossible de supprimer le rôle.";
      alert(errorMsg);
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: 20 }}>
      <h2>Liste des rôles ({total} trouvés)</h2>
      
      {/* Formulaire de recherche et Création */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input placeholder="Recherche par nom..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ padding: '8px', width: '250px' }}/>
          <button type="submit" disabled={loading}> Rechercher </button>
          {search && <button type="button" onClick={handleClearSearch} disabled={loading}> Réinitialiser </button>}
        </form>
        <Link to="create"><button style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}> + Nouveau rôle </button></Link>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      {/* Affichage de l'état de chargement ou de la liste */}
      {loading && roles.length === 0 ? (
        <p>Chargement des rôles en cours... 

[Image of a data loading indicator]
</p>
      ) : roles.length === 0 && !loading ? (
        <p>Aucun rôle trouvé{search ? ` pour "${search}"` : ''}.</p>
      ) : (
        <>
          <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>ID</th>
                <th>Nom</th>
                <th>Employés</th>
                <th>Créé le</th>
                <th style={{ textAlign: 'center', width: '250px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.employees_count ?? 0}</td>
                  <td>{formatDate(r.created_at)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Link to={`${r.id}`}>Voir</Link> | 
                    <Link to={`${r.id}/edit`}>Modifier</Link> | 
                    <button className="btn btn-danger" onClick={() => remove(r.id, r.name)} disabled={loading}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {last_page > 1 && (
            <div style={{ marginTop: "20px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setPage(page - 1)} disabled={loading || !prev_page_url || current_page === 1}> ← Précédent </button>
              <span style={{ margin: "0 10px", fontWeight: 'bold' }}>Page {current_page} / {last_page}</span>
              <button onClick={() => setPage(page + 1)} disabled={loading || !next_page_url || current_page === last_page}> Suivant → </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}