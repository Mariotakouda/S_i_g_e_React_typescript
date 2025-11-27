// src/modules/leave_requests/edit.tsx (Mise à jour)

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLeaveRequest, updateLeaveRequest } from "./service";
import { EmployeeService } from "../employees/service"; // 1. Importez le service
import type { Employee } from "../employees/model"; 

export default function LeaveRequestEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<any>({});
  const [employees, setEmployees] = useState<Employee[]>([]); // État pour les employés

  useEffect(() => {
    // 2. Charger les employés et la demande de congé
    Promise.all([
        getLeaveRequest(Number(id)),
        EmployeeService.fetchAllForSelect()
    ]).then(([leaveData, employeesData]) => {
        setForm({ 
            ...leaveData,
            // S'assurer que employee_id est un nombre pour le select
            employee_id: Number(leaveData.employee_id) 
        });
        setEmployees(employeesData);
    }).catch(e => console.error("Erreur chargement édition:", e));
  }, [id]);

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm({ 
        ...form, 
        [name]: name === "employee_id" ? Number(value) : value 
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    await updateLeaveRequest(Number(id), form);
    nav("/admin/leave_requests");
  }

  if (!form.id) return <p>Chargement...</p>; 

  return (
    <div>
      <h1>Modifier demande #{id}</h1>

      <form onSubmit={handleSubmit}>
        {/* 3. Utiliser le select pour l'employé */}
        <label htmlFor="employee_id_edit">Employé</label>
        <select 
            name="employee_id" 
            id="employee_id_edit"
            value={form.employee_id || 0} 
            onChange={handleChange} 
            required
        >
            <option value={0} disabled>Sélectionnez un employé</option>
            {employees.map(e => (
                <option key={e.id} value={e.id}>
                    {`${e.first_name} ${e.last_name || ''}`}
                </option>
            ))}
        </select>
        
        {/* Correction pour les dates : les API retournent souvent des timestamps, mais les inputs de date nécessitent le format YYYY-MM-DD */}
        <input name="type" value={form.type || ""} onChange={handleChange} required />
        <input type="date" name="start_date" value={form.start_date?.split("T")[0] || ""} onChange={handleChange} /> 
        <input type="date" name="end_date" value={form.end_date?.split("T")[0] || ""} onChange={handleChange} />

        {/* ... le reste du formulaire inchangé ... */}
        <textarea
          name="message"
          value={form.message || ""}
          onChange={handleChange}
        ></textarea>

        <select name="status" value={form.status || "pending"} onChange={handleChange}>
          <option value="pending">En attente</option>
          <option value="approved">Approuvé</option>
          <option value="rejected">Rejeté</option>
        </select>

        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}