import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const csrf = async () => {
    await axios.get("/sanctum/csrf-cookie");
  };

  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const { data } = await axios.get("/api/user");
      // Safety check: ensure we got a valid user object, not HTML or something else
      if (data && typeof data === 'object' && data.id) {
        setUser(data);
      }
      setLoading(false);
    } catch (error) {
      // Only log errors that aren't 401 (Unauthenticated) to keep console clean
      if (error.response?.status !== 401) {
        console.error("Auth check failed:", error.message);
      }
      setLoading(false);
      navigate("/login");
    }
  };

  const logout = async () => {
    await csrf();
    try {
      await axios.post("/logout");
      setUser(null);
      navigate("/login");
    } catch (e) { }
  };

  const login = async ({ ...data }) => {
    await csrf();
    console.log(data);
    try {
      await axios.post("/login", { ...data });

      await getUser();
      navigate("/dashboard");
    } catch (e) {
      console.log("err auth context", e);
      toast.error("Gagal login");
      if (e.code == "ERR_NETWORK") {
        toast.error("Gagal Login , koneksi bermasalah");
      }
      if (e.response) {
        if (e.response.status == 422) {
          toast.error("Cek kembali username dan password anda");
          setErrors(e.response.data.errors);
        }
      }
    }
  };



  const addUser = async ({ ...data }) => {
    await csrf();
    try {
      await axios.post("/api/users", data);
      alert("berhasil");
      navigate("/users");
    } catch (e) {
      if (e.response.status == 422) {
        setErrors(e.response.data.errors);
      }
    }
  };

  const addProduct = async ({ ...data }) => { };

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        errors,
        getUser,
        login,
        logout,
        setErrors,
        addUser,
        addProduct,
        loading,

      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
