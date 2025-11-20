import { CrudManager } from "../../components/crud/CrudManager";
import { useManagers } from "../../hooks/admin/useManagers";

export default function ManagersCRUD() {
  const { data, loading, create, update, remove } = useManagers();

  return (
    <CrudManager
      title="Managers"
      items={data}
      loading={loading}
      fields={[
        { key: "full_name", label: "Nom complet" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Téléphone" },
        { key: "employee_id", label: "Employé ID" },
        { key: "department_id", label: "Département ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
