import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

// --- Icônes SVG ---
const IconArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconBriefcase = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  task_file: string | null;
  report_file: string | null;
  employee: { first_name: string; last_name: string; email: string };
  creator: { name: string; role: string };
}

export default function TaskShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";
  const routePrefix = isAdmin ? "/admin/tasks" : "/employee/tasks";
  
  const getStorageUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return "http://localhost:8000/storage/";
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/storage/`;
  };

  const STORAGE_URL = getStorageUrl();

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data.data || res.data);
    } catch (error: any) {
      console.error("Erreur chargement:", error);
      navigate(routePrefix);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (e: React.MouseEvent, fileUrl: string, fileName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${STORAGE_URL}${fileUrl}`;
    
    setDownloading(fileUrl);
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' },
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error: any) {
      const newWindow = window.open('', '_blank');
      if (newWindow) newWindow.location.href = fullUrl;
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; label: string }> = {
      pending: { class: 'bg-warning-subtle text-warning-emphasis border-warning', label: 'En attente' },
      in_progress: { class: 'bg-primary-subtle text-primary-emphasis border-primary', label: 'En cours' },
      completed: { class: 'bg-success-subtle text-success-emphasis border-success', label: 'Terminée' },
      cancelled: { class: 'bg-danger-subtle text-danger-emphasis border-danger', label: 'Annulée' }
    };
    return styles[status] || styles.pending;
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (!task) return null;

  const badge = getStatusBadge(task.status);

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">Détails de la mission</h2>
          <p className="text-muted small mb-0">Référence ID: #{task.id}</p>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => navigate(`${routePrefix}/${task.id}/edit`)}
              className="btn btn-warning px-3 d-flex align-items-center gap-2 fw-semibold"
            >
              <IconEdit /> Modifier
            </button>
          )}
          <button 
            onClick={() => navigate(routePrefix)}
            className="btn btn-outline-secondary px-3 d-flex align-items-center gap-2 fw-semibold bg-white"
          >
            <IconArrowLeft /> Retour
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          
          {/* Status and Title */}
          <div className="mb-4">
            <span className={`badge border px-3 py-2 rounded-pill fw-bold text-uppercase mb-3 ${badge.class}`} style={{ fontSize: '11px' }}>
               {badge.label}
            </span>
            <h1 className="h2 fw-bold text-dark mb-0">{task.title}</h1>
          </div>

          {/* Metadata Grid */}
          <div className="row g-4 py-4 border-top border-bottom my-4">
            <div className="col-md-4">
              <label className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
                <IconUser /> Assigné à
              </label>
              <div className="fw-semibold text-dark">{task.employee.first_name} {task.employee.last_name}</div>
              <div className="small text-muted">{task.employee.email}</div>
            </div>
            <div className="col-md-4">
              <label className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
                <IconCalendar /> Échéance
              </label>
              <div className="fw-semibold text-dark">
                {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                }) : 'Non définie'}
              </div>
            </div>
            <div className="col-md-4">
              <label className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
                <IconBriefcase /> Créé par
              </label>
              <div className="fw-semibold text-dark">{task.creator.name}</div>
              <div className="small text-muted text-capitalize">{task.creator.role}</div>
            </div>
          </div>

          {/* Consignes Section */}
          <div className="mb-5">
            <h5 className="h6 fw-bold text-uppercase text-secondary mb-3">Consignes de la mission</h5>
            <div className="p-4 bg-light rounded-3 text-secondary border-start border-4 border-primary shadow-none" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {task.description || "Aucune description détaillée n'est disponible."}
            </div>
          </div>

          {/* Documents Section */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 border rounded-3 bg-white h-100">
                <p className="small fw-bold text-muted text-uppercase mb-3">Document Source</p>
                {task.task_file ? (
                  <button
                    onClick={(e) => handleDownloadPDF(e, task.task_file!, 'consignes.pdf')}
                    disabled={downloading === task.task_file}
                    className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  >
                    {downloading === task.task_file ? <span className="spinner-border spinner-border-sm"></span> : <IconDownload />}
                    Télécharger les consignes
                  </button>
                ) : (
                  <div className="text-center text-muted small py-2">Aucun document joint</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className={`p-3 border rounded-3 h-100 ${task.report_file ? 'bg-success-subtle border-success' : 'bg-white'}`}>
                <p className="small fw-bold text-muted text-uppercase mb-3">Rapport final</p>
                {task.report_file ? (
                  <button
                    onClick={(e) => handleDownloadPDF(e, task.report_file!, 'rapport.pdf')}
                    disabled={downloading === task.report_file}
                    className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  >
                    {downloading === task.report_file ? <span className="spinner-border spinner-border-sm"></span> : <IconDownload />}
                    Télécharger le rapport
                  </button>
                ) : (
                  <div className="text-center text-muted small py-2">
                    {task.status === 'completed' ? 'Non soumis' : 'En attente de soumission'}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}