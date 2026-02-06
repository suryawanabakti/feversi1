import React, { useEffect, useState } from "react";
import "./Login.css";
import useAuthContext from "../../context/AuthContext";
import Button from "../../components/Button";
import { useParams, useSearchParams } from "react-router-dom";

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token"));

  const { login, login2, errors } = useAuthContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
      // setErrors([]);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <>
      {!token ? (
        <div className="bodylogin">
          <div className="containers">
            <input type="checkbox" id="flip" />
            <div className="cover">
              <div className="front">
                <img
                  src="/unhas-logobarus.png"
                  alt=""
                  style={{ opacity: "0.8" }}
                />
                <div className="text">
                  <span className="text-1">
                    Selamat datang di Aplikasi <br /> Bank Data PPPDS
                  </span>
                  <span className="text-2">Let's get connected !</span>
                </div>
              </div>
            </div>
            <div className="forms">
              <div className="form-content">
                <div className="login-form">
                  <div className="title">Login</div>

                  {errors.username && (
                    <div className="text-danger">{errors.username[0]}</div>
                  )}
                  <form method="POST" onSubmit={handleLogin}>
                    <div className="input-boxes">
                      <div className="input-box">
                        <i className="fas fa-user" />
                        <input
                          type="text"
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your username"
                          name="username"
                          id="username"
                        />
                      </div>
                      <div className="input-box">
                        <i className="fas fa-lock" />
                        <input
                          type="password"
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          name="password"
                          required
                        />
                        {errors.password && (
                          <div className="text-danger">
                            {errors.password[0]}
                          </div>
                        )}
                      </div>
                      <div className="button input-box">
                        <Button
                          title="Masuk"
                          loading={loading}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </form>
                  <small></small>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>Loading....</>
      )}
    </>
  );
};

export default Login;
