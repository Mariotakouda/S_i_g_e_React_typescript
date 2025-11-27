// src/modules/employees/show.tsx

import { useEffect, useState } from "react";
import { EmployeeService } from "./service";
import { useParams, Link } from "react-router-dom";
import type { Employee } from "./model";

export default function EmployeeShow() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    EmployeeService.get(Number(id)).then((res) =>
      setEmployee(res.data)
    );
  }, []);

  if (!employee) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Détails de l'employé</h2>

      <p><strong>ID :</strong> {employee.id}</p>
      <p><strong>Nom :</strong> {employee.first_name} {employee.last_name}</p>
      <p><strong>Email :</strong> {employee.email}</p>
      <p><strong>Téléphone :</strong> {employee.phone}</p>
      <p><strong>Contrat :</strong> {employee.contract_type ?? "-"}</p>
      <p><strong>Date d'embauche :</strong> {employee.hire_date ?? "-"}</p>
      <p><strong>Salaire :</strong> {employee.salary_base ?? "-"}</p>
      <p><strong>Département :</strong> {employee.department_id ?? "-"}</p>

      <Link to="/admin/employees">Retour</Link>
    </div>
  );
}
