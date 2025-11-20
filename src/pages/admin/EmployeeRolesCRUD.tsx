import { CrudManager } from "../../components/crud/CrudManager";
import { useEmployeeRoles } from "../../hooks/admin/useEmployeeRoles";

export default function EmployeeRolesCRUD() {
  const { data, loading, create, update, remove } = useEmployeeRoles();

  return (
    <CrudManager
      title="Rôles des employés"
      items={data}
      loading={loading}
      fields={[
        { key: "employee_id", label: "Employé ID" },
        { key: "role_id", label: "Rôle ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
