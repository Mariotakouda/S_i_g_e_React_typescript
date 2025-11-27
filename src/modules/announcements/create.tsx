import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "./service";

interface AnnouncementForm {
  employee_id: number;
  title: string;
  message: string;
}

export default function AnnouncementCreate() {
  const nav = useNavigate();

  const [form, setForm] = useState<AnnouncementForm>({
    employee_id: 0,
    title: "",
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "employee_id" ? Number(value) : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createAnnouncement(form);
    nav("/admin/announcements");
  }

  return (
    <div>
      <h1>Créer une annonce</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="employee_id"
          placeholder="ID Employé (optionnel)"
          value={form.employee_id}
          onChange={handleChange}
        />
        <input
          name="title"
          placeholder="Titre"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
}
