import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createAnnouncement, checkManagerStatus } from "./service";
import { api } from "../../api/axios"; // Pour charger les départements

export default function AnnouncementCreate() {
  const navigate = useNavigate();
  const { user,} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "", // Changé 'content' en 'message' pour matcher votre service
    department_id: null as number | null
  });

  const [managerInfo, setManagerInfo] = useState<{is_manager: boolean, dept_id: number | null, dept_name: string}>({
    is_manager: false,
    dept_id: null,
    dept_name: ""
  });

  useEffect(() => {
    async function init() {
      try {
        const status = await checkManagerStatus();
        if (status.is_manager) {
          setManagerInfo({
            is_manager: true,
            dept_id: status.department_id,
            dept_name: status.department_name || ""
          });
          setFormData(prev => ({ ...prev, department_id: status.department_id }));
        }

        if (user?.role === 'admin') {
          const res = await api.get("/departments"); // Route typique pour lister les depts
          setDepartments(res.data);
        }
      } catch (err) {
        console.error("Erreur d'initialisation", err);
      }
    }
    init();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAnnouncement({
        title: formData.title,
        message: formData.message,
        department_id: formData.department_id,
        is_general: formData.department_id === null
      });
      
      alert("Annonce publiée !");
      navigate(user?.role === 'admin' ? "/admin/announcements" : "/employee/announcements");
    } catch (error) {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#2e2a5b", marginBottom: "20px" }}>📢 Créer une communication</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Titre</label>
          <input
            required
            style={inputStyle}
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Destinataires</label>
          {managerInfo.is_manager ? (
            <div style={managerBadgeStyle}>
              Diffusion limitée à : <strong>{managerInfo.dept_name}</strong>
            </div>
          ) : (
            <select 
              style={inputStyle}
              value={formData.department_id || ""}
              onChange={e => setFormData({...formData, department_id: e.target.value ? Number(e.target.value) : null})}
            >
              <option value="">Tous les départements (Général)</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Message</label>
          <textarea
            required
            rows={5}
            style={{...inputStyle, resize: "vertical"}}
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} style={submitButtonStyle}>
          {loading ? "Envoi..." : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
}

// Styles
const containerStyle = { backgroundColor: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e2e8f0" };
const fieldStyle = { marginBottom: "15px" };
const labelStyle = { display: "block", marginBottom: "5px", fontWeight: "600" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" };
const managerBadgeStyle = { padding: "10px", backgroundColor: "#f0fdf4", color: "#16a34a", borderRadius: "6px", fontSize: "14px" };
const submitButtonStyle = { width: "100%", padding: "12px", backgroundColor: "#2e2a5b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" };