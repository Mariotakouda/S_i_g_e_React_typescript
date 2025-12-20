import { useEffect, useState, createContext, type ReactNode } from "react";
import { api } from "../api/axios"; 

// 🎯 AJOUT : needs_password_change dans l'interface User
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
  needs_password_change: boolean; // Ajout crucial ici
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: any;
  roles?: any[];
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  login: (email: string, password: string) => Promise<User>; 
  register: (data: RegisterData) => Promise<User>; 
  logout: () => Promise<void>;
  updateLocalUserStatus: () => void; // Nouvelle fonction utile
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

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

  /**
   * 🔄 Utile après avoir changé le mot de passe : 
   * Met à jour l'état local pour autoriser l'accès au dashboard sans recharger la page
   */
  const updateLocalUserStatus = () => {
    if (user) {
      const updatedUser = { ...user, needs_password_change: false };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      const message = err.response?.data?.message || "Email ou mot de passe incorrect";
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const res = await api.post("/register", data);
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      throw new Error(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout"); 
    } catch (err: any) {
      console.error("⚠️ Erreur logout API :", err.message);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("employee");
    setUser(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ user, employee, login, register, logout, updateLocalUserStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};