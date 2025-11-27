// src/modules/roles/show.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RoleService } from "./service";
import type { Role } from "./model";

export default function RoleShow() {
  const { id } = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true); // NOUVEAU: État de chargement

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await RoleService.get(Number(id));
      setRole(data);
    } catch (error) {
        console.error("Erreur de chargement des détails du rôle:", error);
        setRole(null); // Afficher 'Rôle non trouvé' si erreur
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <p>Chargement des détails du rôle...</p>;
  if (!role) return <p>Rôle non trouvé. <Link to="/admin/roles">Retour à la liste</Link></p>;

  return (
    <div>
      <h2>Détails du rôle : **{role.name}**</h2>

      <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 5, maxWidth: 600, marginBottom: 20 }}>
        <p><strong>ID :</strong> {role.id}</p>
        <p><strong>Nom :</strong> {role.name}</p>
        <p><strong>Créé le :</strong> {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}</p>
      </div>

      <Link to="/admin/roles" style={{ color: '#007bff', textDecoration: 'none' }}>← Retour à la liste</Link>
    </div>
  );
}