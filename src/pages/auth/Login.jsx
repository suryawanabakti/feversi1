"use client";

import { useState } from "react";
import LoginForm from "../../components/LoginForm";
import "./login.css";

import useAuthContext from "../../context/AuthContext";
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, login2, errors } = useAuthContext();
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulasi login API call
      await login(credentials);

    } catch (err) {
      console.log("ERROR login.jsx", err)
      setError("Gagal login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-circle">
              <span className="logo-icon">
                <img src="/images/logo-unhas.png" alt="" />
              </span>
            </div>
            <h1 className="branding-title">Bank Data PPPDS</h1>
            <p className="branding-subtitle">
              Platform ini berfungsi sebagai pusat data terpusat (centralized
              data repository) <br />
              <small>versi 1.0.2</small>
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Efisiensi administrasi</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Transparansi dan akurasi</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Integrasi pelaporan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Masuk Akun</h2>
              <p>Gunakan kredensial Anda untuk mengakses sistem</p>
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              errors={errors}
            />

            <div className="form-footer">
              <p className="footer-text">
                Belum memiliki akses?
                <br />
                <a href="#" className="footer-link">
                  Hubungi administrator sistem
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}

    </div>
  );
}
