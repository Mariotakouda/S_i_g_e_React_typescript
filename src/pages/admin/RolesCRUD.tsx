import { CrudManager } from "../../components/crud/CrudManager";
import { useRoles } from "../../hooks/admin/useRoles";

export default function RolesCRUD() {
  const { data, loading, create, update, remove } = useRoles();

  return (
    <CrudManager
      title="Rôles"
      items={data}
      loading={loading}
      fields={[
        { key: "name", label: "Nom du rôle" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
