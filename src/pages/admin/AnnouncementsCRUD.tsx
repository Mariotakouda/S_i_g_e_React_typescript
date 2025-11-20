import { CrudManager } from "../../components/crud/CrudManager";
import { useAnnouncements } from "../../hooks/admin/useAnnouncements";

export default function AnnouncementsCRUD() {
  const { data, loading, create, update, remove } = useAnnouncements();

  return (
    <CrudManager
      title="Annonces"
      items={data}
      loading={loading}
      fields={[
        { key: "title", label: "Titre" },
        { key: "message", label: "Message" },
        { key: "employee_id", label: "Employé ID" },
      ]}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
