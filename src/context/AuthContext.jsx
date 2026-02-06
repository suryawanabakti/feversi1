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

  // Helper to get XSRF-TOKEN manually (bypass potential Axios issues in cross-subdomain)
  const getXsrfToken = () => {
    const name = "XSRF-TOKEN=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, ca.length);
      }
    }
    return null;
  };

  // Optimized CSRF handler - simplified as Axios automatically handles XSRF-TOKEN
  const csrf = async () => {
    console.log("[AuthContext V2] Fetching CSRF cookie...");
    try {
      // Clear old headers to ensure fresh fetch
      delete axios.defaults.headers.common['X-XSRF-TOKEN'];

      await axios.get("/sanctum/csrf-cookie");
      const token = getXsrfToken();

      console.log("[AuthContext V2] CSRF cookie fetched. Token:", token ? token.substring(0, 10) + "..." : "MISSING");

      if (token) {
        // Inject token into common headers as both formats Laravel might expect
        axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
      }
      return !!token;
    } catch (e) {
      console.error("[AuthContext V2] CSRF fetch failed", e);
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
          console.warn("[AuthContext V2] 419 detected. Retrying with fresh CSRF...");

          const refreshed = await csrf();
          if (refreshed) {
            const token = getXsrfToken();
            if (token) {
              // Ensure the retry request has the new token in headers
              if (config.headers.set) {
                config.headers.set('X-XSRF-TOKEN', token);
                config.headers.set('X-CSRF-TOKEN', token);
              } else {
                config.headers['X-XSRF-TOKEN'] = token;
                config.headers['X-CSRF-TOKEN'] = token;
              }
            }
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
      // 1. Force refresh CSRF before login attempt
      const ok = await csrf();
      if (!ok) {
        toast.error("Gagal inisialisasi sesi. Coba muat ulang halaman.");
        return;
      }

      console.log("[AuthContext V2] Posting login to:", (axios.defaults.baseURL || "") + "/login");

      // 2. Perform login
      await axios.post("/login", credentials);

      // 3. Get user data
      await getUser();

      toast.success("Login Berhasil!");
      navigate("/dashboard");
    } catch (e) {
      console.error("Login error detail:", e.response?.data || e.message);

      if (e.code === "ERR_NETWORK") {
        toast.error("Gagal Login, koneksi bermasalah (CORS?)");
        return;
      }

      const status = e.response?.status;
      if (status === 422) {
        setErrors(e.response.data.errors || {});
        toast.error("Cek kembali username dan password anda");
      } else if (status === 419) {
        toast.error("Sesi (CSRF) ditolak oleh server. Hubungi IT.");
      } else {
        toast.error(`Terjadi kesalahan (${status || 'Unknown'}).`);
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
