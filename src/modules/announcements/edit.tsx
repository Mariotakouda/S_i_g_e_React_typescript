// src/modules/announcements/edit.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAnnouncement, updateAnnouncement } from "./service";

export default function AnnouncementEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    getAnnouncement(Number(id)).then(setForm);
  }, []);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    await updateAnnouncement(Number(id), form);
    nav("/admin/announcements");
  }

  return (
    <div>
      <h1>Modifier annonce #{id}</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="employee_id"
          value={form.employee_id || ""}
          onChange={handleChange}
        />
        <input
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          value={form.message || ""}
          onChange={handleChange}
          required
        />
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}
