import { useEffect, useState, createContext, type ReactNode } from "react";
import { api } from "../api/axios"; // ✅ IMPORTANT : Utilisez votre instance configurée

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: any;
  roles?: any[];
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Charger l'utilisateur au démarrage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedEmployee = localStorage.getItem("employee");

    console.log("🔍 Vérification token au démarrage:", { 
      hasToken: !!token, 
      hasUser: !!storedUser 
    });

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedEmployee) {
        setEmployee(JSON.parse(storedEmployee));
      }
    }
    
    setLoading(false);
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string) => {
    try {
      console.log("entative de connexion:", { email });
      
      const res = await api.post("/login", { email, password });
      
      console.log("✅ Réponse login:", res.data);

      const token = res.data.token;
      const userData = res.data.user;
      const employeeData = res.data.employee;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (employeeData) {
        localStorage.setItem("employee", JSON.stringify(employeeData));
        setEmployee(employeeData);
      }

      setUser(userData);
      
      console.log("✅ Connexion réussie, utilisateur:", userData);
    } catch (err: any) {
      console.error("❌ Erreur login:", err.response?.data || err.message);
      
      const message = err.response?.data?.message || "Email ou mot de passe incorrect";
      throw new Error(message);
    }
  };

  // 📝 Register
  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("📤 Tentative d'inscription:", { name, email });
      
      const res = await api.post("/register", { name, email, password });
      
      console.log("✅ Réponse register:", res.data);

      const token = res.data.token;
      const userData = res.data.user;
      const employeeData = res.data.employee;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (employeeData) {
        localStorage.setItem("employee", JSON.stringify(employeeData));
        setEmployee(employeeData);
      }

      setUser(userData);
      
      console.log("✅ Inscription réussie, utilisateur:", userData);
    } catch (err: any) {
      console.error("❌ Erreur register:", err.response?.data || err.message);
      
      const message = err.response?.data?.message || "Erreur lors de l'inscription";
      throw new Error(message);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      console.log("📤 Déconnexion...");
      await api.post("/logout");
      console.log("✅ Déconnexion API réussie");
    } catch (err: any) {
      console.error("⚠️ Erreur logout API:", err.response?.data || err.message);
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("employee");
    setUser(null);
    setEmployee(null);
    
    console.log("✅ Déconnexion locale terminée");
  };

  return (
    <AuthContext.Provider value={{ user, employee, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};