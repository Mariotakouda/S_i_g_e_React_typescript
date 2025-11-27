// src/modules/managers/edit.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getManager, updateManager } from "./service";

export default function ManagerEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    getManager(Number(id)).then((data) => setForm(data));
  }, []);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    await updateManager(Number(id), form);
    nav("/admin/managers");
  }

  return (
    <div>
      <h1>Modifier Manager #{id}</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name || ""} onChange={handleChange} required />
        <input name="email" value={form.email || ""} onChange={handleChange} required />
        <input name="phone" value={form.phone || ""} onChange={handleChange} />
        <input name="department_id" value={form.department_id || ""} onChange={handleChange} />

        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}
