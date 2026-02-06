import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import baseurl from "../../../api/baseurl";
import { Spinner } from "react-bootstrap";
import "./residen-biodata-styles.css";
const AlumniBiodata = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  const getResiden = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/residen/biodata/" + id);
      setData(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal mengambil data residen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getResiden();
  }, []);

  const DocumentLink = ({ path, filename, type }) => {
    if (!filename) return <span className="text-muted">Tidak tersedia</span>;

    return (
      <a
        href={`${baseurl}/storage/${type}/${filename}`}
        target="_blank"
        rel="noopener noreferrer"
        className="document-link"
      >
        <i className="fas fa-file-alt mr-2"></i>
        <span>Lihat Dokumen</span>
      </a>
    );
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h1>Biodata Residen</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/residen">Residen</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Biodata
                </li>
              </ol>
            </nav>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            <i className="fas fa-arrow-left mr-2"></i>Kembali
          </button>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h5 className="text-muted">Memuat data residen...</h5>
            </div>
          </div>
        ) : !data || Object.keys(data).length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Data Tidak Tersedia</h2>
                <p className="lead">Residen ini belum mengisi biodata</p>
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => navigate(-1)}
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-12">
                <div className="card profile-widget">
                  <div className="profile-widget-header">
                    {data.pas_foto ? (
                      <img
                        src={`${baseurl}/storage/pasfoto/${data.pas_foto}`}
                        alt="Foto Profil"
                        className="rounded-circle profile-widget-picture"
                      />
                    ) : (
                      <div className="profile-widget-picture profile-widget-picture-default">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                    <div className="profile-widget-items">
                      <div className="profile-widget-item">
                        <div className="profile-widget-item-label">NIM</div>
                        <div className="profile-widget-item-value">
                          {data.user?.username || "-"}
                        </div>
                      </div>
                      <div className="profile-widget-item">
                        <div className="profile-widget-item-label">
                          Program Studi
                        </div>
                        <div className="profile-widget-item-value">
                          {data.prodi?.name || "-"}
                        </div>
                      </div>
                      <div className="profile-widget-item">
                        <div className="profile-widget-item-label">
                          Tahun Masuk
                        </div>
                        <div className="profile-widget-item-value">
                          {data.tahunmasuk || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-widget-description pb-0">
                    <div className="profile-widget-name">
                      {data.user?.name || "-"}
                      <div className="text-muted d-inline font-weight-normal">
                        <div className="slash"></div> Residen
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h4>Dokumen dan Informasi Residen</h4>
                    <div className="card-header-action">
                      <div className="btn-group">
                        <Link
                          to={`/residen/khs/${id}`}
                          className="btn btn-info"
                        >
                          <i className="fas fa-file-alt mr-1"></i> KHS
                        </Link>
                        <Link
                          to={`/residen/krs/${id}`}
                          className="btn btn-info"
                        >
                          <i className="fas fa-file-alt mr-1"></i> KRS
                        </Link>
                        <Link
                          to={`/residen/spp/${id}`}
                          className="btn btn-info"
                        >
                          <i className="fas fa-money-bill mr-1"></i> SPP
                        </Link>
                        <Link
                          to={`/residen/ujian/${id}`}
                          className="btn btn-info"
                        >
                          <i className="fas fa-clipboard-list mr-1"></i> Ujian
                        </Link>
                        <div className="dropdown">
                          <button
                            className="btn btn-info dropdown-toggle"
                            type="button"
                            id="dropdownMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            Lainnya
                          </button>
                          <div
                            className="dropdown-menu"
                            aria-labelledby="dropdownMenuButton"
                          >
                            <Link
                              to={`/residen/prestasi/${id}`}
                              className="dropdown-item"
                            >
                              <i className="fas fa-trophy mr-2"></i> Prestasi
                            </Link>
                            <Link
                              to={`/residen/abstrak/${id}`}
                              className="dropdown-item"
                            >
                              <i className="fas fa-book mr-2"></i> Abstrak
                              Jurnal
                            </Link>
                            <Link
                              to={`/residen/serkom/${id}`}
                              className="dropdown-item"
                            >
                              <i className="fas fa-certificate mr-2"></i>{" "}
                              Sertifikat Kompetensi
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "personal" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("personal")}
                          role="tab"
                        >
                          <i className="fas fa-user mr-2"></i>
                          Data Pribadi
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "education" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("education")}
                          role="tab"
                        >
                          <i className="fas fa-graduation-cap mr-2"></i>
                          Pendidikan
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "documents" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("documents")}
                          role="tab"
                        >
                          <i className="fas fa-file mr-2"></i>
                          Dokumen
                        </a>
                      </li>
                    </ul>

                    <div className="tab-content p-3">
                      {/* Tab Data Pribadi */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "personal" ? "show active" : ""
                        }`}
                      >
                        <div className="table-responsive">
                          <table className="table table-bordered table-striped">
                            <tbody>
                              <tr>
                                <th width="30%">Nama Lengkap</th>
                                <td>{data.user?.name || "-"}</td>
                              </tr>
                              <tr>
                                <th>NIM</th>
                                <td>{data.user?.username || "-"}</td>
                              </tr>
                              <tr>
                                <th>Jenis Kelamin</th>
                                <td>{data.jenis_kelamin || "-"}</td>
                              </tr>
                              <tr>
                                <th>Tanggal Lahir</th>
                                <td>{data.tanggal_lahir || "-"}</td>
                              </tr>
                              <tr>
                                <th>Alamat</th>
                                <td>{data.alamat || "-"}</td>
                              </tr>
                              <tr>
                                <th>Nomor Telepon</th>
                                <td>{data.no_hp || "-"}</td>
                              </tr>
                              <tr>
                                <th>Email</th>
                                <td>{data.email || "-"}</td>
                              </tr>
                              <tr>
                                <th>NIK</th>
                                <td>{data.nik || "-"}</td>
                              </tr>
                              <tr>
                                <th>NPWP</th>
                                <td>
                                  {data.npwp !== "null" ? data.npwp : "-"}
                                </td>
                              </tr>
                              <tr>
                                <th>Nomor Rekening</th>
                                <td>{data.no_rekening || "-"}</td>
                              </tr>
                              <tr>
                                <th>Rekomendasi Asal</th>
                                <td>
                                  {data.provinsi && data.kabupaten
                                    ? `${data.provinsi.nama} - ${data.kabupaten.nama}`
                                    : "-"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tab Pendidikan */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "education" ? "show active" : ""
                        }`}
                      >
                        <div className="table-responsive">
                          <table className="table table-bordered table-striped">
                            <tbody>
                              <tr>
                                <th width="30%">Program Studi</th>
                                <td>{data.prodi?.name || "-"}</td>
                              </tr>
                              <tr>
                                <th>Tahun Masuk</th>
                                <td>{data.tahunmasuk || "-"}</td>
                              </tr>
                              <tr>
                                <th>Semester</th>
                                <td>{data.semester || "-"}</td>
                              </tr>
                              <tr>
                                <th>Asal Fakultas Kedokteran</th>
                                <td>{data.asal_fk || "-"}</td>
                              </tr>
                              <tr>
                                <th>Akreditasi</th>
                                <td>
                                  {data.akreditasi ? (
                                    <span
                                      className={`badge badge-${
                                        data.akreditasi === "A"
                                          ? "success"
                                          : data.akreditasi === "B"
                                          ? "info"
                                          : data.akreditasi === "C"
                                          ? "warning"
                                          : "secondary"
                                      }`}
                                    >
                                      {data.akreditasi}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th>IPK</th>
                                <td>{data.ipk || "-"}</td>
                              </tr>
                              <tr>
                                <th>Tempat Kerja Sebelumnya</th>
                                <td>{data.tempat_kerja_sebelumnya || "-"}</td>
                              </tr>
                              <tr>
                                <th>Tempat Kerja Sekarang</th>
                                <td>{data.tempat_bertugas}</td>
                              </tr>
                              <tr>
                                <th>Status Pembiayaan</th>
                                <td>
                                  {data.status_pembiyaan ? (
                                    <span
                                      className={`badge badge-${
                                        data.status_pembiyaan === "beasiswa"
                                          ? "success"
                                          : data.status_pembiyaan === "mandiri"
                                          ? "primary"
                                          : "info"
                                      }`}
                                    >
                                      {data.status_pembiyaan === "beasiswa"
                                        ? `${data.status_pembiyaan} - ${data.beasiswa}`
                                        : data.status_pembiyaan}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                              {data.beasiswa_dll && (
                                <tr>
                                  <th>Beasiswa Lain-lain</th>
                                  <td>{data.beasiswa_dll}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tab Dokumen */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "documents" ? "show active" : ""
                        }`}
                      >
                        <div className="row">
                          <div className="col-md-6">
                            <div className="table-responsive">
                              <table className="table table-bordered table-striped">
                                <tbody>
                                  <tr>
                                    <th width="40%">KTP</th>
                                    <td>
                                      <DocumentLink
                                        type="ktp"
                                        filename={data.ktp}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Akte Lahir</th>
                                    <td>
                                      <DocumentLink
                                        type="akte"
                                        filename={data.akte}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Kartu Keluarga</th>
                                    <td>
                                      <DocumentLink
                                        type="kartukeluarga"
                                        filename={data.kartu_keluarga}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Bukti Lulus</th>
                                    <td>
                                      <DocumentLink
                                        type="buktilulus"
                                        filename={data.bukti_lulus}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Ijazah Terakhir</th>
                                    <td>
                                      <DocumentLink
                                        type="ijazahterakhir"
                                        filename={data.ijazah_terakhir}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>SK PNS</th>
                                    <td>
                                      <DocumentLink
                                        type="skpns"
                                        filename={data.sk_pns}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>SK Penerima Beasiswa</th>
                                    <td>
                                      <DocumentLink
                                        type="skpenerimabeasiswa"
                                        filename={data.sk_penerima_beasiswa}
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="table-responsive">
                              <table className="table table-bordered table-striped">
                                <tbody>
                                  <tr>
                                    <th width="40%">Bukti Rekomendasi Asal</th>
                                    <td>
                                      <DocumentLink
                                        type="buktirekomendasiasal"
                                        filename={data.bukti_rekomendasi_asal}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>BPJS</th>
                                    <td>
                                      <DocumentLink
                                        type="bpjs"
                                        filename={data.bpjs}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>SIP</th>
                                    <td>
                                      <DocumentLink
                                        type="sip"
                                        filename={data.sip}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>STR</th>
                                    <td>
                                      <DocumentLink
                                        type="str"
                                        filename={data.str}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Pas Foto</th>
                                    <td>
                                      <DocumentLink
                                        type="pasfoto"
                                        filename={data.pas_foto}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Nilai TOEFL</th>
                                    <td>
                                      <DocumentLink
                                        type="nilaitoefl"
                                        filename={data.nilai_toefl}
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AlumniBiodata;
