import { CrudManager } from "../../components/crud/CrudManager";
import { useDepartments } from "../../hooks/admin/useDepartments";

export default function DepartmentsCRUD() {
  const { data, loading, create, update, remove } = useDepartments();

  return (
    <CrudManager
      title="Départements"
      items={data}
      loading={loading}
      fields={[
        { key: "name", label: "Nom" },
        { key: "description", label: "Description" },
        { key: "manager_id", label: "Manager ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
