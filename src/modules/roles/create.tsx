// src/modules/roles/create.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleService } from "./service";

export default function RoleCreate() {
 const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // NOUVEAU: État de chargement

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Démarrer le chargement
    try {
      await RoleService.create({ name });
      navigate("/admin/roles");
    } catch (error) {
        console.error("Erreur de création de rôle:", error);
        alert("Une erreur est survenue lors de la création du rôle.");
    } finally {
        setLoading(false); // Arrêter le chargement
    }
  };

  return (
    <div>
      <h2>Nouveau rôle</h2>

      <form onSubmit={submit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Nom</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
}