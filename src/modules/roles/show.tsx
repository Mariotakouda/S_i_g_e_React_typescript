// src/modules/roles/show.tsx

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { RoleService } from "./service";
import type { Role } from "./model";

export default function RoleShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await RoleService.get(Number(id));
      setRole(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors du chargement des données du rôle.";
      setError(errorMsg);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!role) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) return;

    setLoading(true); 
    try {
      await RoleService.remove(role.id);
      alert("Rôle supprimé avec succès !");
      navigate("/admin/roles");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Impossible de supprimer le rôle.";
      alert(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Chargement des détails du rôle...</div>;
  }

  if (error || !role) {
    return (
      <div style={{ padding: 20 }}>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <p>Rôle non trouvé.</p>
        <Link to="/admin/roles"><button>← Retour à la liste</button></Link>
      </div>
    );
  }

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Détails du rôle : {role.name}</h2>
      <div style={{ border: '1px solid #ddd', padding: 20, maxWidth: 600, marginBottom: 20 }}>
        <p><strong>ID :</strong> <span>{role.id}</span></p>
        <p><strong>Nom :</strong> <span>{role.name}</span></p>
        {/* CORRECTION DE L'AFFICHAGE : utilise 'employees_count' qui vient du backend corrigé */}
        <p><strong>Employés associés :</strong> <span>{role.employees_count ?? 0}</span></p> 
        <p><strong>Créé le :</strong> <span>{formatDateTime(role.created_at)}</span></p>
        <p><strong>Modifié le :</strong> <span>{formatDateTime(role.updated_at)}</span></p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link to="/admin/roles"><button>← Retour à la liste</button></Link>
        <Link to={`/admin/roles/${role.id}/edit`}><button>✏️ Modifier</button></Link>
        <button onClick={handleDelete} disabled={loading}>
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}