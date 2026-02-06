import { Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "../pages/partials/Header";
import Sidebar from "../pages/partials/Sidebar";
import useAuthContext from "../context/AuthContext";

const DashboardLayout = () => {
  const { user, loading } = useAuthContext();
  const currentYear = new Date().getFullYear();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        x
        href="https://use.fontawesome.com/releases/v5.7.2/css/all.css"
        integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr"
        crossOrigin="anonymous"
      />

      <link rel="stylesheet" href="/assets/css/style.css" />
      <link rel="stylesheet" href="/assets/css/components.css" />
      <link rel="stylesheet" href="/assets/css/custom.css" />

      <link
        href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
        rel="stylesheet"
      />

      <Toaster />
      <div id="app" style={{ zoom: "90%" }}>
        <div className="main-wrapper">
          <div className="navbar-bg bg-danger"></div>
          <Header />
          <Sidebar />
          <Outlet />
          <footer className="main-footer">
            <div className="footer-left">
              Copyright © 2023 - {currentYear} <div className="bullet"></div>{" "}
              Made By{" "}
              <a
                href="https://smartinovasi.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Smart Inovasi
              </a>
            </div>
            <div className="footer-right">
              <span className="text-muted">Version 3.2</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
