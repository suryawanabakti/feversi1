import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import useAuthContext from "../../context/AuthContext";
const Header = () => {
  const { logout, user, setErrors } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotification] = useState([]);
  const [beep, setBeep] = useState(false);
  const getNotification = async () => {
    const res = await axios.get("/api/get-notifications");
    console.log(res.data.noRead);
    if (res.data.noRead > 0) {
      setBeep(true);
    }
    setNotification(res.data.layanan);
  };
  const getDate = (timestamp) => {
    var date = new Date(timestamp);
    var tahun = date.getFullYear();
    var bulan = date.getMonth();
    var tanggal = date.getDate();
    var jam = date.getHours();
    var menit = date.getMinutes();
    var detik = date.getSeconds();

    switch (bulan) {
      case 0:
        bulan = "Januari";
        break;
      case 1:
        bulan = "Februari";
        break;
      case 2:
        bulan = "Maret";
        break;
      case 3:
        bulan = "April";
        break;
      case 4:
        bulan = "Mei";
        break;
      case 5:
        bulan = "Juni";
        break;
      case 6:
        bulan = "Juli";
        break;
      case 7:
        bulan = "Agustus";
        break;
      case 8:
        bulan = "September";
        break;
      case 9:
        bulan = "Oktober";
        break;
      case 10:
        bulan = "November";
        break;
      case 11:
        bulan = "Desember";
        break;
    }
    var tampilTanggal =
      tanggal + " " + bulan + " " + tahun + ` ${jam}:${menit}:${detik}`;

    return tampilTanggal;
  };
  const handleLogout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      await logout();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const mini = async () => {
    var value = document.getElementById("body").classList.value;
    if (value == "sidebar-mini") {
      document.getElementById("body").classList.remove("sidebar-mini");
      document.getElementById("body").classList.add("sidebar-show");
    } else if (value == "sidebar-gone") {
      document.getElementById("body").classList.remove("sidebar-gone");
      document.getElementById("body").classList.add("sidebar-show");
    } else {
      document.getElementById("body").classList.remove("sidebar-show");
      document.getElementById("body").classList.add("sidebar-mini");
    }
  };

  useEffect(() => {
    getNotification();
  }, []);
  return (
    <>
      <nav className="navbar  navbar-expand-lg main-navbar">
        <form className="form-inline mr-auto">
          <ul className="navbar-nav mr-3">
            <li>
              <a
                href="#"
                onClick={mini}
                data-toggle="sidebar"
                className="nav-link nav-link-lg"
              >
                <i className="fas fa-bars" />
              </a>
            </li>
            <li>
              <a
                href="#"
                data-toggle="search"
                className="nav-link nav-link-lg d-sm-none"
              >
                <i className="fas fa-search" />
              </a>
            </li>
          </ul>
        </form>
        <ul className="navbar-nav navbar-right">
          {user?.roles?.[0]?.name === "admin" && (
            <li className="dropdown dropdown-list-toggle">
              <a
                href="#"
                data-toggle="dropdown"
                className={`nav-link notification-toggle nav-link-lg ${beep ? "beep" : ""
                  }`}
              >
                <i className="far fa-bell" />
              </a>
              <div className="dropdown-menu dropdown-list dropdown-menu-right">
                <div className="dropdown-header">
                  Notifications
                  <div className="float-right">
                    {/* <a href="#">Mark All As Read</a> */}
                  </div>
                </div>
                <div
                  className="dropdown-list-content dropdown-list-icons"
                  tabIndex={3}
                >
                  {notifications.map((data) => {
                    return (
                      <a
                        href={
                          data.type === "pengaduan"
                            ? `/admin-pengaduan/${data.id}`
                            : data.type === "konseling"
                              ? `/admin-konseling/${data.id}`
                              : `/admin-informasi/${data.id}`
                        }
                        className={`dropdown-item dropdown-item-unread ${data.respon ? "" : "beep"
                          }`}
                        key={data.id}
                      >
                        <div className="dropdown-item-icon bg-primary text-white">
                          {data.type === "pengaduan" ? (
                            <i className="fas fa-envelope"></i>
                          ) : data.type === "konseling" ? (
                            <i className="fas fa-user-md"></i>
                          ) : (
                            <i className="fas fa-bullhorn"></i>
                          )}
                        </div>
                        <div className="dropdown-item-desc">
                          {data.user.name} memberi {data.type}
                          <div className="time text-primary">
                            {getDate(data.created_at)}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div
                  className={`dropdown-footer text-center ${beep ? "beep" : ""
                    }`}
                >
                  {notifications.length >= 5 && (
                    <a href="#">
                      View All <i className="fas fa-chevron-right" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          )}

          <li className="dropdown">
            <>
              {" "}
              {loading ? (
                <span className="text-white">Tunggu sebentar ... </span>
              ) : (
                <>
                  <a
                    href="#"
                    data-toggle="dropdown"
                    className="nav-link dropdown-toggle nav-link-lg nav-link-user"
                  >
                    <div className="d-sm-none d-lg-inline-block text-capitalize">
                      Hi, {user.name}
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    Role : {user?.roles?.[0]?.name}

                    <Link
                      to="/change-password"
                      className="dropdown-item has-icon"
                    >
                      <i className="fas fa-cog" /> Pengaturan
                    </Link>
                    <div className="dropdown-divider" />
                    <a
                      onClick={handleLogout}
                      className="dropdown-item has-icon text-danger"
                    >
                      <i className="fas fa-sign-out-alt" /> Keluar
                    </a>
                  </div>
                </>
              )}
            </>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Header;
