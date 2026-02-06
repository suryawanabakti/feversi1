import React, { useEffect, useState, useCallback } from "react"
import baseurl from "../../../api/baseurl"
import axios from "../../../api/axios"
import toast from "react-hot-toast"
import BeriRespon from "./BeriRespon"
import { Dropdown, Card, Table, Form, Button, Badge, Spinner, InputGroup, Row, Col } from "react-bootstrap"
import { CustomPagination } from "../../../components/custom-pagination"
import InformasiInformasi from "../../../components/InformasiInformasi"
import { Link } from "react-router-dom"

const Informasi = () => {
  const [show, setShow] = useState(false)
  const [term, setTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    visible: "semua",
  })

  const [informasi, setInformasi] = useState({
    total: 0,
    activePage: 1,
    data: [],
  })

  const [detailData, setDetailData] = useState({
    id: "",
    file: "",
    status: "",
    topik: "",
    deskripsi: "",
    respon: "",
    name: "",
    nim: "",
    createdAt: "",
  })

  const handleClose = () => setShow(false)

  const handleShow = (data) => {
    setDetailData({
      id: data.id,
      file: data.file,
      status: data.status,
      topik: data.topik,
      deskripsi: data.deskripsi,
      respon: data.respon,
      name: data.user.name,
      nim: data.user.username,
      createdAt: data.created_at,
    })
    setShow(true)
  }

  const getData = useCallback(async (pageNumber = 1, searchTerm = term, activeFilters = filters) => {
    setLoading(true)
    const tid = toast.loading("Memuat data layanan informasi...")
    try {
      const params = {
        page: pageNumber,
        term: searchTerm,
        visible: activeFilters.visible !== "semua" ? activeFilters.visible : undefined,
      }

      const res = await axios.get("/api/admin/layanan-informasi", { params })

      if (res.data.success) {
        const paginator = res.data.data
        setInformasi({
          total: paginator.meta?.total || paginator.total || 0,
          data: paginator.data || [],
          activePage: paginator.meta?.current_page || paginator.current_page || 1,
        })
        toast.success("Data berhasil dimuat", { id: tid })
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      toast.error("Gagal mengambil data", { id: tid })
    } finally {
      setLoading(false)
    }
  }, [term, filters])

  useEffect(() => {
    getData()
  }, [])

  const handlePageChange = (pageNumber) => {
    getData(pageNumber)
  }

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, visible: e.target.value }
    setFilters(newFilters)
    getData(1, term, newFilters)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    getData(1, term, filters)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus data ini?")) {
      const tid = toast.loading("Menghapus data...")
      try {
        const res = await axios.delete(`/api/admin/layanan-informasi/${id}`)
        if (res.data.success) {
          toast.success(res.data.message || "Berhasil hapus data", { id: tid })
          getData(informasi.activePage)
        }
      } catch (err) {
        toast.error("Gagal menghapus data", { id: tid })
      }
    }
  }

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1 className="font-weight-bold">Layanan Informasi</h1>
          <div className="section-header-breadcrumb">
            <div className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="breadcrumb-item active">Layanan Informasi</div>
          </div>
        </div>

        <div className="section-body mt-4 text-left">
          <InformasiInformasi />

          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <Form onSubmit={handleSearch}>
                <Row className="g-3 align-items-end">
                  <Col md={6}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Cari Topik / Residen / Deskripsi</Form.Label>
                    <InputGroup className="bg-light border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="bg-transparent border-0"
                        placeholder="Ketik kata kunci pencarian..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        style={{ height: '45px' }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Status Respon</Form.Label>
                    <Form.Select
                      className="bg-light border-0"
                      style={{ borderRadius: '10px', height: '45px' }}
                      value={filters.visible}
                      onChange={handleFilterChange}
                    >
                      <option value="semua">Tampilkan Semua</option>
                      <option value="sudah">Sudah di respon</option>
                      <option value="belum">Belum di respon</option>
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
                      {loading ? <Spinner size="sm" /> : 'Cari'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-light text-muted small text-uppercase fw-bold">
                    <tr>
                      <th className="px-4 py-3 border-0">Residen</th>
                      <th className="px-4 py-3 border-0">Topik & Berkas</th>
                      <th className="px-4 py-3 border-0" style={{ minWidth: '200px' }}>Deskripsi</th>
                      <th className="px-4 py-3 border-0">Respon</th>
                      <th className="px-4 py-3 border-0 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informasi.data.length > 0 ? (
                      informasi.data.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 border-light">
                            <div className="d-flex align-items-center">

                              <div>
                                <div className="fw-bold text-dark">{item.user?.name}</div>
                                <div className="small text-muted">{item.user?.username}</div>
                                <div className="small text-primary fw-medium">{item.user?.biodata?.prodi?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border-light">
                            <div className="fw-bold mb-1 text-dark">{item.topik}</div>
                            {item.file && (
                              <a
                                href={`${baseurl}/storage/informasi/${item.file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="small text-decoration-none fw-bold"
                              >
                                <i className="fas fa-paperclip mr-1"></i> Lihat Berkas
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-wrap small text-muted">
                            {item.deskripsi}
                          </td>
                          <td className="px-4 py-3 border-light">
                            {item.respon ? (
                              <div className="text-dark small p-2 bg-light rounded" style={{ borderLeft: '3px solid #6777ef' }}>
                                {item.respon}
                              </div>
                            ) : (
                              <Badge bg="soft-warning" className="text-warning px-3 py-2 rounded-pill fw-bold">
                                Belum direspon
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            <Dropdown align="end">
                              <Dropdown.Toggle as={Button} variant="link" className="p-0 text-muted shadow-none">
                                <i className="fas fa-ellipsis-v"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                                <Dropdown.Item onClick={() => handleShow(item)} className="py-2">
                                  <i className="fas fa-reply mr-2 text-primary"></i> Beri Respon
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleDelete(item.id)} className="py-2 text-danger">
                                  <i className="fas fa-trash mr-2"></i> Hapus
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : !loading && (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="opacity-20 mb-3">
                            <i className="fas fa-inbox fa-3x"></i>
                          </div>
                          <h6 className="text-muted fw-normal">Tidak ada data informasi yang ditemukan.</h6>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            {informasi.total > 10 && (
              <Card.Footer className="bg-white border-top-0 py-4 px-4">
                <CustomPagination
                  activePage={informasi.activePage}
                  itemsCountPerPage={10}
                  totalItemsCount={informasi.total}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                />
              </Card.Footer>
            )}
          </Card>
        </div>
      </section>

      <BeriRespon
        show={show}
        setShow={setShow}
        handleClose={handleClose}
        detailData={detailData}
        setInformasi={setInformasi}
        informasi={informasi}
        term={term}
        filters={filters}
        getData={getData}
      />

      <style>{`
        .bg-soft-primary { background-color: #e0f2fe !important; }
        .bg-soft-warning { background-color: #fff7ed !important; }
        .text-primary { color: #0284c7 !important; }
        .text-warning { color: #f59e0b !important; }
        .object-fit-cover { object-fit: cover; }
        .text-left { text-align: left !important; }
        .opacity-20 { opacity: 0.2; }
      `}</style>
    </div>
  )
}

export default Informasi
