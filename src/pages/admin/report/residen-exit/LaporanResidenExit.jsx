import React, { useState, useEffect, useCallback } from "react"
import axios from "../../../../api/axios"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Card, Table, Form, Button, Badge, Spinner, InputGroup, Row, Col } from "react-bootstrap"
import baseurl from "../../../../api/baseurl"
import { CustomPagination } from "../../../../components/custom-pagination"

const LaporanResidenExit = () => {
  const [residenExits, setResidenExits] = useState([])
  const [loading, setLoading] = useState(false)
  const [prodiOptions, setProdiOptions] = useState([])
  const [term, setTerm] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [links, setLinks] = useState([])
  const [filters, setFilters] = useState({
    prodi_id: "",
    alasan: "",
  })

  const alasanOptions = [
    { value: "DO", label: "DO (Drop Out)" },
    { value: "Mengundurkan Diri", label: "Mengundurkan Diri" },
    { value: "Skorsing", label: "Skorsing" },
    { value: "Meninggal", label: "Meninggal" },
  ]

  const fetchProdiOptions = async () => {
    try {
      const response = await axios.get("/api/prodi-options")
      setProdiOptions(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching prodi options:", error)
    }
  }

  const fetchResidenExits = useCallback(async (pageNum = 1, searchTerm = term, activeFilters = filters) => {
    setLoading(true)
    const tid = toast.loading("Memuat data laporan...")
    try {
      const params = {
        search: searchTerm,
        page: pageNum,
        prodi_id: activeFilters.prodi_id,
        alasan: activeFilters.alasan,
      }

      const response = await axios.get("/api/residen-exits", { params })

      if (response.data.success) {
        const data = response.data.data
        setResidenExits(data.data || [])
        setTotal(data.total || data.meta?.total || 0)
        setLinks(data.links || data.meta?.links || [])
        setPage(data.current_page || data.meta?.current_page || 1)
        toast.success("Data dimuat", { id: tid })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Gagal mengambil data", { id: tid })
    } finally {
      setLoading(false)
    }
  }, [term, filters])

  useEffect(() => {
    fetchProdiOptions()
    fetchResidenExits()
  }, [])

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    fetchResidenExits(1, term, newFilters)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    fetchResidenExits(1, term, filters)
  }

  const handleReset = () => {
    setTerm("")
    const resetFilters = { prodi_id: "", alasan: "" }
    setFilters(resetFilters)
    fetchResidenExits(1, "", resetFilters)
  }

  const getAlasanBadge = (alasan) => {
    let bg = "soft-secondary"
    let color = "text-muted"

    switch (alasan) {
      case "DO": bg = "soft-danger"; color = "text-danger"; break;
      case "Mengundurkan Diri": bg = "soft-warning"; color = "text-warning"; break;
      case "Skorsing": bg = "soft-dark"; color = "text-dark"; break;
      case "Meninggal": bg = "soft-secondary"; color = "text-muted"; break;
      default: break;
    }

    return (
      <Badge bg={bg} className={`px-3 py-2 rounded-pill ${color}`} style={{ fontWeight: 600 }}>
        {alasan}
      </Badge>
    )
  }

  const exportUrl = `${baseurl}/api/residen-exits/export?search=${term}&prodi_id=${filters.prodi_id}&alasan=${filters.alasan}`

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header border-bottom-0 pb-0 bg-transparent shadow-none">
          <Row className="w-100 align-items-center">
            <Col>
              <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Laporan Residen Keluar</h1>
              <p className="text-muted mt-1">Analisis data residen yang telah keluar (DO, Mengundurkan Diri, dsb).</p>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  className="rounded-pill px-4 fw-bold shadow-none"
                  style={{ border: '2px solid #e2e8f0' }}
                >
                  <i className="fas fa-sync-alt mr-2"></i> Reset
                </Button>
                <a
                  href={exportUrl}
                  className="btn btn-success fw-bold px-4 rounded-pill shadow-sm"
                >
                  <i className="fas fa-file-excel mr-2"></i> Export Excel
                </a>
              </div>
            </Col>
          </Row>
        </div>

        <div className="section-body mt-4 text-left">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <Form onSubmit={handleSearch}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Cari Nama / NIM</Form.Label>
                    <InputGroup className="bg-light border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="bg-transparent border-0"
                        placeholder="Ketik nama atau NIM..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        style={{ height: '45px' }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Program Studi</Form.Label>
                    <Form.Select
                      className="bg-light border-0"
                      style={{ borderRadius: '10px', height: '45px' }}
                      value={filters.prodi_id}
                      onChange={(e) => handleFilterChange("prodi_id", e.target.value)}
                    >
                      <option value="">Semua Program Studi</option>
                      {prodiOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Alasan Keluar</Form.Label>
                    <Form.Select
                      className="bg-light border-0"
                      style={{ borderRadius: '10px', height: '45px' }}
                      value={filters.alasan}
                      onChange={(e) => handleFilterChange("alasan", e.target.value)}
                    >
                      <option value="">Semua Alasan</option>
                      {alasanOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 fw-bold shadow-sm"
                      style={{ borderRadius: '10px', height: '45px' }}
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : 'Terapkan Filter'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-bottom-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <h4 className="m-0 text-dark" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Total Data: <span className="text-primary">{total}</span>
              </h4>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold" width="25%">Residen</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold" width="25%">Program Studi</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">Alasan</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">Dokumen</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-end">Tgl Keluar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residenExits.length > 0 ? (
                      residenExits.map((item) => (
                        <tr key={item.id} style={{ transition: 'all 0.2s' }}>
                          <td className="px-4 py-3 border-light">
                            <Link to={`/residen/biodata/${item.user?.id}`} className="text-decoration-none">
                              <div className="fw-bold text-dark">{item.user?.name}</div>
                              <div className="small text-muted">{item.user?.username}</div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 border-light">
                            <span className="text-dark" style={{ fontWeight: 500 }}>
                              {item.user?.prodi?.name || item.user?.biodata?.prodi?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {getAlasanBadge(item.alasan)}
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {item.file ? (
                              <a
                                href={baseurl + '/storage/' + item.file}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-soft-primary px-3 text-primary rounded-pill fw-bold"
                              >
                                <i className="fas fa-file-download mr-1"></i> Lihat File
                              </a>
                            ) : (
                              <span className="text-muted small italic">Tanpa Berkas</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-end">
                            <div className="text-dark fw-medium">
                              {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="small text-muted">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                        </tr>
                      ))
                    ) : !loading && (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="opacity-20 mb-3">
                            <i className="fas fa-folder-open fa-3x"></i>
                          </div>
                          <h6 className="text-muted fw-normal">Tidak ada data residen keluar yang ditemukan.</h6>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            {total > 10 && (
              <Card.Footer className="bg-white border-top-0 py-4 px-4">
                <CustomPagination
                  totalItemsCount={total}
                  activePage={page}
                  itemsCountPerPage={10}
                  onChange={(p) => fetchResidenExits(p)}
                />
              </Card.Footer>
            )}
          </Card>
        </div>
      </section>
      <style>{`
        .bg-soft-danger { background-color: #fee2e2 !important; }
        .bg-soft-warning { background-color: #fef3c7 !important; }
        .bg-soft-dark { background-color: #f1f5f9 !important; }
        .bg-soft-secondary { background-color: #f1f5f9 !important; }
        .btn-soft-primary { background-color: #e0f2fe; border: none; transition: all 0.2s; }
        .btn-soft-primary:hover { background-color: #bae6fd; color: #0369a1 !important; transform: translateY(-1px); }
        .opacity-20 { opacity: 0.2; }
        .table-hover tbody tr:hover { background-color: #f8fafc !important; }
        .text-left { text-align: left !important; }
      `}</style>
    </div>
  )
}

export default LaporanResidenExit
