import { CrudManager } from "../../components/crud/CrudManager";
import { useTasks } from "../../hooks/admin/useTasks";

export default function TasksCRUD() {
  const { data, loading, create, update, remove } = useTasks();

  return (
    <CrudManager
      title="Tâches"
      items={data}
      loading={loading}
      fields={[
        { key: "title", label: "Titre" },
        { key: "description", label: "Description" },
        { key: "status", label: "Statut" },
        { key: "due_date", label: "Date limite" },
        { key: "employee_id", label: "Employé ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
