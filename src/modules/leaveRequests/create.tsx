// src/modules/leave_requests/create.tsx (Corrigé avec gestion d'erreur)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLeaveRequest } from "./service";
import { EmployeeService } from "../employees/service"; 
import type { Employee } from "../employees/model"; 

interface LeaveRequestForm {
  employee_id: number;
  type: string;
  start_date: string;
  end_date: string;
  message: string;
  status: string;
}

export default function LeaveRequestCreate() {
  const nav = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [form, setForm] = useState<LeaveRequestForm>({
    employee_id: 0,
    type: "",
    start_date: "",
    end_date: "",
    message: "",
    status: "pending",
  });

  useEffect(() => {
    EmployeeService.fetchAllForSelect().then(res => {
      setEmployees(res);
    }).catch(e => console.error("Erreur chargement employés:", e));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "employee_id" ? Number(value) : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (form.employee_id === 0) {
        alert("Veuillez sélectionner un employé.");
        return;
    }
    
    // 🎯 CORRECTION : Ajouter try/catch
    try {
      await createLeaveRequest(form);
      nav("/admin/leave_requests");
    } catch (error) {
      console.error("Erreur de création du congé:", error);
      // Afficher un message d'erreur plus clair à l'utilisateur
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      alert(`Échec de la création. Veuillez vérifier le formulaire. Détails: ${errorMessage}`);
    }
  }

  return (
    <div>
      <h1>Créer une demande</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="employee_id">Employé</label>
        <select 
          name="employee_id" 
          id="employee_id"
          value={form.employee_id} 
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
        
        <input name="type" placeholder="Type de congé" onChange={handleChange} required />
        <input type="date" name="start_date" onChange={handleChange} required />
        <input type="date" name="end_date" onChange={handleChange} required />
        <textarea name="message" placeholder="Message" onChange={handleChange}></textarea>

        <select name="status" onChange={handleChange} value={form.status}>
          <option value="pending">En attente</option>
          <option value="approved">Approuvé</option>
          <option value="rejected">Rejeté</option>
        </select>

        <button type="submit">Créer</button>
      </form>
    </div>
  );
}