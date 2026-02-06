"use client"

import { useEffect, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
import axios from "../../../api/axios"
import { Link } from "react-router-dom"
import baseurl from "../../../api/baseurl"
import toast from "react-hot-toast"
import { Spinner, Badge, Card, Row, Col, Form, Button } from "react-bootstrap"


const Stase = () => {
  const [pilihan, setPilihan] = useState([])
  const [stase, setStase] = useState([])
  const [loading, setLoading] = useState(false)
  const [staseRs, setStaseRs] = useState([])
  const [rumahSakitId, setRumahSakitId] = useState("")
  const [bulan, setBulan] = useState("")
  const [tahun, setTahun] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    totalResiden: 0,
    totalJamKerja: 0,
  })

  const options = { year: "numeric", month: "long", day: "numeric" }

  const handleExport = (id) => {
    window.open(`${baseurl}/api/stase/export/${id}`, "_blank")
  }

  const handleRefresh = () => {
    setRumahSakitId("")
    setBulan("")
    setTahun("")
    getStase()
  }

  const getStaseFilter = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      const toastId = toast.loading("Memfilter data...")
      const res = await axios.post(`/api/stase-index`, {
        rsid: rumahSakitId,
        bulan,
        tahun,
      })
      console.log(res)
      const data = res.data.data || []
      setStase(data)
      calculateStats(data)
      toast.remove(toastId)
      toast.success("Filter berhasil diterapkan")
    } catch (err) {
      console.log(err)
      toast.error("Gagal memfilter data")
    }
    setLoading(false)
  }

  const calculateStats = (data) => {
    if (!Array.isArray(data)) return

    const totalResiden = data.reduce((sum, item) => sum + (item.staseresiden?.length || 0), 0)
    const totalJamKerja = data.reduce((sum, item) => {
      const residenJam = item.staseresiden ? item.staseresiden.reduce((jamSum, residen) => jamSum + (residen.jam_kerja || 0), 0) : 0
      return sum + residenJam
    }, 0)

    setStats({
      total: data.length,
      totalResiden,
      totalJamKerja,
    })
  }

  const columns = [
    {
      field: "periode",
      headerName: "Periode Stase",
      width: 155,
      renderCell: (cellValues) => {
        return (
          <Badge bg="primary" className="fs-12 px-3 py-2">
            <i className="fas fa-calendar-alt me-1"></i>
            {`${cellValues.row.bulan} / ${cellValues.row.tahun}`}
          </Badge>
        )
      },
    },
   
    {
      field: "rumah_sakit_id",
      headerName: "Rumah Sakit",
      width: 280,
      renderCell: (cellValues) => {
        return (
          <div className="d-flex align-items-center">
            <div className="avatar-sm bg-success rounded-circle d-flex align-items-center justify-content-center me-2">
              <i className="fas fa-hospital text-white"></i>
            </div>
            <span className="fw-medium">{cellValues.row.rumahsakit.name}</span>
          </div>
        )
      },
    },
    {
      field: "staseresiden",
      headerName: "Jumlah Residen",
      width: 150,
      align: "center",
      renderCell: (cellValues) => {
        const count = cellValues.row.staseresiden.length
        return (
          <Badge bg={count > 0 ? "success" : "secondary"} className="fs-12">
            <i className="fas fa-users me-1"></i>
            {count} orang
          </Badge>
        )
      },
    },
    {
      field: "jam_kerja_total",
      headerName: "Total Jam Kerja",
      width: 150,
      align: "center",
      renderCell: (cellValues) => {
        const totalJam = cellValues.row.staseresiden.reduce((sum, residen) => sum + (residen.jam_kerja || 0), 0)
        return (
          <Badge bg={totalJam > 0 ? "warning" : "secondary"} className="fs-12">
            <i className="fas fa-clock me-1"></i>
            {totalJam} jam
          </Badge>
        )
      },
    },
    {
      field: "file",
      headerName: "File",
      width: 120,
      align: "center",
      renderCell: (cellValues) => {
        return cellValues.row.file ? (
          <a
            href={`${baseurl}/storage/${cellValues.row.file}`}
            className="btn btn-outline-primary btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-download me-1"></i>
            Download
          </a>
        ) : (
          <span className="text-muted">-</span>
        )
      },
    },
    {
      field: "created_at",
      headerName: "Tanggal Dibuat",
      width: 150,
      renderCell: (cellValues) => {
        return (
          <div className="text-muted">
            <i className="fas fa-calendar me-1"></i>
            {new Date(cellValues.row.created_at).toLocaleDateString(undefined, options)}
          </div>
        )
      },
    },
    {
      field: "id",
      headerName: "Aksi",
      width: 200,
      renderCell: (cellValues) => {
        return (
          <div className="d-flex gap-1">
            <Link to={`/stase/${cellValues.row.id}`} className="btn btn-info btn-sm" title="Lihat Detail">
              <i className="fas fa-eye"></i>
            </Link>
            <Link to={`/stase/edit/${cellValues.row.id}`} className="btn btn-warning btn-sm" title="Edit">
              <i className="fas fa-pen"></i>
            </Link>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleExport(cellValues.row.id)}
              title="Export PDF"
            >
              <i className="fas fa-file-pdf"></i>
            </button>
          </div>
        )
      },
    },
  ]

  const handleDeleteAll = async () => {
    if (pilihan.length === 0) {
      toast.error("Pilih data yang ingin dihapus")
      return
    }

    

    if (confirm("Apakah anda yakin ?")) {
      setLoading(true)
      try {
        await axios.post("/api/stase/delete-all", { pilihan })
        toast.success(`Berhasil menghapus ${pilihan.length} stase`)
        const selectedIDs = new Set(pilihan)
        setStase((prev) => prev.filter((x) => !selectedIDs.has(x.id)))
        setPilihan([])
      } catch (err) {
        console.log(err)
        toast.error("Gagal menghapus stase. Stase mungkin sedang digunakan.")
      }
      setLoading(false)
    }
  }

  const getStase = async () => {
    const toastId = toast.loading("Memuat data stase...")
    try {
      const res = await axios.post("/api/stase-index")
      const data = res.data.data || []
      setStase(data)
      calculateStats(data)
    } catch (err) {
      console.log(err)
      toast.error("Gagal memuat data stase")
    }
    toast.remove(toastId)
  }

  const getStaseRS = async () => {
    try {
      const res = await axios.get("/api/stase/get-stase-rs")
      setStaseRs(res.data.data || [])
      console.log(res)
    } catch (err) {
      console.log(err)
      toast.error("Gagal memuat data rumah sakit")
    }
  }

  useEffect(() => {
    getStaseRS()
    getStase()
  }, [])

  return (
    <div className="main-content">
      <section className="section">
        {/* Header Section */}
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-hospital-alt text-primary me-2"></i>
              Daftar Stase
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Stase
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex gap-2">
            <Link to="/stase-create" className="btn btn-primary">
              <i className="fas fa-plus me-1"></i>
              Tambah Stase
            </Link>
          </div>
        </div>

        <div className="section-body">
          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="text-primary mb-2">
                    <i className="fas fa-list fa-2x"></i>
                  </div>
                  <h3 className="mb-1">{stats.total}</h3>
                  <p className="text-muted mb-0">Total Stase</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="text-success mb-2">
                    <i className="fas fa-users fa-2x"></i>
                  </div>
                  <h3 className="mb-1">{stats.totalResiden}</h3>
                  <p className="text-muted mb-0">Total Residen</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="text-warning mb-2">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                  <h3 className="mb-1">{stats.totalJamKerja}</h3>
                  <p className="text-muted mb-0">Total Jam Kerja</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filter and Actions Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-gradient-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filter & Aksi
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={getStaseFilter}>
                <Row className="align-items-end">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Bulan</Form.Label>
                      <Form.Select value={bulan} onChange={(e) => setBulan(e.target.value)}>
                        <option value="">Semua Bulan</option>
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
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Tahun</Form.Label>
                      <Form.Select value={tahun} onChange={(e) => setTahun(e.target.value)}>
                        <option value="">Semua Tahun</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                        <option value="2018">2018</option>
                        <option value="2017">2017</option>
                        <option value="2016">2016</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Rumah Sakit</Form.Label>
                      <Form.Select value={rumahSakitId} onChange={(e) => setRumahSakitId(e.target.value)}>
                        <option value="">Semua Rumah Sakit</option>
                        {staseRs.map((data, index) => (
                          <option key={index} value={data.rumahsakit.id}>
                            {data.rumahsakit.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Filter...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search me-1"></i>
                            Filter
                          </>
                        )}
                      </Button>
                      <Button variant="outline-secondary" onClick={handleRefresh}>
                        <i className="fas fa-refresh me-1"></i>
                        Reset
                      </Button>
                      <Button variant="danger" disabled={pilihan.length === 0 || loading} onClick={handleDeleteAll}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-trash me-1"></i>
                            Hapus ({pilihan.length})
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Data Table Card */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-gradient-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-table me-2"></i>
                Data Stase ({stase.length} data)
              </h5>
              <div className="d-flex gap-2">
                {pilihan.length > 0 && (
                  <Badge bg="light" text="dark" className="fs-12">
                    {pilihan.length} dipilih
                  </Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {stase.length > 0 ? (
                <div style={{ height: "500px", width: "100%" }}>
                  <DataGrid
                    rows={stase}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    disableSelectionOnClick
                    onSelectionModelChange={(data) => {
                      console.log("Pilihan", data)
                      setPilihan(data)
                    }}
                    sx={{
                      "& .MuiDataGrid-root": {
                        border: "none",
                      },
                      "& .MuiDataGrid-cell": {
                        borderBottom: "1px solid #f0f0f0",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#f8f9fa",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-hospital-alt fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Tidak ada data stase</h5>
                  <p className="text-muted">Belum ada stase yang dibuat atau sesuai dengan filter yang dipilih.</p>
                  <Link to="/stase/create" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>
                    Tambah Stase Pertama
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </section>

      <style>{`
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
  )
}

export default Stase
