"use client"

import { useState } from "react"
import useAuthContext from "../../../context/AuthContext"
import axios from "../../../api/axios"
import { Button, Modal, Form, Alert, Card, Row, Col, Table, InputGroup, Pagination } from "react-bootstrap"
import { toast } from "react-hot-toast"
import { Upload, Download, FileText, Users, UserCheck, UserX, Search, ChevronUp, ChevronDown } from "lucide-react"

export default function DosenComparison() {
  const { user } = useAuthContext()

  // State untuk data
  const [comparisonResult, setComparisonResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)

  // State untuk modal
  const [showUpload, setShowUpload] = useState(false)

  // State untuk tabs/views
  const [activeTab, setActiveTab] = useState("missing")

  // State untuk table functionality
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ]

      if (allowedTypes.includes(file.type)) {
        setUploadFile(file)
      } else {
        toast.error("Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv")
        e.target.value = ""
      }
    }
  }

  // Handle upload dan comparison
  const handleUpload = async (e) => {
    e.preventDefault()

    if (!uploadFile) {
      toast.error("Pilih file terlebih dahulu")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("excel_file", uploadFile)

    try {
      const res = await axios.post("/api/comparison/upload2", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (res.data.success) {
        console.log("Comparison result", res.data.data)
        setComparisonResult(res.data.data)
        toast.success("Data berhasil diupload dan dibandingkan!")
      } else {
        toast.error(res.data.message || "Gagal memproses data")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat upload file")
    } finally {
      setLoading(false)
      handleCloseUpload()
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const res = await axios.get("/api/comparison/export2", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `hasil_perbandingan_${new Date().toISOString().split("T")[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("File berhasil didownload!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal export data")
    }
  }

  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      const res = await axios.get("/api/comparison/template2", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "template_pegawai.xlsx")
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Template berhasil didownload!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal download template")
    }
  }

  // Modal handlers
  const handleCloseUpload = () => {
    setShowUpload(false)
    setUploadFile(null)
  }
  const handleShowUpload = () => setShowUpload(true)

  // Table functionality
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchTerm("")
    setSortField("")
    setSortDirection("asc")
    setCurrentPage(1)
  }

  // Get current data based on active tab
  const getCurrentData = () => {
    if (!comparisonResult) return []

    let data = []
    switch (activeTab) {
      case "missing":
        data = comparisonResult.dosen_not_in_pegawai || []
        break
      case "extra":
        data = comparisonResult.pegawai_not_in_dosen || []
        break
      case "matching":
        data = (comparisonResult.matching_data || []).map((item) => ({
          nip: item.nip,
          nama_dosen: item.dosen.nama,
         
          nama_pegawai: item.pegawai.nama,
          nik: item.pegawai.nik,
          golongan: item.pegawai.golongan,
          jabatan_fungsional: item.pegawai.jabatan_fungsional,
        }))
        break
      default:
        data = []
    }

    // Filter data based on search term
    if (searchTerm) {
      data = data.filter((item) =>
        Object.values(item).some((value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Sort data
    if (sortField) {
      data.sort((a, b) => {
        const aValue = a[sortField] || ""
        const bValue = b[sortField] || ""

        if (sortDirection === "asc") {
          return aValue.toString().localeCompare(bValue.toString())
        } else {
          return bValue.toString().localeCompare(aValue.toString())
        }
      })
    }

    return data
  }

  // Pagination
  const getCurrentPageData = () => {
    const data = getCurrentData()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    return Math.ceil(getCurrentData().length / itemsPerPage)
  }

  // Smart pagination logic
  const getPaginationItems = () => {
    const totalPages = getTotalPages()
    const current = currentPage
    const items = []

    if (totalPages <= 7) {
      // Jika total halaman <= 7, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      // Logic untuk pagination yang lebih kompleks
      if (current <= 4) {
        // Jika di awal: 1 2 3 4 5 ... last
        for (let i = 1; i <= 5; i++) {
          items.push(i)
        }
        items.push("ellipsis")
        items.push(totalPages)
      } else if (current >= totalPages - 3) {
        // Jika di akhir: 1 ... (last-4) (last-3) (last-2) (last-1) last
        items.push(1)
        items.push("ellipsis")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(i)
        }
      } else {
        // Jika di tengah: 1 ... (current-1) current (current+1) ... last
        items.push(1)
        items.push("ellipsis")
        for (let i = current - 1; i <= current + 1; i++) {
          items.push(i)
        }
        items.push("ellipsis")
        items.push(totalPages)
      }
    }

    return items
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  const renderTableHeader = (field, label) => (
    <th
      style={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => handleSort(field)}
      className="position-relative"
    >
      <div className="d-flex align-items-center justify-content-between">
        {label}
        {renderSortIcon(field)}
      </div>
    </th>
  )

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>
            <FileText className="me-2" size={24} />
            Perbandingan Data Dosen
          </h1>
        </div>

        <div className="section-body">
          {/* Action Buttons */}
          <div className="mb-4 d-flex gap-2">
            <Button variant="primary" onClick={handleShowUpload}>
              <Upload className="me-2" size={16} />
              Upload Data Pegawai
            </Button>

            <Button variant="outline-secondary" onClick={handleDownloadTemplate}>
              <Download className="me-2" size={16} />
              Download Template
            </Button>

            {/* {comparisonResult && (
              <Button variant="success" onClick={handleExport}>
                <Download className="me-2" size={16} />
                Export Hasil
              </Button>
            )} */}
          </div>

          {/* Summary Cards */}
          {comparisonResult && (
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center border-primary">
                  <Card.Body>
                    <Users size={32} className="text-primary mb-2" />
                    <h4>{comparisonResult.summary.total_dosen}</h4>
                    <p className="mb-0">Total dosen</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-info">
                  <Card.Body>
                    <Users size={32} className="text-info mb-2" />
                    <h4>{comparisonResult.summary.total_pegawai}</h4>
                    <p className="mb-0">Total Pegawai</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-danger">
                  <Card.Body>
                    <UserX size={32} className="text-danger mb-2" />
                    <h4>{comparisonResult.summary.missing_from_pegawai}</h4>
                    <p className="mb-0">Kurang di Pegawai</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-success">
                  <Card.Body>
                    <UserCheck size={32} className="text-success mb-2" />
                    <h4>{comparisonResult.summary.matching_count}</h4>
                    <p className="mb-0">Data Cocok</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Upload Modal */}
          <Modal show={showUpload} onHide={handleCloseUpload} size="lg">
            <Form onSubmit={handleUpload}>
              <Modal.Header closeButton>
                <Modal.Title>
                  <Upload className="me-2" size={20} />
                  Upload Data Kepegawaian
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Alert variant="info">
                  <strong>Format Excel yang diharapkan:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Kolom A: NIP</li>
                    <li>Kolom B: Nama</li>
                    <li>Kolom C: nik</li>
                    <li>Kolom B: golongan</li>
                    <li>Kolom B: jabatan_fungsional</li>
                  </ul>
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>Pilih File Excel</Form.Label>
                  <Form.Control type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} required />
                  <Form.Text className="text-muted">Format yang didukung: .xlsx, .xls, .csv (Maksimal 10MB)</Form.Text>
                </Form.Group>

                {uploadFile && (
                  <Alert variant="success">
                    <strong>File dipilih:</strong> {uploadFile.name}
                    <br />
                    <strong>Ukuran:</strong> {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseUpload}>
                  Batal
                </Button>
                <Button variant="primary" type="submit" disabled={loading || !uploadFile}>
                  {loading ? "Memproses..." : "Upload & Bandingkan"}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Results */}
          {comparisonResult && (
            <div>
              {/* Tab Navigation */}
              <div className="mb-3">
                <Button
                  variant={activeTab === "missing" ? "danger" : "outline-danger"}
                  className="me-2"
                  onClick={() => handleTabChange("missing")}
                >
                  <UserX className="me-1" size={16} />
                  Kurang di Pegawai ({comparisonResult.summary.missing_from_pegawai})
                </Button>
                <Button
                  variant={activeTab === "extra" ? "warning" : "outline-warning"}
                  className="me-2"
                  onClick={() => handleTabChange("extra")}
                >
                  <Users className="me-1" size={16} />
                  Tidak di dosen ({comparisonResult.summary.missing_from_dosen})
                </Button>
                <Button
                  variant={activeTab === "matching" ? "success" : "outline-success"}
                  onClick={() => handleTabChange("matching")}
                >
                  <UserCheck className="me-1" size={16} />
                  Data Cocok ({comparisonResult.summary.matching_count})
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mb-3">
                <InputGroup style={{ maxWidth: "400px" }}>
                  <InputGroup.Text>
                    <Search size={16} />
                  </InputGroup.Text>
                  <Form.Control type="text" placeholder="Cari data..." value={searchTerm} onChange={handleSearch} />
                </InputGroup>
              </div>

              {/* Data Table */}
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    {activeTab === "missing" && (
                      <>
                        <UserX className="me-2 text-danger" size={20} />
                        dosen yang TIDAK ADA di Data Kepegawaian
                      </>
                    )}
                    {activeTab === "extra" && (
                      <>
                        <Users className="me-2 text-warning" size={20} />
                        Pegawai yang TIDAK ADA di Data dosen
                      </>
                    )}
                    {activeTab === "matching" && (
                      <>
                        <UserCheck className="me-2 text-success" size={20} />
                        Data yang Cocok
                      </>
                    )}
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table striped hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th width="50">#</th>
                          {activeTab === "missing" && (
                            <>
                              {renderTableHeader("nip", "NIP")}
                              {renderTableHeader("nama", "Nama")}
                              {renderTableHeader("nik", "nik")}
                              {renderTableHeader("golongan", "golongan")}
                              {renderTableHeader("jabatan_fungsional", "jabatan_fungsional")}
                            </>
                          )}
                          {activeTab === "extra" && (
                            <>
                              {renderTableHeader("nip", "NIP")}
                              {renderTableHeader("nama", "Nama")}
                              {renderTableHeader("nik", "nik")}
                              {renderTableHeader("golongan", "golongan")}
                              {renderTableHeader("jabatan_fungsional", "jabatan_fungsional")}
                            </>
                          )}
                          {activeTab === "matching" && (
                            <>
                              {renderTableHeader("nip", "NIP")}
                              {renderTableHeader("nama", "Nama")}
                              {renderTableHeader("nik", "nik")}
                              {renderTableHeader("golongan", "golongan")}
                              {renderTableHeader("jabatan_fungsional", "jabatan_fungsional")}
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentPageData().length > 0 ? (
                          getCurrentPageData().map((item, index) => (
                            <tr key={index}>
                              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              {activeTab === "missing" && (
                                <>
                                  <td>
                                    <strong className="text-danger">{item.nip}</strong>
                                  </td>
                                  <td>{item.name}</td>
                                  <td>{item.nik}</td>
                                  <td>{item.golongan}</td>
                                  <td>{item.jabatan_fungsional}</td>
                                </>
                              )}
                              {activeTab === "extra" && (
                                <>
                                  <td>
                                    <strong className="text-warning">  {item.nip}</strong>
                                  </td>
                                  <td>{item.nama}</td>
                                    <td>{item.nik}</td>
                                  <td>{item.golongan}</td>
                                  <td>{item.jabatan_fungsional}</td>
                                </>
                              )}
                              {activeTab === "matching" && (
                                <>
                                  <td>
                                    <strong className="text-success">{item.nip} </strong>
                                  </td>
                                  <td>{item.nama_pegawai}</td>
                                    <td>{item.nik}</td>
                                  <td>{item.golongan}</td>
                                  <td>{item.jabatan_fungsional}</td>
                                </>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
                              {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Smart Pagination */}
                  {getTotalPages() > 1 && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                      <div className="text-muted">
                        Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                        {Math.min(currentPage * itemsPerPage, getCurrentData().length)} dari {getCurrentData().length}{" "}
                        data
                      </div>
                      <Pagination className="mb-0">
                        <Pagination.First disabled={currentPage === 1} onClick={() => setCurrentPage(1)} />
                        <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />

                        {getPaginationItems().map((item, index) => {
                          if (item === "ellipsis") {
                            return <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
                          }

                          return (
                            <Pagination.Item
                              key={item}
                              active={item === currentPage}
                              onClick={() => setCurrentPage(item)}
                            >
                              {item}
                            </Pagination.Item>
                          )
                        })}

                        <Pagination.Next
                          disabled={currentPage === getTotalPages()}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        />
                        <Pagination.Last
                          disabled={currentPage === getTotalPages()}
                          onClick={() => setCurrentPage(getTotalPages())}
                        />
                      </Pagination>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!comparisonResult && (
            <Card className="text-center py-5">
              <Card.Body>
                <FileText size={64} className="text-muted mb-3" />
                <h4>Belum Ada Data</h4>
                <p className="text-muted">
                  Upload file Excel untuk memulai perbandingan data kepegawaian dengan dosen
                </p>
                <Button variant="primary" onClick={handleShowUpload}>
                  <Upload className="me-2" size={16} />
                  Upload File Sekarang
                </Button>
              </Card.Body>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
