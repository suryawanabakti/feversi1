"use client"

import { useEffect, useState } from "react"
// DataGrid import removed
import axios from "../../../api/axios"
import { Link, useParams } from "react-router-dom"
import { Spinner, Badge, Card, Row, Col } from "react-bootstrap"
import { toast } from "react-hot-toast"

const ShowStase = () => {
  const { id } = useParams()
  const [residenStase, setResidenStase] = useState([])
  const [namaStase, setNamaStase] = useState("")
  const [rumahSakit, setRumahSakit] = useState("")
  const [file, setFile] = useState("")
  const [loading, setLoading] = useState(true)
  const [staseData, setStaseData] = useState({})

  const getStase = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/stase/" + id)
      console.log(res)
      setNamaStase(res.data.data.bulan + "/" + res.data.data.tahun)
      setResidenStase(res.data.data.staseresiden)
      setRumahSakit(res.data.data.rumahsakit.name)
      setFile(res.data.data.file)
      setStaseData(res.data.data)
    } catch (err) {
      toast.error("Gagal memuat data stase")
    } finally {
      setLoading(false)
    }
  }

  // Calculate total jam kerja
  const totalJamKerja = residenStase.reduce((total, residen) => {
    return total + (residen.jam_kerja || 0)
  }, 0)

  // Calculate average jam kerja
  const averageJamKerja = residenStase.length > 0 ? (totalJamKerja / residenStase.length).toFixed(1) : 0

  // Columns definition removed as we are using custom table

  const handleDownloadFile = () => {
    if (file) {
      window.open(file, "_blank")
    }
  }

  useEffect(() => {
    getStase()
  }, [])

  if (loading) {
    return (
      <div className="main-content">
        <section className="section">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 text-muted">Memuat data stase...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="main-content">
      <section className="section">
        {/* Header Section */}
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-hospital-alt text-primary me-2"></i>
              Detail Stase: {namaStase}
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/stase">Stase</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Detail Stase
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex gap-2">
            <Link to={`/stase/edit/${id}`} className="btn btn-warning">
              <i className="fas fa-edit me-1"></i>
              Edit Stase
            </Link>
            <Link to="/stase" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left me-1"></i>
              Kembali
            </Link>
          </div>
        </div>

        <div className="section-body">
          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="text-primary mb-2">
                    <i className="fas fa-users fa-2x"></i>
                  </div>
                  <h3 className="mb-1">{residenStase.length}</h3>
                  <p className="text-muted mb-0">Total Residen</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="text-success mb-2">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                  <h3 className="mb-1">{totalJamKerja}</h3>
                  <p className="text-muted mb-0">Total Jam Kerja</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="text-info mb-2">
                    <i className="fas fa-chart-line fa-2x"></i>
                  </div>
                  <h3 className="mb-1">{averageJamKerja}</h3>
                  <p className="text-muted mb-0">Rata-rata Jam</p>
                </Card.Body>
              </Card>
            </Col>

          </Row>

          {/* Info Stase Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header  text-white">
              <h4 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Informasi Stase
              </h4>
            </div>
            <div className="card-body">
              <Row>
                <Col md={8}>
                  <div className="table-responsive">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td className="fw-bold text-muted" style={{ width: "200px" }}>
                            <i className="fas fa-calendar-alt me-2 text-primary"></i>
                            Periode Stase
                          </td>
                          <td>
                            <Badge bg="primary" className="fs-6 px-3 py-2">
                              {namaStase}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted">
                            <i className="fas fa-hospital me-2 text-success"></i>
                            Rumah Sakit
                          </td>
                          <td>
                            <span className="fw-medium">{rumahSakit}</span>
                          </td>
                        </tr>

                        <tr>
                          <td className="fw-bold text-muted">
                            <i className="fas fa-file-download me-2 text-warning"></i>
                            File Jadwal Jaga
                          </td>
                          <td>
                            {file ? (
                              <button className="btn btn-outline-primary btn-sm" onClick={handleDownloadFile}>
                                <i className="fas fa-download me-1"></i>
                                Download File
                              </button>
                            ) : (
                              <span className="text-muted">Tidak ada file</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold text-muted">
                            <i className="fas fa-clock me-2 text-success"></i>
                            Total Jam Kerja / Minggu
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge bg="success" className="fs-6 me-2">
                                {totalJamKerja} jam
                              </Badge>
                              <small className="text-muted">(Rata-rata: {averageJamKerja} jam per residen)</small>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Col>

              </Row>
            </div>
          </div>

          {/* Daftar Residen Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-header  text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Daftar Residen ({residenStase.length} orang)
              </h4>
              <div className="d-flex gap-2">
                <Badge bg="light" text="dark" className="fs-6">
                  Total: {totalJamKerja} jam/minggu
                </Badge>
              </div>
            </div>
            <div className="card-body">
              {residenStase.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th width="50" className="text-center">No</th>
                        <th width="150">NIM</th>
                        <th>Nama Residen</th>
                        <th width="120" className="text-center">Tahap</th>
                        <th width="200">Jam Kerja / Minggu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residenStase.map((row, index) => (
                        <tr key={row.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <Link to={`/residen/biodata/${row.user.id}`} className="text-decoration-none fw-bold text-primary">
                              {row.user.username}
                            </Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2 text-white">
                                <i className="fas fa-user"></i>
                              </div>
                              <span className="fw-medium">{row.user.name}</span>
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge bg="info" className="fs-12">
                              {row.tahap || "-"}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge
                                bg={
                                  (row.jam_kerja || 0) >= 40 ? "success" :
                                    (row.jam_kerja || 0) >= 20 ? "warning" : "danger"
                                }
                                className="fs-6 px-3 py-2"
                              >
                                <i className="fas fa-clock me-1"></i>
                                {row.jam_kerja || 0} jam
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Tidak ada data residen</h5>
                  <p className="text-muted">Belum ada residen yang terdaftar dalam stase ini.</p>
                </div>
              )
              }
            </div>
          </div>
        </div>
      </section>

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
        .table td {
          padding: 12px 8px;
          vertical-align: middle;
        }
      `}</style>
    </div>
  )
}

export default ShowStase
