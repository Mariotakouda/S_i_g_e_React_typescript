import { CrudManager } from "../../components/crud/CrudManager";
import { usePresences } from "../../hooks/admin/usePresences";

export default function PresencesCRUD() {
  const { data, loading, create, update, remove } = usePresences();

  return (
    <CrudManager
      title="Présences"
      items={data}
      loading={loading}
      fields={[
        { key: "date", label: "Date" },
        { key: "check_in", label: "Arrivée" },
        { key: "check_out", label: "Départ" },
        { key: "total_hours", label: "Heures totales" },
        { key: "employee_id", label: "Employé ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
