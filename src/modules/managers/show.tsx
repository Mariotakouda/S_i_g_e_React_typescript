// src/modules/managers/show.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getManager } from "./service";
import type { Manager } from "./model";

export default function ManagerShow() {
  const { id } = useParams();
  const [manager, setManager] = useState<Manager | null>(null);

  useEffect(() => {
    getManager(Number(id)).then(setManager);
  }, []);

  if (!manager) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Détails du manager #{id}</h1>

      <p><b>Nom :</b> {manager.name}</p>
      <p><b>Email :</b> {manager.email}</p>
      <p><b>Téléphone :</b> {manager.phone}</p>
      <p><b>Département :</b> {manager.department_id}</p>

      <Link to="/admin/managers">Retour</Link>
    </div>
  );
}
