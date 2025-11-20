import { useState } from "react";

interface BaseEntity {
  id: number;
}

interface CrudField<T> {
  key: keyof T;
  label: string;
}

interface CrudProps<T extends BaseEntity> {
  title: string;
  items: T[];
  loading: boolean;
  fields: CrudField<T>[];
  onCreate: (item: Partial<T>) => Promise<any>;
  onUpdate: (id: number, item: Partial<T>) => Promise<any>;
  onDelete: (id: number) => Promise<void>;
}

export function CrudManager<T extends BaseEntity>({
  title,
  items,
  loading,
  fields,
  onCreate,
  onUpdate,
  onDelete,
}: CrudProps<T>) {
  const [newItem, setNewItem] = useState<Partial<T>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<T>>({});

  if (loading) return <p>Chargement...</p>;

  const startEditing = (item: T) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const submitEdit = async (id: number) => {
    await onUpdate(id, editValues);
    setEditingId(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{title}</h2>

      {/* FORMULAIRE AJOUT */}
      <form
        onSubmit={async e => {
          e.preventDefault();
          await onCreate(newItem);
          setNewItem({});
        }}
        style={{ marginBottom: "20px" }}
      >
        {fields.map(f => (
          <input
            key={String(f.key)}
            placeholder={f.label}
            value={(newItem[f.key] as any) || ""}
            onChange={e =>
              setNewItem({ ...newItem, [f.key]: e.target.value })
            }
            style={{ marginRight: "10px" }}
          />
        ))}
        <button type="submit">Ajouter</button>
      </form>

      <ul>
        {items.map(item => (
          <li key={item.id} style={{ marginBottom: "10px" }}>
            {editingId === item.id ? (
              <div>
                {fields.map(f => (
                  <input
                    key={String(f.key)}
                    value={(editValues[f.key] as any) || ""}
                    onChange={e =>
                      setEditValues({
                        ...editValues,
                        [f.key]: e.target.value,
                      })
                    }
                    style={{ marginRight: "10px" }}
                  />
                ))}

                <button onClick={() => submitEdit(item.id)}>OK</button>
                <button onClick={() => setEditingId(null)}>Annuler</button>
              </div>
            ) : (
              <div>
                {fields.map(f => (
                  <span key={String(f.key)} style={{ marginRight: "10px" }}>
                    {String(item[f.key])}
                  </span>
                ))}

                <button onClick={() => startEditing(item)}>Modifier</button>
                <button onClick={() => onDelete(item.id)}>Supprimer</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
