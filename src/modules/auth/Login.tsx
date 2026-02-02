
import { useState, useContext, type FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import "./login.css";
import { AuthContext, type User } from "../../context/AuthContext";

export default function Login() {
  const { login, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      if (user.needs_password_change) {
        navigate('/change-password', { replace: true });
      } else {
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setIsLoading(true); 

    try {
      const loggedInUser: User = await login(email, password); 
      
      // Logique de redirection après succès
      if (loggedInUser.needs_password_change) {
        navigate('/change-password', { replace: true });
      } else {
        const redirectPath = loggedInUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* BOUTON RETOUR ACCUEIL */}
        <button onClick={() => navigate("/")} className="back-button" title="Retour à l'accueil">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Retour</span>
        </button>

        <h2 className="login-title">Connexion</h2>
        <p className="login-subtitle">Accédez à votre espace personnel HODO</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Adresse email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input password-field"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* LIEN MOT DE PASSE OUBLIÉ */}
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link 
              to="/forgot-password" 
              style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}