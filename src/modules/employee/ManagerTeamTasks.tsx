import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

// --- ICONS SVG ---
const Icons = {
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="2"/></svg>,
    Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Stats: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    Empty: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
};

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date: string;
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        department?: { name: string; };
    };
}

interface Stats {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
}

export default function ManagerTeamTasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchTeamTasks();
    }, []);

    const fetchTeamTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/manager/team-tasks');
            setTasks(response.data.data || []);
            setStats(response.data.stats || { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Erreur lors du chargement des tâches';
            setError(message);
            if (err.response?.status === 403) navigate('/employee/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (taskId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.")) {
            return;
        }
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
            fetchTeamTasks(); 
        } catch (err: any) {
            alert(err.response?.data?.message || "Erreur lors de la suppression.");
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { bg: '#fff7ed', color: '#9a3412', label: 'En attente' },
            in_progress: { bg: '#eff6ff', color: '#1e40af', label: 'En cours' },
            completed: { bg: '#f0fdf4', color: '#166534', label: 'Terminée' },
            cancelled: { bg: '#fef2f2', color: '#991b1b', label: 'Annulée' }
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8' }}>
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <p>Chargement des missions d'équipe...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '15px', maxWidth: '1400px', margin: '0 auto', color: '#1e293b' }}>
            <style>{`
                @media (max-width: 425px) {
                    .responsive-table thead { display: none; }
                    .responsive-table tr { 
                        display: block; 
                        border-bottom: 2px solid #f1f5f9;
                        padding: 15px 0;
                    }
                    .responsive-table td { 
                        display: block; 
                        padding: 8px 15px !important; 
                        text-align: left !important;
                    }
                    .responsive-table td:last-child {
                        text-align: center !important;
                        border-top: 1px dashed #e2e8f0;
                        margin-top: 10px;
                        padding-top: 15px !important;
                    }
                    .stats-card { padding: 15px !important; }
                    .stats-card div:last-child { font-size: 1.25rem !important; }
                    .filter-bar { overflow-x: auto; white-space: nowrap; padding-bottom: 10px !important; }
                    .header-title { font-size: 1.35rem !important; }
                }
            `}</style>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="header-title" style={{ fontWeight: 800, fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icons.Users /> Tâches Équipe
                    </h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Suivi des performances collectives</p>
                </div>
                <Link to="/employee/tasks/create" className="btn btn-primary d-flex align-items-center justify-content-center gap-2" style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 600 }}>
                    <Icons.Plus /> Nouvelle mission
                </Link>
            </div>

            <div className="row g-2 g-md-3 mb-4">
                {[
                    { label: 'Total', value: stats.total, color: '#475569' },
                    { label: 'En attente', value: stats.pending, color: '#d97706' },
                    { label: 'En cours', value: stats.in_progress, color: '#2563eb' },
                    { label: 'Terminées', value: stats.completed, color: '#059669' }
                ].map((s, i) => (
                    <div className="col-6 col-md-3" key={i}>
                        <div className="stats-card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filter-bar d-flex gap-2 mb-4 p-2" style={{ background: '#f1f5f9', borderRadius: '12px' }}>
                {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map(k => (
                    <button 
                        key={k}
                        onClick={() => setFilter(k)}
                        className="btn btn-sm"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontWeight: 600,
                            border: 'none',
                            backgroundColor: filter === k ? '#fff' : 'transparent',
                            color: filter === k ? '#2563eb' : '#64748b',
                            boxShadow: filter === k ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            transition: '0.2s',
                            flexShrink: 0
                        }}
                    >
                        {k === 'all' ? 'Tout' : k.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {error && <div className="alert alert-danger border-0 mb-4" style={{ fontSize: '0.85rem' }}>{error}</div>}

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {filteredTasks.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Icons.Empty />
                        <h5 className="mt-3 text-muted">Aucune mission</h5>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 responsive-table">
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ border: 0, padding: '16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Mission</th>
                                    <th style={{ border: 0, padding: '16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Responsable</th>
                                    <th style={{ border: 0, padding: '16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Statut</th>
                                    <th style={{ border: 0, padding: '16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Échéance</th>
                                    <th style={{ border: 0, padding: '16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => {
                                    const badge = getStatusBadge(task.status);
                                    return (
                                        <tr key={task.id}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{task.title}</div>
                                                <div className="d-md-block" style={{ fontSize: '0.8rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                                                    {task.description}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.employee.first_name} {task.employee.last_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{task.employee.department?.name || 'Staff'}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, 
                                                    backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.color}20`
                                                }}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: '#475569' }}>
                                                <span className="d-md-none text-muted" style={{ fontSize: '0.7rem', fontWeight: 700 }}>ÉCHÉANCE: </span>
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '--'}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link to={`/employee/tasks/${task.id}`} className="btn btn-light btn-sm"><Icons.Eye /></Link>
                                                    <Link to={`/employee/tasks/${task.id}/edit`} className="btn btn-light btn-sm" style={{ color: '#f59e0b' }}><Icons.Edit /></Link>
                                                    <button onClick={() => handleDelete(task.id)} className="btn btn-light btn-sm" style={{ color: '#ef4444' }}><Icons.Trash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}