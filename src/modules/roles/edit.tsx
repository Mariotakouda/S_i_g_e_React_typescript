// src/modules/roles/edit.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RoleService } from "./service";

export default function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [loadingForm, setLoadingForm] = useState(false); // NOUVEAU: Chargement du formulaire
  const [loadingData, setLoadingData] = useState(true); // NOUVEAU: Chargement des données initiales

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoadingData(true);
    try {
      const data = await RoleService.get(Number(id));
      setName(data.name);
    } catch (error) {
      console.error("Erreur de chargement du rôle:", error);
      alert("Erreur lors du chargement des données du rôle.");
    } finally {
      setLoadingData(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true); // Démarrer le chargement
    try {
      await RoleService.update(Number(id), { name });
      navigate("/admin/roles");
    } catch (error) {
        console.error("Erreur de mise à jour du rôle:", error);
        alert("Une erreur est survenue lors de la mise à jour du rôle.");
    } finally {
      setLoadingForm(false); // Arrêter le chargement
    }
  };

  if (loadingData) return <p>Chargement des données du rôle...</p>;

  return (
    <div>
      <h2>Modifier le rôle</h2>

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

        <button type="submit" disabled={loadingForm} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loadingForm ? 'not-allowed' : 'pointer' }}>
          {loadingForm ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}