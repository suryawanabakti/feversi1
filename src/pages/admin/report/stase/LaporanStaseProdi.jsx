"use client";

import { useState, useEffect } from "react";
import axios from "../../../../api/axios";
import baseurl from "../../../../api/baseurl";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import useAuthContext from "../../../../context/AuthContext";
import { Spinner, Badge, Card, Row, Col, Modal, Button } from "react-bootstrap";

export default function LaporanStaseProdi() {
  const { user } = useAuthContext();
  const [dataProdi, setDataProdi] = useState([]);
  const [prodi, setProdi] = useState("");
  const [bulan, setBulan] = useState("");
  const [format, setFormat] = useState("pdf");
  const [tahun, setTahun] = useState("");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [prodiResiden, setProdiResiden] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState("");

  const getDataProdi = async () => {
    try {
      const res = await axios.get("/api/biodata/get-prodi");
      setDataProdi(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat data Prodi");
    }
  };

  const getTahunAjaran = async () => {
    try {
      const res = await axios.get("/api/tahun");
      setTahunAjaran(res.data);
    } catch (err) {
      toast.error("Gagal memuat data tahun ajaran");
    }
  };

  const handlePrint = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Memuat data laporan...");
    setProcessing(true);

    try {
      const res = await axios.get(
        `/api/laporan-stase-prodi/${prodi ? prodi : "semua"}/${bulan ? bulan : "semua"
        }/${tahun ? tahun : "semua"}`
      );

      setResults(res.data);

      if (res.data.length > 0) {
        toast.success("Berhasil memuat data laporan");
        setTimeout(() => {
          window.scroll(0, 400);
        }, 100);
      } else {
        toast.error("Data tidak ditemukan untuk kriteria yang dipilih");
      }
    } catch (err) {
      console.log(err);
      toast.error("Gagal memuat data laporan");
    }

    setProcessing(false);
    toast.remove(toastId);
  };

  const detailResidenByProdi = async (rsId, rsName) => {
    const toastId = toast.loading("Memuat detail residen...");
    setSelectedProdi(`${rsName}`);

    try {
      const res = await axios.get(
        `/api/laporan-stase-prodi/${prodi ? prodi : "semua"}/${bulan ? bulan : "semua"
        }/${tahun ? tahun : "semua"}/${rsId}`
      );

      setProdiResiden(res.data);
      setShowModal(true);
      toast.success("Detail residen berhasil dimuat");
    } catch (e) {
      toast.error("Gagal memuat detail residen");
    }

    toast.remove(toastId);
  };

  const handleDownloadReport = () => {
    const url = `${baseurl}/api/laporan-stase-prodi/${prodi}/${bulan}/${tahun}/${format}/cetak`;
    window.open(url, "_blank");
    toast.success(`Laporan ${format.toUpperCase()} sedang diunduh`);
  };

  const resetForm = () => {
    setBulan("");
    setTahun("");
    setProdi("");
    setFormat("pdf");
    setResults([]);
  };

  useEffect(() => {
    getTahunAjaran();
    getDataProdi();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        {/* Header Section */}
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-chart-bar text-primary me-2"></i>
              Laporan Stase Berdasarkan Prodi
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Laporan Stase Prodi
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex gap-2">
            <Badge bg="info" className="fs-6">
              <i className="fas fa-user me-1"></i>
              {user.name}
            </Badge>
          </div>
        </div>

        <div className="section-body">
          {/* Filter Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-gradient-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filter Laporan Berdasarkan Prodi
              </h5>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handlePrint}>
                <Row>
                  <Col md={6}>
                    <div className="form-group mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-graduation-cap me-1 text-success"></i>
                        Program Studi <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        onChange={(e) => setProdi(e.target.value)}
                        value={prodi}
                      >
                        <option value="">Pilih Program Studi</option>
                        {dataProdi.map((data) => (
                          <option value={data.value} key={data.value}>
                            {data.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-calendar-alt me-1 text-info"></i>
                        Tahun <span className="text-danger">*</span>
                      </label>
                      <select
                        required
                        className="form-select"
                        onChange={(e) => setTahun(e.target.value)}
                        value={tahun}
                      >
                        <option value="">Pilih Tahun</option>
                        {tahunAjaran.map((data) => (
                          <option key={data.id} value={data.tahun}>
                            {data.tahun}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-calendar me-1 text-warning"></i>
                        Bulan <span className="text-danger">*</span>
                      </label>
                      <select
                        required
                        className="form-select"
                        onChange={(e) => setBulan(e.target.value)}
                        value={bulan}
                      >
                        <option value="">Pilih Bulan</option>
                        <option value="Januari">Januari</option>
                        <option value="Februari">Februari</option>
                        <option value="Maret">Maret</option>
                        <option value="April">April</option>
                        <option value="Mei">Mei</option>
                        <option value="Juni">Juni</option>
                        <option value="July">Juli</option>
                        <option value="Agustus">Agustus</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                      </select>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-file-alt me-1 text-danger"></i>
                        Format <span className="text-danger">*</span>
                      </label>
                      <select
                        required
                        className="form-select"
                        onChange={(e) => setFormat(e.target.value)}
                        value={format}
                      >
                        <option value="pdf">
                          <i className="fas fa-file-pdf"></i> PDF
                        </option>
                        <option value="excel">
                          <i className="fas fa-file-excel"></i> Excel
                        </option>
                      </select>
                    </div>
                  </Col>
                </Row>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Memuat...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Generate Laporan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                  >
                    <i className="fas fa-refresh me-2"></i>
                    Reset
                  </button>
                </div>
              </form>
            </Card.Body>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-muted">
                  <i className="fas fa-chart-bar me-2"></i>
                  Hasil Laporan - {bulan} / {tahun}
                </h4>
                <button
                  className="btn btn-success"
                  onClick={handleDownloadReport}
                  disabled={processing}
                >
                  <i className="fas fa-download me-2"></i>
                  Download {format.toUpperCase()}
                </button>
              </div>
            </div>
          )}

          {results.map((data, index) => (
            <Card key={index} className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-gradient-success text-white d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    <i className="fas fa-graduation-cap me-2"></i>
                    {data.prodi}
                  </h5>
                  <small className="opacity-75">
                    Periode: {bulan} / {tahun}
                  </small>
                </div>
                <div className="text-end">
                  <Badge bg="light" text="dark" className="fs-6">
                    <i className="fas fa-users me-1"></i>
                    {data.jumlahResiden} Residen
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th width="50" className="text-center">
                          #
                        </th>
                        <th>
                          <i className="fas fa-hospital me-1 text-primary"></i>
                          Rumah Sakit
                        </th>
                        <th width="150" className="text-center">
                          <i className="fas fa-users me-1 text-success"></i>
                          Jumlah Residen
                        </th>
                        <th width="120" className="text-center">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.rumahSakits?.map((d, rsIndex) => (
                        <tr key={d.id}>
                          <td className="text-center fw-bold text-muted">
                            {rsIndex + 1}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                <i className="fas fa-hospital text-white"></i>
                              </div>
                              <span className="fw-medium">{d.name}</span>
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge bg="success" className="fs-6">
                              {d.jumlahResiden} orang
                            </Badge>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => detailResidenByProdi(d.id, d.name)}
                              title="Lihat Detail Residen"
                            >
                              <i className="fas fa-eye me-1"></i>
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Empty State */}
          {results.length === 0 && !processing && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Belum Ada Data Laporan</h5>
                <p className="text-muted">
                  Silakan pilih kriteria filter dan klik "Generate Laporan"
                  untuk melihat data.
                </p>
              </Card.Body>
            </Card>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton className="bg-gradient-primary text-white">
          <Modal.Title>
            <i className="fas fa-users me-2"></i>
            Detail Residen - {selectedProdi}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th width="50" className="text-center">
                    #
                  </th>
                  <th width="120">NIM</th>
                  <th>Nama Residen</th>
                  <th width="100" className="text-center">
                    Tahap
                  </th>
                  <th width="120" className="text-center">
                    Jam Kerja/Minggu
                  </th>
                  <th width="100" className="text-center">
                    File
                  </th>
                  <th width="150">Serkom</th>
                </tr>
              </thead>
              <tbody>
                {prodiResiden.map((data, index) => (
                  <tr key={data.id}>
                    <td className="text-center fw-bold">{index + 1}</td>
                    <td>
                      <Link
                        to={`/residen/biodata/${data.user?.id}`}
                        className="text-decoration-none fw-bold text-primary"
                      >
                        {data.user?.username || "-"}
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-success rounded-circle d-flex align-items-center justify-content-center me-2">
                          <i className="fas fa-user text-white"></i>
                        </div>
                        <span className="fw-medium">
                          {data.user?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <Badge bg="info">{data.tahap}</Badge>
                    </td>
                    <td className="text-center">
                      <Badge
                        bg={
                          (data.jam_kerja || 0) >= 40
                            ? "success"
                            : (data.jam_kerja || 0) >= 20
                              ? "warning"
                              : "danger"
                        }
                        className="fs-6"
                      >
                        <i className="fas fa-clock me-1"></i>
                        {data.jam_kerja || 0} jam
                      </Badge>
                    </td>
                    <td className="text-center">
                      {data.stase?.file ? (
                        <a
                          target="_blank"
                          href={`${baseurl}/storage/${data.stase.file}`}
                        >
                          File
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {data.user?.serkom?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {data.user.serkom.map((serkom) => (
                            <a
                              href={`${baseurl}/storage/serkom/${serkom.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                              key={serkom.id}
                              title={serkom.name}
                            >
                              <i className="fas fa-file-alt me-1"></i>
                              {serkom.name}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">
                          <i className="fas fa-minus"></i> Tidak ada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="fas fa-times me-1"></i>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
        .bg-gradient-success {
          background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        }
        .avatar-sm {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
