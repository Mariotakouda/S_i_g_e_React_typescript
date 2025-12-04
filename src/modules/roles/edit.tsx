// src/modules/roles/edit.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { RoleService } from "./service";
import type { RolePayload } from "./model";

interface FormErrors {
  name?: string[];
}

export default function RoleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialName, setInitialName] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRole(Number(id));
    }
  }, [id]);

  const loadRole = async (roleId: number) => {
    setLoading(true);
    setGeneralError(null);
    try {
      const data = await RoleService.get(roleId);
      setInitialName(data.name); 
      setName(data.name); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors du chargement des données du rôle.";
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      const payload: RolePayload = { name };
      await RoleService.update(Number(id), payload);
      alert(`Rôle "${name}" mis à jour avec succès !`);
      navigate(`/admin/roles/${id}`);
    } catch (err: any) {
      console.error("Erreur de mise à jour:", err.response);
      if (err.response?.status === 422 && err.response.data?.erreurs) {
        setErrors(err.response.data.erreurs as FormErrors);
      } else {
        const errorMsg = err.response?.data?.message || "Erreur lors de la mise à jour du rôle.";
        setGeneralError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Chargement des données du rôle...</div>;
  }

  if (generalError || !initialName) {
    return (
      <div style={{ padding: 20 }}>
        {generalError && <div style={{ color: 'red', marginBottom: '15px' }}>{generalError}</div>}
        <p>Rôle non trouvé ou erreur de chargement.</p>
        <Link to="/admin/roles"><button>← Retour à la liste</button></Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Modifier le Rôle : {initialName} (ID: {id})</h2>
      {generalError && <div style={{ color: 'red', marginBottom: '15px' }}>{generalError}</div>}
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label htmlFor="name">Nom du Rôle</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            style={{ border: errors.name ? '1px solid red' : '1px solid #ccc', padding: '10px', width: '100%' }}
          />
          {errors.name && <p style={{ color: 'red', fontSize: '14px' }}>{errors.name.join(', ')}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Mise à jour...' : 'Enregistrer les Modifications'}
          </button>
          <Link to={`/admin/roles/${id}`}><button type="button" className="btn btn-danger" disabled={isSubmitting}>Annuler</button></Link>
        </div>
      </form>
    </div>
  );
}