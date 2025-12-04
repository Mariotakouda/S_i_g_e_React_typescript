// src/modules/roles/create.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RoleService } from "./service";
import type { RolePayload } from "./model";

interface FormErrors {
  name?: string[];
}

export default function RoleCreate() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError(null);

    try {
      const payload: RolePayload = { name };
      await RoleService.create(payload);
      alert("Rôle créé avec succès !");
      navigate("/admin/roles");
    } catch (err: any) {
      console.error("Erreur de création:", err.response);
      // Gère les erreurs de validation 422 avec la clé 'erreurs' de Laravel
      if (err.response?.status === 422 && err.response.data?.erreurs) {
        setErrors(err.response.data.erreurs as FormErrors);
      } else {
        const errorMsg = err.response?.data?.message || "Erreur lors de la création du rôle.";
        setGeneralError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Créer un Nouveau Rôle</h2>
      {generalError && (
        <div style={{ color: 'red', marginBottom: '15px' }}>{generalError}</div>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label htmlFor="name">Nom du Rôle</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{ border: errors.name ? '1px solid red' : '1px solid #ccc', padding: '10px', width: '100%' }}
          />
          {errors.name && <p style={{ color: 'red', fontSize: '14px' }}>{errors.name.join(', ')}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer le Rôle'}
          </button>
          <Link to="/admin/roles"><button type="button" className="btn btn-danger" disabled={loading}>Annuler</button></Link>
        </div>
      </form>
    </div>
  );
}