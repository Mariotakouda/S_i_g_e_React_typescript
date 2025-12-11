import { useEffect, useState, createContext, type ReactNode } from "react";
import { api } from "../api/axios"; 

// 🎯 EXPORTÉ : Résout l'erreur 'User' not exported
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

// 🎯 EXPORTÉ : Résout l'erreur 'Employee' not exported (si utilisé ailleurs)
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: any;
  roles?: any[];
}

// 🎯 NOUVEAU TYPE : Pour harmoniser l'appel de register
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  login: (email: string, password: string) => Promise<User>; 
  // 🔄 CORRIGÉ : Utilise un seul argument de type RegisterData
  register: (data: RegisterData) => Promise<User>; 
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

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedEmployee) {
        setEmployee(JSON.parse(storedEmployee));
      }
    }
    
    setLoading(false);
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post("/login", { email, password });
      
      const token = res.data.token;
      const userData: User = res.data.user;
      const employeeData: Employee | null = res.data.employee;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (employeeData) {
        localStorage.setItem("employee", JSON.stringify(employeeData));
        setEmployee(employeeData);
      } else {
        localStorage.removeItem("employee");
        setEmployee(null);
      }

      setUser(userData);
      return userData;
      
    } catch (err: any) {
      // Nettoyage en cas d'échec
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      const message = err.response?.data?.message || "Email ou mot de passe incorrect";
      throw new Error(message);
    }
  };

  // 📝 Register
  // 🔄 CORRIGÉ : Accepte l'objet RegisterData (harmonisation avec l'appel de Register.tsx)
  const register = async (data: RegisterData): Promise<User> => {
    try {
      const res = await api.post("/register", data); // Envoi de l'objet data (name, email, password)
      
      const token = res.data.token;
      const userData: User = res.data.user; 
      const employeeData: Employee | null = res.data.employee;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (employeeData) {
        localStorage.setItem("employee", JSON.stringify(employeeData));
        setEmployee(employeeData);
      }

      setUser(userData);
      return userData;
      
    } catch (err: any) {
      // Nettoyage en cas d'échec
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      const message = err.response?.data?.message || "Erreur lors de l'inscription";
      throw new Error(message);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await api.post("/logout"); 
    } catch (err: any) {
      console.error("⚠️ Erreur logout API (nettoyage local effectué) :", err.response?.data || err.message);
    }
    
    // Nettoyage local
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("employee");
    setUser(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ user, employee, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};