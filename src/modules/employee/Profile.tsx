// src/modules/employee/Profile.tsx
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";

export default function EmployeeProfile() {
  const { employee, setEmployee } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialiser la prévisualisation avec la photo actuelle
    if (employee?.profile_photo_url) {
      setPreviewUrl(employee.profile_photo_url);
    }
  }, [employee]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 2MB');
      return;
    }

    try {
      setUploading(true);

      // Prévisualisation immédiate
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload vers le serveur
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/me/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mise à jour du contexte
      setEmployee(response.data.employee);
      alert('✅ Photo mise à jour avec succès !');
    } catch (error: any) {
      console.error('Erreur upload:', error);
      alert('❌ Erreur lors de l\'upload de la photo');
      // Restaurer l'ancienne photo en cas d'erreur
      setPreviewUrl(employee?.profile_photo_url || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) return;

    try {
      setUploading(true);
      const response = await api.delete('/me/photo');
      setEmployee(response.data.employee);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('✅ Photo supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    return `${employee?.first_name?.charAt(0) || ''}${employee?.last_name?.charAt(0) || ''}`;
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* En-tête avec lien retour */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/employee/dashboard" style={backLinkStyle}>
          ← Retour au tableau de bord
        </Link>
      </div>

      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        marginBottom: '40px',
        color: '#1e293b'
      }}>
        Mon Profil
      </h1>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        padding: '40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Section Photo */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ position: 'relative' }}>
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Photo de profil" 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '4px solid #3b82f6',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
            ) : (
              <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                backgroundColor: '#3b82f6',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                border: '4px solid #3b82f6',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {getInitials()}
              </div>
            )}
            
            {uploading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '8px'
                }}></div>
                Upload...
              </div>
            )}
          </div>

          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
            id="photo-upload"
            disabled={uploading}
          />

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label 
              htmlFor="photo-upload"
              style={{
                padding: '12px 24px',
                backgroundColor: uploading ? '#94a3b8' : '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              📷 {uploading ? 'Upload en cours...' : 'Changer la photo'}
            </label>

            {previewUrl && !uploading && (
              <button
                onClick={handleDeletePhoto}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
              >
                🗑️ Supprimer
              </button>
            )}
          </div>

          <p style={{ 
            marginTop: '12px', 
            fontSize: '12px', 
            color: '#64748b',
            textAlign: 'center'
          }}>
            JPG, PNG ou GIF • Maximum 2MB
          </p>
        </div>

        {/* Informations du profil */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={sectionTitleStyle}>Informations personnelles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <InfoField label="Prénom" value={employee?.first_name} icon="👤" />
            <InfoField label="Nom" value={employee?.last_name} icon="👤" />
            <InfoField label="Email" value={employee?.email} icon="✉️" />
            <InfoField label="Téléphone" value={employee?.phone || 'Non renseigné'} icon="📱" />
          </div>
        </div>

        {/* Informations professionnelles */}
        <div style={{ marginBottom: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
          <h3 style={sectionTitleStyle}>Informations professionnelles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <InfoField label="Département" value={employee?.department?.name || 'Non assigné'} icon="🏢" />
            <InfoField label="Type de contrat" value={employee?.contract_type || 'Non défini'} icon="📄" />
            <InfoField 
              label="Date d'embauche" 
              value={employee?.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée'} 
              icon="📅"
            />
            <InfoField 
              label="Salaire de base" 
              value={employee?.salary_base ? `${new Intl.NumberFormat('fr-FR').format(employee.salary_base)} FCFA` : 'Non défini'} 
              icon="💰"
            />
          </div>
        </div>

        {/* Rôles */}
        {employee?.roles && employee.roles.length > 0 && (
          <div style={{ paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={sectionTitleStyle}>Rôles et permissions</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {employee.roles.map((role: any) => (
                <span 
                  key={role.id}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🎯 {role.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div style={{ 
        marginTop: '30px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <Link to="/employee/tasks" style={quickActionStyle('#3b82f6')}>
          ✅ Mes tâches
        </Link>
        <Link to="/employee/presences" style={quickActionStyle('#10b981')}>
          🕐 Mes présences
        </Link>
        <Link to="/employee/leave_requests" style={quickActionStyle('#f59e0b')}>
          🌴 Mes congés
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function InfoField({ label, value, icon }: { label: string; value: string | undefined; icon: string }) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <label style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px', 
        fontWeight: '600', 
        color: '#64748b',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        <span>{icon}</span>
        {label}
      </label>
      <p style={{ 
        margin: 0, 
        fontSize: '15px', 
        fontWeight: '600', 
        color: '#1e293b',
        wordBreak: 'break-word'
      }}>
        {value}
      </p>
    </div>
  );
}

// Styles
const backLinkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'color 0.2s'
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const quickActionStyle = (bgColor: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '16px',
  backgroundColor: bgColor,
  color: 'white',
  textDecoration: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s'
});