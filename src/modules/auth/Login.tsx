import { useState, useContext, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./login.css";
import { AuthContext, type User } from "../../context/AuthContext";

export default function Login() {
  const { login, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  // --- 1. Gestion de la redirection si déjà connecté ---
  useEffect(() => {
    if (user) {
      // Si l'utilisateur doit changer son mot de passe, on le bloque ici
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
      // ✅ Récupération de l'utilisateur après login
      const loggedInUser: User = await login(email, password); 

      // --- 2. Logique de redirection intelligente ---
      if (loggedInUser.needs_password_change) {
        // Priorité absolue : changer le mot de passe temporaire
        navigate('/change-password', { replace: true });
      } else {
        // Redirection classique selon le rôle
        const redirectPath = loggedInUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(redirectPath, { replace: true });
      }
      
    } catch (err: any) {
      let errorMessage = "Une erreur inconnue est survenue";

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message; 
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Connexion S-I-G-E</h2>
        <p className="login-subtitle">Accédez à votre espace personnel</p>

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* <div className="auth-links">
        <Link 
            to={isLoading ? "#" : "/forgot-password"} 
            className={`forgot-link ${isLoading ? "link-disabled" : ""}`}
            onClick={(e) => isLoading && e.preventDefault()}>
            Mot de passe oublié ?
        </Link>
          <span className="separator">|</span>
          <Link to="/register" className="register-link"> 
            Créer un compte Employé
          </Link>
        </div> */}
      </div>
    </div>
  );
}