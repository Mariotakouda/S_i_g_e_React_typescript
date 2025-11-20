import { CrudManager } from "../../components/crud/CrudManager";
import { useEmployees } from "../../hooks/admin/useEmployees";

export default function EmployeesCRUD() {
  const { data, loading, create, update, remove } = useEmployees();

  return (
    <CrudManager
      title="Employés"
      items={data}
      loading={loading}
      fields={[
        { key: "first_name", label: "Prénom" },
        { key: "last_name", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Téléphone" },
        { key: "contract_type", label: "Contrat" },
        { key: "salary_base", label: "Salaire" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
