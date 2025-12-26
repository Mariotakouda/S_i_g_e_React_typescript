import { useState, useContext, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./login.css";
import { AuthContext, type User } from "../../context/AuthContext";

export default function Login() {
  const { login, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false); // État pour la visibilité
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); 

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
      if (loggedInUser.needs_password_change) {
        navigate('/change-password', { replace: true });
      } else {
        const redirectPath = loggedInUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      let errorMessage = "Une erreur inconnue est survenue";
      if (err.response?.data?.message) {
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                // 🎯 Bascule dynamique entre 'password' et 'text'
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
                tabIndex={-1} // Évite que la touche Tab s'arrête sur l'œil
              >
                {/* Icônes (utilisez des icônes SVG ou Lucide-React) */}
                {showPassword ? "🙈" : "👁️"} 
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}