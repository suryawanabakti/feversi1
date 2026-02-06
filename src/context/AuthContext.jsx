import { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Optimized CSRF handler
  const csrf = async () => {
    try {
      await axios.get("/sanctum/csrf-cookie");
      // Check if cookie is readable by JS
      const hasCookie = document.cookie.includes("XSRF-TOKEN");
      console.log("[AuthContext Phase 3] CSRF fetched. Cookie readable by JS:", hasCookie);
      return true;
    } catch (e) {
      console.error("CSRF fetch failed", e);
      return false;
    }
  };

  // Interceptor to handle 419 (Session Expired / CSRF Mismatch)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        // If it's a 419 error and we haven't retried this request yet
        if (error.response?.status === 419 && !config._retry) {
          config._retry = true;
          const refreshed = await csrf();
          if (refreshed) {
            return axios(config);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const getUser = async () => {
    try {
      const { data } = await axios.get("/api/user");
      if (data && typeof data === 'object' && data.id) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      if (error.response?.status !== 401) {
        console.error("Auth check failed:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setErrors([]);
    try {
      // 1. Ensure we have a fresh CSRF cookie before login
      await csrf();

      // 2. Perform login
      await axios.post("/login", credentials);

      // 3. Get user data
      await getUser();

      toast.success("Login Berhasil!");
      navigate("/dashboard");
    } catch (e) {
      console.error("Login error:", e.response?.data || e.message);

      if (e.code === "ERR_NETWORK") {
        toast.error("Gagal Login, koneksi bermasalah");
        return;
      }

      const status = e.response?.status;
      if (status === 422) {
        setErrors(e.response.data.errors || {});
        toast.error("Cek kembali username dan password anda");
      } else if (status === 419) {
        toast.error("Sesi telah habis, silakan coba lagi");
      } else {
        toast.error(`Terjadi kesalahan sistem (${status || 'Unknown'}).`);
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post("/logout");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const addUser = async (data) => {
    setErrors([]);
    try {
      await axios.post("/api/users", data);
      toast.success("User berhasil ditambahkan");
      navigate("/users");
    } catch (e) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors || {});
      } else {
        toast.error("Gagal menambahkan user");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const contextValue = useMemo(() => ({
    user,
    errors,
    loading,
    getUser,
    login,
    logout,
    setErrors,
    addUser,
  }), [user, errors, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
