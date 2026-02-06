import { Link, useLocation } from "react-router-dom";
import useAuthContext from "../../context/AuthContext";
import { useState } from "react";

const Sidebar = () => {
  const { user } = useAuthContext();

  const location = useLocation();
  const [openMasterData, setOpenMasterData] = useState(true);
  const [openLaporan, setOpenLaporan] = useState(false);
  const { pathname } = location;
  const splitLocation = pathname.split("/");

  const handleOpenMasterData = () => {
    setOpenMasterData(!openMasterData);
    if (openLaporan) {
      setOpenLaporan(false);
    }
  };

  const handleOpenLaporan = () => {
    setOpenLaporan(!openLaporan);

    setOpenMasterData(false);

    setOpenLayanan(false);
  };

  const [openLayanan, setOpenLayanan] = useState(false);
  const handleOpenLayanan = () => {
    setOpenLayanan(!openLayanan);

    setOpenLaporan(false);

    setOpenMasterData(false);
  };

  const handleCloseList = () => {
    setOpenLaporan(false);
    setOpenMasterData(false);
    setOpenLayanan(false);
  };
  return (
    <div className="main-sidebar sidebar-style-2">
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand">
          <a href="#" className="items-center">
            <img src="/images/logo-unhas.png" alt="" width={40} />
            BANK-DATA PPPDS
          </a>
        </div>
        <div className="sidebar-brand sidebar-brand-sm">
          <img src="/images/logo-unhas.png" alt="" width={40} />
        </div>
        <ul className="sidebar-menu">
          <li className="menu-header">
            {user?.roles?.[0]?.name === "admin" && <>Menu Admin</>}{" "}
            {user?.roles?.[0]?.name === "residen" && <>Menu Residen</>}
            {user?.roles?.[0]?.name === "prodi" && <>Menu Prodi</>}
          </li>
          {user?.roles?.[0]?.name !== "staser" && (
            <li className={splitLocation[1] == "dashboard" ? "active" : ""}>
              <Link
                className="nav-link"
                to="/dashboard"
                onClick={(e) => handleCloseList()}
              >
                <i className="fa fa-fire" />
                <span>Dashboard</span>
              </Link>
            </li>
          )}

          {user?.roles?.[0]?.name == "admin" && (
            <>
              <li className={`dropdown ${openMasterData && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenMasterData()}
                >
                  <i className="fas fa-database" />
                  <span>Master Data</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openMasterData ? { display: "block" } : { display: "none" }
                  }
                >
                  <li className={splitLocation[1] == "residen" ? "active" : ""}>
                    <Link className="nav-link" to="/residen">
                      {/* <i className="fas fa-users" /> */}
                      <span>Residen</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "users" ? "active" : ""}>
                    <Link className="nav-link" to="/users">
                      <span>Users</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "alumni" ? "active" : ""}>
                    <Link className="nav-link" to="/alumni">
                      {/* <i className="fas fa-graduation-cap"></i> */}
                      <span>Alumni</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "dosen" ? "active" : ""}>
                    <Link className="nav-link" to="/dosen">
                      {/* <i className="fas fa-chalkboard-teacher"></i> */}
                      <span>Dosen</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "prodi" ? "active" : ""}>
                    <Link className="nav-link" to="/prodi">
                      {/* <i className="fas fa-university"></i> */}
                      <span>Prodi</span>
                    </Link>
                  </li>
                  <li
                    className={splitLocation[1] == "rumahsakit" ? "active" : ""}
                  >
                    <Link className="nav-link" to="/rumahsakit">
                      {/* <i className="fas fa-hospital"></i> */}
                      <span>Rumah Sakit</span>
                    </Link>
                  </li>

                  <li
                    className={
                      splitLocation[1] == "residen-exit" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/residen-exit">
                      {/* <i className="fas fa-users" /> */}
                      <span>Residen Keluar</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "format" ? "active" : ""}>
                    <Link className="nav-link" to="/format">
                      {/* <i className="fas fa-chalkboard-teacher"></i> */}
                      <span>Format</span>
                    </Link>
                  </li>

                  {/* <li
                    className={
                      splitLocation[1] == "pelanggaran" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/pelanggaran">
                      <span>Pelanggaran</span>
                    </Link>
                  </li> */}
                </ul>
              </li>
            </>
          )}

          {user?.roles?.[0]?.name == "residen" && (
            <>
              <li className="menu-header">DATA RESIDEN</li>
              <li className={splitLocation[1] == "biodata" ? "active" : ""}>
                <Link
                  className="nav-link"
                  to="/biodata"
                  onClick={(e) => handleCloseList()}
                >
                  <i className="far fa-file-alt"></i>
                  <span>Biodata</span>
                </Link>
              </li>
              <li className={`dropdown ${openLaporan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLaporan()}
                >
                  <i className="fas fa-database" />
                  <span>Data Upload</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLaporan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li className={splitLocation[1] == "krs" ? "active" : ""}>
                    <Link className="nav-link" to="/krs">
                      <span>KRS </span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "khs" ? "active" : ""}>
                    <Link className="nav-link" to="/khs">
                      <span>KHS </span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "spp" ? "active" : ""}>
                    <Link className="nav-link" to="/spp">
                      <span>SPP</span>
                    </Link>
                  </li>

                  <li
                    className={
                      splitLocation[1] == "berita-acara-ujian" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/berita-acara-ujian">
                      <span>Berita Acara Ujian</span>
                    </Link>
                  </li>

                  <li className={splitLocation[1] == "abstrak" ? "active" : ""}>
                    <Link className="nav-link" to="/abstrak">
                      <span>Abstrak Jurnal Publikasi</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "serkom" ? "active" : ""}>
                    <Link className="nav-link" to={`/serkom`}>
                      <span>Sertifikat Kompetensi</span>
                    </Link>
                  </li>

                  <li
                    className={splitLocation[1] == "prestasi" ? "active" : ""}
                  >
                    <Link className="nav-link" to="/prestasi">
                      <span>Prestasi</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}

          {user?.roles?.[0]?.name == "prodi" && (
            <>
              <li className="menu-header">Prodi Menu</li>
              <li className={splitLocation[1] == "residen" ? "active" : ""}>
                <Link className="nav-link" to="/residen">
                  <i className="fas fa-users" />
                  <span>Residen</span>
                </Link>
              </li>

              <li
                className={
                  splitLocation[1] == "pelanggaran-residen" ? "active" : ""
                }
              >
                <Link
                  className="nav-link"
                  to="/pelanggaran-residen"
                  onClick={(e) => handleCloseList()}
                >
                  <i className="fas fa-file" />
                  <span>Pelanggaran Residen</span>
                </Link>
              </li>

              <li
                className={splitLocation[1] == "stase-create" ? "active" : ""}
              >
                <Link className="nav-link" to="/stase-create">
                  <i className="far fa-file-alt"></i>
                  <span>Buat Stase</span>
                </Link>
              </li>
              <li className={splitLocation[1] == "stase" ? "active" : ""}>
                <Link className="nav-link" to="/stase">
                  <i className="far fa-file-alt"></i>
                  <span>Daftar Stase</span>
                </Link>
              </li>
              <li className={splitLocation[1] == "dosen" ? "active" : ""}>
                <Link className="nav-link" to="/dosen">
                  <i className="fas fa-chalkboard-teacher"></i>
                  <span>Dosen</span>
                </Link>
              </li>
              <li className={splitLocation[1] == "alumni" ? "active" : ""}>
                <Link className="nav-link" to="/alumni">
                  <i className="fas fa-graduation-cap"></i>
                  <span>Alumni</span>
                </Link>
              </li>
              <li
                className={splitLocation[1] == "residen-exit" ? "active" : ""}
              >
                <Link className="nav-link" to="/residen-exit">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Residen Exit</span>
                </Link>
              </li>

              <li className={`dropdown ${openLaporan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLaporan()}
                >
                  <i className="fas fa-file-pdf" />
                  <span>Laporan</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLaporan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li
                    className={
                      splitLocation[1] == "lewat-masa-studi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/lewat-masa-studi">
                      <span>Lewat Masa Studi</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-provinsi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-provinsi">
                      <span>Provinsi</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-kabupaten" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-kabupaten">
                      <span>Kabupaten Kota</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}
          {user?.roles?.[0]?.name == "kepala" && (
            <>
              <li className={`dropdown ${openLayanan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLayanan()}
                >
                  <i className="fas fa-user-md"></i>
                  <span>Layanan</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLayanan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li
                    className={
                      splitLocation[1] == "admin-pengaduan" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="admin-pengaduan">
                      <span>Saran / Pengaduan</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "admin-konseling" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/admin-konseling">
                      <span>Konseling</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}
          {user?.roles?.[0]?.name == "admin" && (
            <>
              {" "}
              <li className={`dropdown ${openLaporan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLaporan()}
                >
                  <i className="fas fa-file-pdf" />
                  <span>Laporan</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLaporan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li
                    className={
                      splitLocation[1] == "report-residen" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-residen">
                      <span>Residen</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-tracer-alumni" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-tracer-alumni">
                      <span>Tracer Alumni</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-dosen" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-dosen">
                      <span>Dosen</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-prodi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-prodi">
                      <span>Prodi</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-stase" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-stase">
                      <span>Stase RS</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-stase-prodi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-stase-prodi">
                      <span>Stase Prodi</span>
                    </Link>
                  </li>

                  <li
                    className={
                      splitLocation[1] == "report-provinsi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-provinsi">
                      <span>Provinsi</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-kabupaten" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-kabupaten">
                      <span>Kabupaten Kota</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "admin-prestasi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/admin-prestasi">
                      <span>Prestasi</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "str-sip" ? "active" : ""}>
                    <Link className="nav-link" to="/str-sip">
                      <span>Dokumen Residen</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "lewat-masa-studi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/lewat-masa-studi">
                      <span>Lewat Masa Studi</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "admin-berita-acara-ujian"
                        ? "active"
                        : ""
                    }
                  >
                    <Link className="nav-link" to="/admin-berita-acara-ujian">
                      <span>Berita Acara Ujian</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "report-residen-exit" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-residen-exit">
                      <span>Residen Keluar</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li className={`dropdown ${openLayanan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLayanan()}
                >
                  <i className="fas fa-user-md"></i>
                  <span>Layanan</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLayanan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li
                    className={
                      splitLocation[1] == "admin-informasi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="admin-informasi">
                      <span>Informasi</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}
          {user?.roles?.[0]?.name == "admin" && (
            <li
              className={
                splitLocation[1] == "pelanggaran-residen" ? "active" : ""
              }
            >
              <Link
                className="nav-link"
                to="/pelanggaran-residen"
                onClick={(e) => handleCloseList()}
              >
                <i className="fas fa-ban" />
                <span>Pelanggaran Residen</span>
              </Link>
            </li>
          )}
          {/* {user?.roles?.[0]?.name == "admin" && (
            <li
              className={
                splitLocation[1] == "residen-comparison" ? "active" : ""
              }
            >
              <Link
                className="nav-link"
                to="/residen-comparison"
                onClick={(e) => handleCloseList()}
              >
                <i className="fa fa-balance-scale" />
                <span>Perbandingan Residen</span>
              </Link>
            </li>
          )}
          {user?.roles?.[0]?.name == "admin" && (
            <li
              className={splitLocation[1] == "dosen-comparison" ? "active" : ""}
            >
              <Link
                className="nav-link"
                to="/dosen-comparison"
                onClick={(e) => handleCloseList()}
              >
                <i className="fa fa-balance-scale" />
                <span>Perbandingan Dosen</span>
              </Link>
            </li>
          )} */}

          {user?.roles?.[0]?.name == "staser" && (
            <>
              {" "}
              <li className={`dropdown ${openLaporan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLaporan()}
                >
                  <i className="fas fa-file-pdf" />
                  <span>Laporan</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLaporan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li
                    className={
                      splitLocation[1] == "report-stase" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/report-stase">
                      <span>Stase</span>
                    </Link>
                  </li>
                  <li className={splitLocation[1] == "str-sip" ? "active" : ""}>
                    <Link className="nav-link" to="/str-sip">
                      <span>Dokumen Residen</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}

          {user?.roles?.[0]?.name == "residen" && (
            <>
              <li className={`dropdown ${openLayanan && "active"}`}>
                <a
                  href="#"
                  className="nav-link has-dropdown"
                  onClick={(e) => handleOpenLayanan()}
                >
                  <i className="fas fa-user-md"></i>
                  <span>Layanan</span>
                </a>
                <ul
                  className="dropdown-menu"
                  style={
                    openLayanan ? { display: "block" } : { display: "none" }
                  }
                >
                  <li
                    className={
                      splitLocation[1] == "residen-informasi" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="residen-informasi">
                      <span>Informasi</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "residen-pengaduan" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="residen-pengaduan">
                      <span>Pengaduan</span>
                    </Link>
                  </li>
                  <li
                    className={
                      splitLocation[1] == "residen-konseling" ? "active" : ""
                    }
                  >
                    <Link className="nav-link" to="/residen-konseling">
                      <span>Konseling</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}

          <li className="menu-header">INFORMASI</li>
          {user?.roles?.[0]?.name == "residen" && (
            <li className={splitLocation[1] == "format" ? "active" : ""}>
              <Link
                className="nav-link"
                to="/format"
                onClick={(e) => handleCloseList()}
              >
                <i className="fas fa-info"></i>
                <span>Daftar Format</span>
              </Link>
            </li>
          )}

          <li className={splitLocation[1] == "bagan" ? "active" : ""}>
            <Link
              className="nav-link"
              to="/bagan"
              onClick={(e) => handleCloseList()}
            >
              <i className="fas fa-project-diagram"></i>
              <span>Struktur Organisasi</span>
            </Link>
          </li>

          {/* <li className="menu-header">Pengaturan</li> */}
          <li className={splitLocation[1] == "change-password" ? "active" : ""}>
            <Link
              className="nav-link"
              to="/change-password"
              onClick={(e) => handleCloseList()}
            >
              <i className="fas fa-key"></i>
              <span>Ganti Password</span>
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
