
import { useEffect, useState, createContext, type ReactNode } from "react";
import { api } from "../api/axios"; 

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "manager";
  employee?: Employee;
  needs_password_change: boolean;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo_url?: string | null; 
  phone?: string;
  contract_type?: string;
  hire_date?: string;
  salary_base?: number;
  department?: {
    id: number;
    name: string;
  };
  roles?: Array<{
    id: number;
    name: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  setEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  login: (email: string, password: string) => Promise<User>; 
  logout: () => Promise<void>;
  updateLocalUserStatus: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Charger les données au montage (depuis localStorage + vérif API si nécessaire)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedEmployee = localStorage.getItem("employee");

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // ✅ Si employee ou manager SANS données employee en localStorage
          if ((parsedUser.role === "employee" || parsedUser.role === "manager") && !storedEmployee) {
            console.log("🔄 Chargement des données employee depuis /me...");
            try {
              const meResponse = await api.get("/me");
              if (meResponse.data.employee) {
                console.log("✅ Données employee chargées:", meResponse.data.employee);
                setEmployee(meResponse.data.employee);
                localStorage.setItem("employee", JSON.stringify(meResponse.data.employee));
                
                // ✅ IMPORTANT : Mettre à jour aussi user.employee pour le contexte
                const updatedUser = { ...parsedUser, employee: meResponse.data.employee };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }
            } catch (err) {
              console.error("❌ Erreur chargement /me:", err);
            }
          } else if (storedEmployee) {
            const parsedEmployee = JSON.parse(storedEmployee);
            setEmployee(parsedEmployee);
            
            // ✅ Synchroniser user.employee aussi
            if (!parsedUser.employee) {
              parsedUser.employee = parsedEmployee;
              setUser({ ...parsedUser });
            }
          }
        } catch (err) {
          console.error("❌ Erreur parsing localStorage:", err);
          localStorage.clear();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

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
      let userData: User = res.data.user;
      const employeeData: Employee | null = res.data.employee;

      console.log("📥 Données login reçues:", { userData, employeeData });

      localStorage.setItem("token", token);
      
      // ✅ CORRECTION : Toujours stocker employee s'il existe
      if (employeeData) {
        localStorage.setItem("employee", JSON.stringify(employeeData));
        setEmployee(employeeData);
        
        // ✅ Ajouter employee dans user aussi
        userData = { ...userData, employee: employeeData };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } 
      // ✅ Si pas d'employee retourné mais que c'est un employee/manager, charger depuis /me
      else if (userData.role === "employee" || userData.role === "manager") {
        console.log("🔄 Pas d'employee dans la réponse login, chargement depuis /me...");
        try {
          const meResponse = await api.get("/me");
          if (meResponse.data.employee) {
            console.log("✅ Données employee récupérées via /me:", meResponse.data.employee);
            localStorage.setItem("employee", JSON.stringify(meResponse.data.employee));
            setEmployee(meResponse.data.employee);
            
            userData = { ...userData, employee: meResponse.data.employee };
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
          }
        } catch (err) {
          console.error("❌ Erreur /me après login:", err);
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
      } 
      // ✅ Admin ou autre rôle sans employee
      else {
        localStorage.removeItem("employee");
        setEmployee(null);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      return userData;
      
    } catch (err: any) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      const message = err.response?.data?.message || "Email ou mot de passe incorrect";
      throw new Error(message);
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
    <AuthContext.Provider value={{ user, employee, setEmployee, login, logout, updateLocalUserStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};