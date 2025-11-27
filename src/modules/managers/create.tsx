import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createManager } from "./service";

interface ManagerForm {
  name: string;
  email: string;
  phone: string;
  department_id: number;
}

export default function ManagerCreate() {
  const nav = useNavigate();

  const [form, setForm] = useState<ManagerForm>({
    name: "",
    email: "",
    phone: "",
    department_id: 0,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "department_id" ? Number(value) : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createManager(form);
    nav("/admin/managers");
  }

  return (
    <div>
      <h1>Créer un manager</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nom" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Téléphone" onChange={handleChange} />
        <input type="number" name="department_id" placeholder="ID département" onChange={handleChange} />

        <button type="submit">Créer</button>
      </form>
    </div>
  );
}
