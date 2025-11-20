import { CrudManager } from "../../components/crud/CrudManager";
import { useLeaveRequests } from "../../hooks/admin/useLeaveRequests";

export default function LeaveRequestsCRUD() {
  const { data, loading, create, update, remove } = useLeaveRequests();

  return (
    <CrudManager
      title="Demandes de congés"
      items={data}
      loading={loading}
      fields={[
        { key: "type", label: "Type" },
        { key: "start_date", label: "Début" },
        { key: "end_date", label: "Fin" },
        { key: "status", label: "Statut" },
        { key: "message", label: "Message" },
        { key: "employee_id", label: "Employé ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
