// src/modules/employee/EmployeeLeaveHistory.tsx

import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Link } from 'react-router-dom';

interface LeaveRequest {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  created_at: string;
}

export default function EmployeeLeaveHistory() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/me/leave_requests');
      setLeaves(response.data);
    } catch (err: any) {
      console.error("Erreur de chargement:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-700 font-bold px-2 py-1 rounded";
      case 'rejected':
        return "bg-red-100 text-red-700 font-bold px-2 py-1 rounded";
      default:
        return "bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded";
    }
  };

  if (loading) return <div className="p-5">Chargement de l'historique...</div>;
  if (error) return <div className="p-5 text-red-600">Erreur : {error}</div>;

  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold mb-4">Mon Historique de Demandes de Congé</h2>

      <div className="mb-5">
        <Link
          to="/employee/leave_requests/create"
          className="inline-block px-5 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
        >
          + Faire une nouvelle demande
        </Link>
      </div>

      {leaves.length === 0 ? (
        <p>Vous n'avez soumis aucune demande de congé pour l'instant.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border text-left">Type</th>
                <th className="px-4 py-3 border text-left">Période</th>
                <th className="px-4 py-3 border text-left">Soumise le</th>
                <th className="px-4 py-3 border text-left">Raison</th>
                <th className="px-4 py-3 border text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 border">{l.type.charAt(0).toUpperCase() + l.type.slice(1)}</td>
                  <td className="px-4 py-2 border">{l.start_date} au {l.end_date}</td>
                  <td className="px-4 py-2 border">{new Date(l.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2 border">{l.message || '—'}</td>
                  <td className="px-4 py-2 border">
                    <span className={getStatusClasses(l.status)}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
