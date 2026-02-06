import { useState, useEffect, useRef, useCallback } from "react"
import axios from "../../../api/axios"
import baseurl from "../../../api/baseurl"
import useAuthContext from "../../../context/AuthContext"
import { Row, Col, Card, Table, Form, Button, Badge, Spinner, Dropdown, Modal, InputGroup } from "react-bootstrap"
import { CustomPagination } from "../../../components/custom-pagination"
import toast from "react-hot-toast"

const PelanggaranResidenManagement = () => {
  const { user } = useAuthContext()
  const [pelanggaranResidens, setPelanggaranResidens] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [selectAll, setSelectAll] = useState(false)
  const [pilihan, setPilihan] = useState([])
  const [term, setTerm] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    activePage: 1,
  })

  // Filter states
  const [filters, setFilters] = useState({
    prodi_id: "",
    pelanggaran_id: "",
  })

  // Options
  const [prodiOptions, setProdiOptions] = useState([])
  const [pelanggaranOptions, setPelanggaranOptions] = useState([])
  const [residenOptions, setResidenOptions] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [loadingResidents, setLoadingResidents] = useState(false)

  // Resident selector states
  const [showResidenDropdown, setShowResidenDropdown] = useState(false)
  const [residenSearchTerm, setResidenSearchTerm] = useState("")
  const [selectedResidents, setSelectedResidents] = useState([])
  const residenDropdownRef = useRef(null)

  const [formData, setFormData] = useState({
    prodi_id: "",
    kronologi: "",
    pelanggaran_id: "",
    sanksi: "",
    file: null,
    residen_ids: [],
  })

  const [errors, setErrors] = useState({})
  const API_BASE_URL = baseurl

  const fetchBasicOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pelanggaran-residens/options`)
      if (response.data.success) {
        const { prodis, pelanggarans } = response.data.data
        setProdiOptions(prodis)
        setPelanggaranOptions(pelanggarans)
      }
    } catch (error) {
      console.error("Error fetching basic options:", error)
    }
  }, [API_BASE_URL])

  const fetchResidensByProdi = useCallback(async (prodiId) => {
    if (!prodiId) {
      setResidenOptions([])
      return
    }

    setLoadingResidents(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pelanggaran-residens/residens-by-prodi`, {
        params: { prodi_id: prodiId },
      })
      if (response.data.success) {
        setResidenOptions(response.data.data)
      } else {
        setResidenOptions([])
      }
    } catch (error) {
      console.error("Error fetching residents:", error)
      setResidenOptions([])
      toast.error("Gagal mengambil data residen")
    } finally {
      setLoadingResidents(false)
    }
  }, [API_BASE_URL])

  const fetchPelanggaranResidens = useCallback(async (searchTerm = term, pageNum = 1, filterParams = filters) => {
    setLoading(true)
    const tid = toast.loading("Memuat data pelanggaran...")
    try {
      const params = {
        search: searchTerm,
        page: pageNum,
        ...filterParams,
      }

      // Remove empty filter values
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await axios.get(`${API_BASE_URL}/api/pelanggaran-residens`, { params })
      if (response.data.success) {
        const result = response.data.data
        setPelanggaranResidens(result.data || [])
        setPagination({
          total: result.meta?.total || result.total || 0,
          activePage: result.meta?.current_page || result.current_page || 1,
        })
        toast.success("Data berhasil dimuat", { id: tid })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Gagal mengambil data", { id: tid })
    } finally {
      setLoading(false)
    }
  }, [term, filters, API_BASE_URL])

  useEffect(() => {
    fetchPelanggaranResidens()
    fetchBasicOptions()
  }, [])

  // Auto-select prodi for "prodi" role users
  useEffect(() => {
    if (user && user.roles && (user?.roles?.[0]?.name === "prodi" || user?.roles?.[0]?.name === "admin_prodi") && user.prodi?.id) {
      const prodiIdStr = user.prodi.id.toString()
      setFormData((prev) => ({
        ...prev,
        prodi_id: prodiIdStr,
      }))

      setFilters((prev) => ({
        ...prev,
        prodi_id: prodiIdStr,
      }))

      fetchResidensByProdi(user.prodi.id)
    }
  }, [user, fetchResidensByProdi])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (residenDropdownRef.current && !residenDropdownRef.current.contains(event.target)) {
        setShowResidenDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handlePageChange = (pageNum) => {
    fetchPelanggaranResidens(term, pageNum, filters)
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    setIsSearching(true)
    fetchPelanggaranResidens(term, 1, filters).finally(() => setIsSearching(false))
  }

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    fetchPelanggaranResidens(term, 1, newFilters)
  }

  const clearFilters = () => {
    const isProdi = user?.roles?.[0]?.name === "prodi" || user?.roles?.[0]?.name === "admin_prodi"
    const clearedFilters = {
      prodi_id: isProdi && user?.prodi?.id ? user.prodi.id.toString() : "",
      pelanggaran_id: "",
    }
    setFilters(clearedFilters)
    fetchPelanggaranResidens(term, 1, clearedFilters)
  }

  const hasActiveFilters = () => {
    const isProdi = user?.roles?.[0]?.name === "prodi" || user?.roles?.[0]?.name === "admin_prodi"
    if (isProdi) {
      return filters.pelanggaran_id !== ""
    }
    return filters.prodi_id !== "" || filters.pelanggaran_id !== ""
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target

    if (name === "prodi_id") {
      setFormData((prev) => ({ ...prev, prodi_id: value, residen_ids: [] }))
      setSelectedResidents([])
      fetchResidensByProdi(value)
    } else if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectResident = (residen) => {
    if (!selectedResidents.find((r) => r.id === residen.id)) {
      const newSelected = [...selectedResidents, residen]
      setSelectedResidents(newSelected)
      setFormData((prev) => ({ ...prev, residen_ids: newSelected.map((r) => r.id.toString()) }))
    }
    setShowResidenDropdown(false)
    setResidenSearchTerm("")
    if (errors.residen_ids) setErrors((prev) => ({ ...prev, residen_ids: "" }))
  }

  const handleRemoveResident = (residenId) => {
    const newSelected = selectedResidents.filter((r) => r.id !== residenId)
    setSelectedResidents(newSelected)
    setFormData((prev) => ({ ...prev, residen_ids: newSelected.map((r) => r.id.toString()) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const tid = toast.loading(editMode ? "Memperbarui data..." : "Menyimpan data...")

    const data = new FormData()
    Object.keys(formData).forEach((key) => {
      if (key === "residen_ids") {
        formData.residen_ids.forEach((id) => data.append("residen_ids[]", id))
      } else if (key === "file") {
        if (formData.file) data.append("file", formData.file)
      } else {
        data.append(key, formData[key] || "")
      }
    })

    if (editMode) data.append("_method", "PUT")

    try {
      const url = editMode
        ? `${API_BASE_URL}/api/pelanggaran-residens/${currentItem.id}`
        : `${API_BASE_URL}/api/pelanggaran-residens`

      const response = await axios.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.data.success) {
        toast.success(response.data.message, { id: tid })
        setShowModal(false)
        fetchPelanggaranResidens(term, pagination.activePage, filters)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving data:", error)
      const message = error.response?.data?.message || "Gagal menyimpan data"
      setErrors(error.response?.data?.errors || {})
      toast.error(message, { id: tid })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (data) => {
    setEditMode(true)
    setCurrentItem(data)
    setFormData({
      prodi_id: data.prodi?.id?.toString() || "",
      pelanggaran_id: data.pelanggaran?.id?.toString() || "",
      kronologi: data.kronologi || "",
      sanksi: data.sanksi || "",
      file: null,
      residen_ids: data.residens?.map((r) => r.id.toString()) || [],
    })
    setSelectedResidents(data.residens || [])
    fetchResidensByProdi(data.prodi?.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    setLoading(true)
    const tid = toast.loading("Menghapus data...")
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/pelanggaran-residens/${id}`)
      if (response.data.success) {
        toast.success(response.data.message, { id: tid })
        fetchPelanggaranResidens(term, pagination.activePage, filters)
      }
    } catch (error) {
      toast.error("Gagal menghapus data", { id: tid })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${pilihan.length} data yang dipilih?`)) return

    setLoading(true)
    const tid = toast.loading(`Menghapus ${pilihan.length} data...`)
    try {
      const deletePromises = pilihan.map((item) => axios.delete(`${API_BASE_URL}/api/pelanggaran-residens/${item.id}`))
      await Promise.all(deletePromises)
      toast.success(`${pilihan.length} data berhasil dihapus`, { id: tid })
      setPilihan([])
      setSelectAll(false)
      fetchPelanggaranResidens(term, pagination.activePage, filters)
    } catch (error) {
      toast.error("Gagal menghapus beberapa data", { id: tid })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    if (checked) {
      setPilihan([...pelanggaranResidens])
    } else {
      setPilihan([])
    }
  }

  const handleCheck = (e, item) => {
    const checked = e.target.checked
    if (checked) {
      setPilihan((prev) => [...prev, item])
    } else {
      setPilihan((prev) => prev.filter((p) => p.id !== item.id))
      setSelectAll(false)
    }
  }

  const resetForm = () => {
    const isProdi = user?.roles?.[0]?.name === "prodi" || user?.roles?.[0]?.name === "admin_prodi"
    const initialProdiId = isProdi && user?.prodi?.id ? user.prodi.id.toString() : ""

    setFormData({
      prodi_id: initialProdiId,
      pelanggaran_id: "",
      kronologi: "",
      sanksi: "",
      file: null,
      residen_ids: [],
    })
    setSelectedResidents([])
    setResidenSearchTerm("")
    setCurrentItem(null)
    setEditMode(false)
    setErrors({})

    if (initialProdiId) fetchResidensByProdi(initialProdiId)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const filteredResidentsList = residenOptions
    .filter((residen) =>
      residen.name.toLowerCase().includes(residenSearchTerm.toLowerCase()) ||
      residen.username.toLowerCase().includes(residenSearchTerm.toLowerCase())
    )
    .filter((residen) => !selectedResidents.some((selected) => selected.id === residen.id))

  const isProdiUser = user?.roles?.[0]?.name === "prodi" || user?.roles?.[0]?.name === "admin_prodi"

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header border-bottom-0 pb-0 bg-transparent shadow-none">
          <Row className="w-100 align-items-center">
            <Col>
              <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Data Pelanggaran Residen</h1>
              <p className="text-muted mt-1">Kelola data pelanggaran dan sanksi bagi residen.</p>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Badge bg="soft-primary" className="text-primary px-3 py-2 rounded-pill fw-bold mr-2">
                  Total: {pagination.total}
                </Badge>
                <Button
                  variant="primary"
                  onClick={openAddModal}
                  className="fw-bold shadow-sm px-4"
                  style={{ borderRadius: '10px' }}
                >
                  <i className="fas fa-plus mr-2"></i> Tambah Data
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        <div className="section-body mt-4">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <Form onSubmit={handleSearch}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Cari Pelanggaran / Residen</Form.Label>
                    <InputGroup className="bg-light border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="bg-transparent border-0"
                        placeholder="Ketik kata kunci..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        style={{ height: '45px' }}
                      />
                    </InputGroup>
                  </Col>

                  {!isProdiUser && (
                    <Col md={3}>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Program Studi</Form.Label>
                      <Form.Select
                        className="bg-light border-0"
                        style={{ borderRadius: '10px', height: '45px' }}
                        value={filters.prodi_id}
                        onChange={(e) => handleFilterChange("prodi_id", e.target.value)}
                      >
                        <option value="">Semua Prodi</option>
                        {prodiOptions.map((prodi) => (
                          <option key={prodi.id} value={prodi.id}>{prodi.name}</option>
                        ))}
                      </Form.Select>
                    </Col>
                  )}

                  <Col md={isProdiUser ? 4 : 3}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Jenis Pelanggaran</Form.Label>
                    <Form.Select
                      className="bg-light border-0"
                      style={{ borderRadius: '10px', height: '45px' }}
                      value={filters.pelanggaran_id}
                      onChange={(e) => handleFilterChange("pelanggaran_id", e.target.value)}
                    >
                      <option value="">Semua Pelanggaran</option>
                      {pelanggaranOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama_pelanggaran}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={isProdiUser ? 4 : 2}>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 fw-bold shadow-sm mr-1"
                        style={{ borderRadius: '10px', height: '45px' }}
                        disabled={loading}
                      >
                        {isSearching ? <Spinner size="sm" /> : 'Cari'}
                      </Button>
                      <Button
                        variant="soft-secondary"
                        onClick={clearFilters}
                        className="fw-bold px-3"
                        style={{ borderRadius: '10px', height: '45px', backgroundColor: '#f1f5f9', border: 'none' }}
                        title="Reset Filter"
                      >
                        <i className="fas fa-sync-alt"></i>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {pilihan.length > 0 && (
            <div className="mb-3 animate__animated animate__fadeIn">
              <Button
                variant="danger"
                className="rounded-pill px-4 fw-bold shadow-sm"
                onClick={handleDeleteAll}
                disabled={loading}
              >
                <i className="fas fa-trash-alt mr-2"></i> Hapus yang dipilih ({pilihan.length})
              </Button>
            </div>
          )}

          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-light text-muted small text-uppercase fw-bold">
                    <tr>
                      <th className="px-4 py-3 border-0 text-center" width="50">
                        <Form.Check
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 border-0">Prodi</th>
                      <th className="px-4 py-3 border-0">Pelanggaran</th>
                      <th className="px-4 py-3 border-0">Residen Terlibat</th>
                      <th className="px-4 py-3 border-0">Sanksi / Tindak Lanjut</th>
                      <th className="px-4 py-3 border-0">Berkas</th>
                      <th className="px-4 py-3 border-0 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pelanggaranResidens.length > 0 ? (
                      pelanggaranResidens.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 border-light text-center">
                            <Form.Check
                              type="checkbox"
                              checked={pilihan.some((p) => p.id === item.id)}
                              onChange={(e) => handleCheck(e, item)}
                            />
                          </td>
                          <td className="px-4 py-3 border-light">
                            <Badge bg="soft-info" className="text-info px-2 py-1 rounded fw-bold small">
                              {item.prodi?.name || "N/A"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 border-light">
                            <div className="fw-bold text-dark">{item.pelanggaran?.nama_pelanggaran || "Pelanggaran"}</div>
                            <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={item.kronologi}>
                              {item.kronologi || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-light">
                            <div className="d-flex flex-wrap gap-1">
                              {item.residens && item.residens.length > 0 ? (
                                item.residens.map((residen, idx) => (
                                  <Badge key={idx} bg="light" className="text-dark border px-2 py-1 fw-normal mr-1 mb-1" style={{ borderRadius: '5px' }}>
                                    <i className="fas fa-user-circle text-primary mr-1"></i> {residen.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted small italic">Tidak ada residen</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-light small text-muted">
                            <div className="text-wrap" style={{ minWidth: '150px' }}>
                              {item.sanksi || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {item.file ? (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill fw-bold px-3 shadow-none border-0 bg-light"
                                href={`${baseurl}/storage/${item.file}`}
                                target="_blank"
                              >
                                <i className="fas fa-file-download"></i>
                              </Button>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            <Dropdown align="end">
                              <Dropdown.Toggle as={Button} variant="link" className="p-0 text-muted shadow-none">
                                <i className="fas fa-ellipsis-v"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                                <Dropdown.Item onClick={() => handleEdit(item)} className="py-2">
                                  <i className="fas fa-edit mr-2 text-warning"></i> Edit
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
                        <td colSpan="7" className="text-center py-5">
                          <div className="opacity-20 mb-3 text-muted">
                            <i className="fas fa-exclamation-circle fa-3x"></i>
                          </div>
                          <h6 className="text-muted fw-normal">Tidak ada data pelanggaran ditemukan.</h6>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            {pagination.total > 10 && (
              <Card.Footer className="bg-white border-top-0 py-4 px-4">
                <CustomPagination
                  activePage={pagination.activePage}
                  itemsCountPerPage={10}
                  totalItemsCount={pagination.total}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                />
              </Card.Footer>
            )}
          </Card>
        </div>
      </section>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '15px' }}
      >
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold">
            {editMode ? 'Edit' : 'Tambah'} Data Pelanggaran
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Program Studi</Form.Label>
                  <Form.Select
                    name="prodi_id"
                    value={formData.prodi_id}
                    onChange={handleInputChange}
                    isInvalid={!!errors.prodi_id}
                    disabled={isProdiUser}
                    className="bg-light border-0"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">Pilih Prodi</option>
                    {prodiOptions.map((prodi) => (
                      <option key={prodi.id} value={prodi.id}>{prodi.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.prodi_id?.[0]}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Jenis Pelanggaran</Form.Label>
                  <Form.Select
                    name="pelanggaran_id"
                    value={formData.pelanggaran_id}
                    onChange={handleInputChange}
                    isInvalid={!!errors.pelanggaran_id}
                    className="bg-light border-0"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">Pilih Jenis</option>
                    {pelanggaranOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama_pelanggaran}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.pelanggaran_id?.[0]}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Residen Terlibat</Form.Label>
                  <div className="position-relative" ref={residenDropdownRef}>
                    <InputGroup className="bg-light border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="bg-transparent border-0"
                        placeholder="Cari residen..."
                        value={residenSearchTerm}
                        onChange={(e) => setResidenSearchTerm(e.target.value)}
                        onFocus={() => setShowResidenDropdown(true)}
                      />
                    </InputGroup>

                    {showResidenDropdown && filteredResidentsList.length > 0 && (
                      <div
                        className="position-absolute w-100 bg-white border shadow-sm mt-1 overflow-auto"
                        style={{ zIndex: 1000, maxHeight: '200px', borderRadius: '10px' }}
                      >
                        {filteredResidentsList.map((residen) => (
                          <div
                            key={residen.id}
                            className="p-3 border-bottom hover-bg-light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelectResident(residen)}
                          >
                            <div className="fw-bold small">{residen.name}</div>
                            <div className="text-muted extra-small">{residen.username}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {selectedResidents.map((residen) => (
                      <Badge
                        key={residen.id}
                        bg="soft-primary"
                        className="text-primary d-flex align-items-center gap-2 p-2 rounded-pill mr-1 mb-1"
                      >
                        {residen.name}
                        <i
                          className="fas fa-times-circle cursor-pointer ml-1"
                          onClick={() => handleRemoveResident(residen.id)}
                        ></i>
                      </Badge>
                    ))}
                  </div>
                  {errors.residen_ids && <div className="text-danger small mt-1">{errors.residen_ids[0]}</div>}
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Kronologi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="kronologi"
                    value={formData.kronologi}
                    onChange={handleInputChange}
                    isInvalid={!!errors.kronologi}
                    placeholder="Tuliskan kronologi kejadian..."
                    className="bg-light border-0"
                    style={{ borderRadius: '10px' }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.kronologi?.[0]}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Sanksi / Tindak Lanjut</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="sanksi"
                    value={formData.sanksi}
                    onChange={handleInputChange}
                    isInvalid={!!errors.sanksi}
                    placeholder="Tuliskan sanksi atau tindak lanjut..."
                    className="bg-light border-0"
                    style={{ borderRadius: '10px' }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.sanksi?.[0]}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-0">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Berkas Pendukung</Form.Label>
                  <Form.Control
                    type="file"
                    name="file"
                    onChange={handleInputChange}
                    isInvalid={!!errors.file}
                    className="bg-light border-0"
                    style={{ borderRadius: '10px' }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.file?.[0]}</Form.Control.Feedback>
                  <Form.Text className="extra-small text-muted italic">
                    Format: PDF, JPG, PNG (Max 2MB). Kosongkan jika tidak ada perubahan.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 p-4 pt-0">
            <Button
              variant="soft-secondary"
              onClick={() => setShowModal(false)}
              className="fw-bold px-4"
              style={{ borderRadius: '10px', backgroundColor: '#f1f5f9', border: 'none' }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="fw-bold px-4 shadow-sm"
              style={{ borderRadius: '10px' }}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : <i className="fas fa-save mr-2"></i>}
              {editMode ? 'Update Data' : 'Simpan Data'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default PelanggaranResidenManagement
