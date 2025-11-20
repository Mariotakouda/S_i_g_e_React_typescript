// src/context/AuthContext.tsx - VERSION OPTIMISÉE
import { createContext, useState, useEffect, useRef, type ReactNode } from "react";
import { api } from "../api/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => null,
  register: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  
  // 🔧 FIX: Flag pour éviter de refetch après login
  const skipNextFetch = useRef(false);

  const logout = () => {
    console.log("🚪 Déconnexion");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Chargement initial du user
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      // Si on vient de login, on skip ce fetch
      if (skipNextFetch.current) {
        console.log("⏭️ Skip fetch (user déjà défini après login)");
        skipNextFetch.current = false;
        setLoading(false);
        return;
      }

      if (!token) {
        console.log("🔑 Pas de token");
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      console.log("🔄 Vérification du token au démarrage...");
      
      try {
        const res = await api.get("/me");
        const fetchedUser = res.data.employee || res.data.user;
        
        console.log("✅ User chargé:", fetchedUser);
        
        if (isMounted) {
          setUser(fetchedUser);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("❌ Token invalide ou expiré:", error.response?.status);
        
        if (isMounted) {
          logout();
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      console.log("🔐 Connexion:", email);
      
      const res = await api.post("/login", { email, password });
      const tk = res.data.token;
      const loggedUser: User = res.data.user;

      console.log("✅ Connexion réussie:", loggedUser);

      // Sauvegarde dans localStorage
      localStorage.setItem("token", tk);
      
      // 🎯 SOLUTION: Définir le user AVANT de changer le token
      // Et activer le flag pour skip le prochain fetch
      setUser(loggedUser);
      skipNextFetch.current = true;
      setToken(tk);

      return loggedUser;
    } catch (error: any) {
      console.error("❌ Échec connexion:", error.response?.data);
      return null;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      await api.post("/register", { name, email, password });
      console.log("✅ Inscription réussie");
      return true;
    } catch (error: any) {
      console.error("❌ Échec inscription:", error.response?.data);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};