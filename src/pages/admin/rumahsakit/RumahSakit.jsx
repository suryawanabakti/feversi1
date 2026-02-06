"use client"

import { useEffect, useState } from "react"
import axios from "../../../api/axios"
import Create from "./Create"

const RumahSakit = () => {
  const [rowPerPage, setRowPerPage] = useState(10)
  const [rumahSakit, setRumahSakit] = useState([])
  const [filteredRumahSakit, setFilteredRumahSakit] = useState([])
  const [show, setShow] = useState(false)
  const [showEdt, setShowEdt] = useState(false)
  const [pilihan, setPilihan] = useState([])
  const [loading, setLoading] = useState(false)
  const [rumahSakitId, setRumahSakitId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState([])
  const [errors, setErrors] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [kategori, setKategori] = useState([])
  const [newKategori, setNewKategori] = useState("")

  const addKategori = () => {
    if (newKategori.trim() && !kategori.includes(newKategori.trim())) {
      setKategori([...kategori, newKategori.trim()])
      setNewKategori("")
    }
  }

  const removeKategori = (index) => {
    setKategori(kategori.filter((_, i) => i !== index))
  }

  const applyFilters = () => {
    let filtered = rumahSakit

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (selectedKategoriFilter.length > 0) {
      filtered = filtered.filter((item) => {
        if (!item.kategori || item.kategori.length === 0) return false
        return selectedKategoriFilter.some((filterKat) => item.kategori.includes(filterKat))
      })
    }

    setFilteredRumahSakit(filtered)
    setCurrentPage(1)
  }

  const handleKategoriFilterChange = (kategoriValue, checked) => {
    let newSelectedKategori
    if (checked) {
      newSelectedKategori = [...selectedKategoriFilter, kategoriValue]
    } else {
      newSelectedKategori = selectedKategoriFilter.filter((item) => item !== kategoriValue)
    }
    setSelectedKategoriFilter(newSelectedKategori)
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedKategoriFilter([])
    setFilteredRumahSakit(rumahSakit)
    setCurrentPage(1)
  }

  const handleSave = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      const res = await axios.put("/api/rumahsakit/" + rumahSakitId, {
        name,
        is_active: isActive,
        kategori: kategori,
      })
      alert("Berhasil Mengubah Rumah Sakit: " + name)
      setErrors([])
      console.log(res)
      getRumahSakit()
      handleCloseEdt()
    } catch (err) {
      alert("Gagal Mengubah Rumah Sakit")
      console.log(err)
      if (err.code == "ERR_NETWORK") {
        alert("Gagal Mengubah rumah sakit, koneksi bermasalah")
      }
      if (err.response) {
        if (err.response.status == 422) {
          setErrors(err.response.data.errors)
        }
      }
    }
    setLoading(false)
  }

  const handleShowEdt = async (rumahSakitId) => {
    setRumahSakitId(rumahSakitId)
    try {
      const res = await axios.get("/api/rumahsakit/" + rumahSakitId)
      setName(res.data.data.name) // Updated to access data via resource wrapper
      setIsActive(res.data.data.is_active ?? true)
      setKategori(res.data.data.kategori || [])
      setShowEdt(true)
    } catch (err) {
      alert("Gagal ambil data rumah sakit")
    }
  }

  const handleCloseEdt = () => {
    setShowEdt(false)
    setName("")
    setIsActive(true)
    setKategori([])
    setNewKategori("")
    setErrors([])
  }

  const addRumahsakit = (rumah) => {
    const newData = [...rumahSakit, rumah]
    setRumahSakit(newData)
    if (searchTerm.trim() === "" && selectedKategoriFilter.length === 0) {
      setFilteredRumahSakit(newData)
    } else {
      applyFilters()
    }
  }

  const getRumahSakit = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/rumahsakit")
      setRumahSakit(res.data.data) // Updated to access data via resource wrapper
      setFilteredRumahSakit(res.data.data)
    } catch (err) {
      console.log(err)
      alert("Gagal Mengambil Data Rumah Sakit")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (pilihan.length === 0) return

    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus ${pilihan.length} rumah sakit?`)
    if (!confirmed) return

    const selectedIDs = new Set(pilihan)
    setLoading(true)

    try {
      await axios.post("/api/rumahsakit/delete-bulk", { pilihan })
      alert(`Berhasil hapus ${pilihan.length} rumah sakit`)
      const newData = rumahSakit.filter((x) => !selectedIDs.has(x.id))
      setRumahSakit(newData)
      setFilteredRumahSakit(newData)
      setPilihan([])
    } catch (err) {
      console.log(err)
      alert("Gagal hapus rumah sakit, rumah sakit sudah digunakan")
    }
    setLoading(false)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageData = getCurrentPageData()
      const currentPageIds = currentPageData.map((item) => item.id)
      setPilihan([...new Set([...pilihan, ...currentPageIds])])
    } else {
      const currentPageData = getCurrentPageData()
      const currentPageIds = currentPageData.map((item) => item.id)
      setPilihan(pilihan.filter((id) => !currentPageIds.includes(id)))
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setPilihan([...pilihan, id])
    } else {
      setPilihan(pilihan.filter((item) => item !== id))
    }
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowPerPage
    const endIndex = startIndex + rowPerPage
    return filteredRumahSakit.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredRumahSakit.length / rowPerPage)

  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedKategoriFilter, rumahSakit])

  useEffect(() => {
    getRumahSakit()
  }, [])

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header mb-4">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>
              <h1 className="mb-1">
                <i className="fas fa-hospital text-primary mr-2"></i>
                Manajemen Rumah Sakit
              </h1>
              <p className="text-muted mb-0">Kelola data rumah sakit dalam sistem</p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge badge-info px-3 py-2 mr-2">
                <i className="fas fa-database mr-1"></i>
                Total: {filteredRumahSakit.length}
              </span>
              <span className="badge badge-success px-3 py-2">
                <i className="fas fa-check-circle mr-1"></i>
                Aktif: {filteredRumahSakit.filter((rs) => rs.is_active).length}
              </span>
            </div>
          </div>
        </div>

        <div className="section-body">
          <div className="row text-align-center">
            <div className="col-2">
              <div className="form-group mb-0">
                <label className="small text-muted mb-1">Tampilkan Data</label>
                <select
                  className="form-control form-control-sm"
                  value={rowPerPage}
                  onChange={(e) => setRowPerPage(Number.parseInt(e.target.value))}
                >
                  <option value={5}>5 Data</option>
                  <option value={10}>10 Data</option>
                  <option value={20}>20 Data</option>
                  <option value={40}>40 Data</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group mb-0">
                <label className="small text-muted mb-1">Pencarian</label>
                <div className="input-group input-group-sm">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari rumah sakit..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group mb-0">
                <label className="small text-muted mb-1">Filter Kategori</label>
                <div className="d-flex flex-row">
                  <div className="custom-control custom-checkbox custom-control-sm mb-1">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="filterPendidikan"
                      checked={selectedKategoriFilter.includes("Pendidikan")}
                      onChange={(e) => handleKategoriFilterChange("Pendidikan", e.target.checked)}
                    />
                    <label className="custom-control-label small" htmlFor="filterPendidikan">

                      Pendidikan
                    </label>
                  </div>
                  <div className="custom-control custom-checkbox custom-control-sm">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="filterJejaring"
                      checked={selectedKategoriFilter.includes("Jejaring")}
                      onChange={(e) => handleKategoriFilterChange("Jejaring", e.target.checked)}
                    />
                    <label className="custom-control-label small" htmlFor="filterJejaring">

                      Jejaring
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5 text-right">
              {(searchTerm.trim() !== "" || selectedKategoriFilter.length > 0) && (
                <button className="btn btn-outline-secondary btn-sm mr-2" onClick={clearAllFilters}>
                  <i className="fas fa-times mr-1"></i>
                  Clear Filter
                </button>
              )}
              <button className="btn btn-primary btn-sm mr-2" onClick={handleShow}>
                <i className="fas fa-plus mr-1"></i>
                Tambah
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={pilihan.length === 0 || loading}
                onClick={handleDeleteAll}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash mr-1"></i>
                    Hapus {pilihan.length > 0 && `(${pilihan.length})`}
                  </>
                )}
              </button>
            </div>
            {(searchTerm.trim() !== "" || selectedKategoriFilter.length > 0) && (
              <div className="row mt-2">
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <small className="text-muted mr-2">Filter aktif:</small>
                    {searchTerm.trim() !== "" && (
                      <span className="badge badge-primary mr-1">
                        <i className="fas fa-search mr-1"></i>"{searchTerm}"
                      </span>
                    )}
                    {selectedKategoriFilter.map((kat) => (
                      <span
                        key={kat}
                        className={`badge mr-1 ${kat === "Pendidikan" ? "badge-info" : "badge-success"}`}
                      >
                        <i
                          className={`fas ${kat === "Pendidikan" ? "fa-graduation-cap" : "fa-network-wired"} mr-1`}
                        ></i>
                        {kat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th width="50">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            getCurrentPageData().length > 0 &&
                            getCurrentPageData().every((item) => pilihan.includes(item.id))
                          }
                        />
                      </th>
                      <th>Nama Rumah Sakit</th>
                      <th width="200">Kategori</th>
                      <th width="150">Status</th>
                      <th width="100">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                          <p className="mt-2 text-muted">Memuat data...</p>
                        </td>
                      </tr>
                    ) : getCurrentPageData().length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <i className="fas fa-hospital fa-3x text-muted mb-2"></i>
                          <p className="text-muted">
                            {searchTerm || selectedKategoriFilter.length > 0
                              ? "Tidak ada data yang sesuai dengan filter"
                              : "Belum ada data rumah sakit"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      getCurrentPageData().map((hospital) => (
                        <tr key={hospital.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={pilihan.includes(hospital.id)}
                              onChange={(e) => handleSelectItem(hospital.id, e.target.checked)}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-hospital text-primary mr-2"></i>
                              <span className="font-weight-medium">{hospital.name}</span>
                            </div>
                          </td>
                          <td>
                            {hospital.kategori && hospital.kategori.length > 0 ? (
                              <div>
                                {hospital.kategori.map((kat, index) => (
                                  <span
                                    key={index}
                                    className={`badge mr-1 mb-1 ${kat === "Pendidikan" ? "badge-info" : kat === "Jejaring" ? "badge-success" : "badge-secondary"}`}
                                  >
                                    <i
                                      className={`fas ${kat === "Pendidikan" ? "fa-graduation-cap" : kat === "Jejaring" ? "fa-network-wired" : "fa-tag"} mr-1`}
                                    ></i>
                                    {kat}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">
                                <i className="fas fa-minus mr-1"></i>
                                Tidak ada kategori
                              </span>
                            )}
                          </td>
                          <td>
                            {hospital.is_active ? (
                              <span className="badge badge-success px-3 py-2">
                                <i className="fas fa-check-circle mr-1"></i>
                                Aktif
                              </span>
                            ) : (
                              <span className="badge badge-secondary px-3 py-2">
                                <i className="fas fa-times-circle mr-1"></i>
                                Tidak Aktif
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              title="Edit Rumah Sakit"
                              onClick={() => handleShowEdt(hospital.id)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Menampilkan {(currentPage - 1) * rowPerPage + 1} -{" "}
                      {Math.min(currentPage * rowPerPage, filteredRumahSakit.length)} dari {filteredRumahSakit.length}{" "}
                      data
                    </small>
                    <div>
                      <button
                        className="btn btn-outline-secondary btn-sm mr-2"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showEdt && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title font-weight-bold">
                  <i className="fas fa-plus-circle mr-2"></i>
                  Edit Rumah Sakit
                </h5>
                <button type="button" className="close text-white" onClick={handleClose}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle mr-2"></i>
                    Lengkapi form di bawah untuk menambah rumah sakit baru
                  </div>

                  <div className="form-group mb-3">
                    <label className="font-weight-bold">
                      <i className="fas fa-hospital mr-2"></i>
                      Nama Rumah Sakit <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan Nama Rumah Sakit..."
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">
                        <small>{errors.name[0]}</small>
                      </div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label className="font-weight-bold">
                      <i className="fas fa-tags mr-2"></i>
                      Kategori
                    </label>
                    <div className="mt-2">
                      <div className="custom-control custom-checkbox mb-2">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="kategoriPendidikan"
                          checked={kategori.includes("Pendidikan")}
                          onChange={(e) => handleKategoriChange("Pendidikan", e.target.checked)}
                        />
                        <label className="custom-control-label" htmlFor="kategoriPendidikan">
                          <i className="fas fa-graduation-cap mr-2 text-info"></i>
                          Pendidikan
                        </label>
                      </div>
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="kategoriJejaring"
                          checked={kategori.includes("Jejaring")}
                          onChange={(e) => handleKategoriChange("Jejaring", e.target.checked)}
                        />
                        <label className="custom-control-label" htmlFor="kategoriJejaring">
                          <i className="fas fa-network-wired mr-2 text-success"></i>
                          Jejaring
                        </label>
                      </div>
                    </div>
                    {errors.kategori && (
                      <div className="text-danger mt-1">
                        <small>{errors.kategori[0]}</small>
                      </div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <label className="font-weight-bold mb-1">
                          <i className="fas fa-toggle-on mr-2 text-success"></i>
                          Status Aktif
                        </label>
                        <div className="text-muted small">
                          {isActive ? (
                            <span className="text-success">Rumah sakit akan aktif dalam sistem</span>
                          ) : (
                            <span className="text-warning">Rumah sakit akan tidak aktif dalam sistem</span>
                          )}
                        </div>
                      </div>
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="isActiveSwitch"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label className="custom-control-label" htmlFor="isActiveSwitch">
                          {isActive ? (
                            <span className="badge badge-success">Aktif</span>
                          ) : (
                            <span className="badge badge-secondary">Tidak Aktif</span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                    <i className="fas fa-times mr-2"></i>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Create addRumahsakit={addRumahsakit} show={show} handleClose={handleClose} getRumahSakit={getRumahSakit} />
    </div>
  )
}

export default RumahSakit
