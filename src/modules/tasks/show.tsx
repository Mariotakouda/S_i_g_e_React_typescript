import { useParams, Link } from "react-router-dom";
import { TaskService } from "./service";
import type { Task } from "./model";
import { useEffect, useState } from "react";

export default function TaskShow() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const data = await TaskService.get(Number(id));
      setTask(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "in_progress": return "En cours";
      case "completed": return "Terminée";
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5" };
      case "in_progress": return { bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" };
      case "completed": return { bg: "#F0FDF4", text: "#15803D", border: "#DCFCE7" };
      default: return { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" };
    }
  };

  // --- Icons SVG ---
  const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  const IconEdit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: '#64748b' }}>
      Chargement des détails...
    </div>
  );
  
  if (!task) return (
    <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
      Tâche non trouvée.
    </div>
  );

  const statusStyle = getStatusStyle(task.status);

  return (
    <div className="task-show-container">
      <style>{`
        .task-show-container { max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; }
        .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        
        .main-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
        .card-header { padding: 32px; border-bottom: 1px solid #f1f5f9; background: #ffffff; }
        .card-body { padding: 32px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        
        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .full-width { grid-column: span 2; }
        .label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 16px; color: #1e293b; font-weight: 500; margin: 0; }
        .description-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; color: #475569; line-height: 1.6; }

        .status-pill { display: inline-flex; align-items: center; padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: 700; border: 1px solid; }
        
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; }
        .btn-back { background: #f1f5f9; color: #475569; }
        .btn-back:hover { background: #e2e8f0; }
        .btn-edit { background: #2563eb; color: white; }
        .btn-edit:hover { background: #1d4ed8; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

        @media (max-width: 640px) {
          .card-body { grid-template-columns: 1fr; gap: 24px; padding: 24px; }
          .full-width { grid-column: span 1; }
          .card-header { padding: 24px; }
          .action-bar { flex-direction: column; align-items: stretch; }
          .btn { justify-content: center; }
        }
      `}</style>

      <div className="action-bar">
        <Link to="/admin/tasks" className="btn btn-back">
          <IconArrowLeft /> Retour à la liste
        </Link>
        <Link to={`/admin/tasks/${task.id}/edit`} className="btn btn-edit">
          <IconEdit /> Modifier la tâche
        </Link>
      </div>

      <div className="main-card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div>
              <span className="label">Tâche #{task.id}</span>
              <h1 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                {task.title}
              </h1>
            </div>
            <span className="status-pill" style={{ 
              backgroundColor: statusStyle.bg, 
              color: statusStyle.text, 
              borderColor: statusStyle.border 
            }}>
              {getStatusLabel(task.status)}
            </span>
          </div>
        </div>

        <div className="card-body">
          <div className="field-group full-width">
            <span className="label">Description</span>
            <div className="value description-box">
              {task.description || "Aucune description fournie pour cette tâche."}
            </div>
          </div>

          <div className="field-group">
            <span className="label">Assignée à</span>
            <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px', borderRadius: '8px' }}>
                <IconUser />
              </div>
              <span>
                {task.employee ? `${task.employee.first_name} ${task.employee.last_name}` : "Non assignée"}
              </span>
            </div>
          </div>

          <div className="field-group">
            <span className="label">Date limite</span>
            <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px', borderRadius: '8px' }}>
                <IconCalendar />
              </div>
              <span style={{ fontWeight: '700' }}>{task.due_date || "Pas de date fixée"}</span>
            </div>
          </div>

          {task.created_at && (
            <div className="field-group full-width" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                <span>Date de création</span>
                <span>{new Date(task.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}