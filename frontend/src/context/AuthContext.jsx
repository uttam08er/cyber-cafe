import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authAPI } from "../api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

function extractData(res) {
  return res?.data?.[0]?.data ?? null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI
      .getMe()
      .then((res) => {
        const userData = extractData(res);
        if (userData) setUser(userData);
      })
      .catch((err) => {
        // Only wipe tokens on confirmed 401 — not on network errors or 5xx
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const payload = extractData(res) || res?.data?.[0];
    
    if (!payload?.access_token || !payload?.refresh_token || !payload?.user) {
      throw new Error(payload?.message || "Invalid response from server. Please try again.");
    }

    localStorage.setItem("access_token", payload.access_token);
    localStorage.setItem("refresh_token", payload.refresh_token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const payload = extractData(res) || res?.data?.[0];

    if (!payload?.access_token || !payload?.refresh_token || !payload?.user) {
      throw new Error(payload?.message || "Invalid response from server. Please try again.");
    }

    localStorage.setItem("access_token", payload.access_token);
    localStorage.setItem("refresh_token", payload.refresh_token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authAPI.getMe();
    const userData = extractData(res);
    if (userData) setUser(userData);
    return userData;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
