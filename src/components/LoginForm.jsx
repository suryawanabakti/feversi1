"use client";

import { useState } from "react";
import "../styles/login-form.css";

export default function LoginForm({ onSubmit, isLoading }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) {
      newErrors.username = "Username atau NIM tidak boleh kosong";
    }
    if (!credentials.password) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (credentials.password.length < 4) {
      newErrors.password = "Password minimal 4 karakter";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error saat user mulai mengetik
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    // Validasi saat blur
    const newErrors = validateForm();
    setErrors((prev) => ({
      ...prev,
      [name]: newErrors[name] || "",
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onSubmit(credentials);
    } else {
      setErrors(newErrors);
      setTouched({
        username: true,
        password: true,
      });
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* Username Field */}
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username atau NIM
        </label>
        <div className="form-input-wrapper">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Masukkan username atau NIM"
            value={credentials.username}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`form-input ${errors.username ? "error" : ""} ${
              credentials.username ? "filled" : ""
            }`}
          />
          <span className="input-icon">👤</span>
        </div>
        {errors.username && touched.username && (
          <span className="error-message">{errors.username}</span>
        )}
      </div>

      {/* Password Field */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="form-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Masukkan password"
            value={credentials.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`form-input ${errors.password ? "error" : ""} ${
              credentials.password ? "filled" : ""
            }`}
          />
          <span className="input-icon">🔑</span>
          <button
            type="button"
            className="password-toggle"
            onClick={handleTogglePassword}
            disabled={isLoading}
            title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {errors.password && touched.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>

      {/* Remember Me */}

      {/* Submit Button */}
      <button
        type="submit"
        className={`form-submit ${isLoading ? "loading" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loader"></span>
            <span>Sedang Masuk...</span>
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
