import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  task_file: string | null;
  report_file: string | null;
  employee: {
    first_name: string;
    last_name: string;
    email: string;
  };
  creator: {
    name: string;
    role: string;
  };
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
    if (!apiUrl) {
      console.error("❌ VITE_API_URL non défini");
      return "http://localhost:8000/storage/";
    }
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/storage/`;
  };

  const STORAGE_URL = getStorageUrl();

  useEffect(() => {
    console.log("🔧 Config Admin:", { STORAGE_URL });
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data.data || res.data);
    } catch (error: any) {
      console.error("Erreur chargement:", error);
      alert("Impossible de charger cette tâche");
      navigate(routePrefix);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (e: React.MouseEvent, fileUrl: string, fileName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fullUrl = `${STORAGE_URL}${fileUrl}`;
    console.log("📥 Admin télécharge:", fullUrl);
    
    if (fullUrl.includes('undefined')) {
      alert("❌ Configuration VITE_API_URL manquante");
      return;
    }

    setDownloading(fileUrl);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = fullUrl;
      } else {
        alert("❌ Impossible de télécharger. Vérifiez que le fichier existe.");
      }
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ En attente' },
      in_progress: { bg: '#dbeafe', color: '#1e40af', label: '🔄 En cours' },
      completed: { bg: '#d1fae5', color: '#065f46', label: '✅ Terminée' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', label: '❌ Annulée' }
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Chargement de la tâche...
      </div>
    );
  }

  if (!task) return null;

  const statusBadge = getStatusBadge(task.status);
  const hasReport = !!task.report_file;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
          Détails de la mission
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isAdmin && (
            <button 
              onClick={() => navigate(`${routePrefix}/${task.id}/edit`)}
              style={{ 
                background: '#f59e0b', 
                color: 'white',
                border: 'none', 
                padding: '10px 18px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ✏️ Modifier
            </button>
          )}
          <button 
            onClick={() => navigate(routePrefix)}
            style={{ 
              background: '#f3f4f6', 
              border: 'none', 
              padding: '10px 18px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              color: '#374151'
            }}
          >
            ← Retour
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb', 
        padding: '32px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
            {task.title}
          </h3>
          <span style={{ 
            display: 'inline-block',
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '13px', 
            fontWeight: '600',
            background: statusBadge.bg,
            color: statusBadge.color
          }}>
            {statusBadge.label}
          </span>
        </div>

        {task.description && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
              📋 Consignes
            </div>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>
              {task.description}
            </p>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
              👤 Assigné à
            </div>
            <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
              {task.employee.first_name} {task.employee.last_name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {task.employee.email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
              📅 Date limite
            </div>
            <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
              {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              }) : 'Non définie'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
              🔧 Créé par
            </div>
            <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
              {task.creator.name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {task.creator.role === 'admin' ? 'Administrateur' : 'Manager'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ 
            padding: '20px', 
            background: task.task_file ? '#eff6ff' : '#f9fafb', 
            borderRadius: '8px',
            border: task.task_file ? '1px solid #bfdbfe' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
              📄 Document de consignes
            </div>
            {task.task_file ? (
              <button
                onClick={(e) => handleDownloadPDF(e, task.task_file!, 'consignes.pdf')}
                disabled={downloading === task.task_file}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: downloading === task.task_file ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: downloading === task.task_file ? 'wait' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {downloading === task.task_file ? '⏳ Téléchargement...' : '📥 Télécharger le PDF'}
              </button>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
                Aucun document joint
              </p>
            )}
          </div>

          <div style={{ 
            padding: '20px', 
            background: hasReport ? '#ecfdf5' : '#f9fafb', 
            borderRadius: '8px',
            border: hasReport ? '1px solid #a7f3d0' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
              📤 Rapport de l'employé
            </div>
            {hasReport ? (
              <button
                onClick={(e) => handleDownloadPDF(e, task.report_file!, 'rapport.pdf')}
                disabled={downloading === task.report_file}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: downloading === task.report_file ? '#d1d5db' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: downloading === task.report_file ? 'wait' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {downloading === task.report_file ? '⏳ Téléchargement...' : '📥 Télécharger le rapport'}
              </button>
            ) : (
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
                {task.status === 'completed' ? 'Rapport non disponible' : 'En attente de soumission'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}