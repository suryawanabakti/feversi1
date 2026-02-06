"use client"

import { useState, useEffect } from "react"
import axios from "../../../api/axios"
import baseurl from "../../../api/baseurl"
import useAuthContext from "../../../context/AuthContext"

const PelanggaranManagement = () => {
  const { user } = useAuthContext()
  const [pelanggarans, setPelanggarans] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [selectAll, setSelectAll] = useState(false)
  const [pilihan, setPilihan] = useState([])
  const [term, setTerm] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [links, setLinks] = useState([])

  // Filter states
  const [filters, setFilters] = useState({

    tingkat: "",
  })


  const [showFilters, setShowFilters] = useState(false)

  // Tingkat options
  const tingkatOptions = [
    { value: "prodi", label: "Program Studi" },
    { value: "ppds", label: "PPDS" },
    { value: "fakultas", label: "Fakultas" },
  ]

  const [formData, setFormData] = useState({

    tingkat: "",
    nama_pelanggaran: "",
    sanksi: "",
    file: null,
  })

  const [errors, setErrors] = useState({})
  const API_BASE_URL = baseurl

  useEffect(() => {
    fetchPelanggarans()

  }, [])



  const fetchPelanggarans = async (searchTerm = "", pageNum = 1, filterParams = {}) => {
    setLoading(true)
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

      const response = await axios.get(`${API_BASE_URL}/api/pelanggarans`, { params })
      console.log(response)

      if (response.data.success) {
        const data = response.data.data
        setPelanggarans(data.data || [])
        setTotal(data.total || 0)
        setLinks(data.links || [])
        setPage(data.current_page || 1)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Gagal mengambil data")
    } finally {
      setLoading(false)
    }
  }

  const getPelanggaransByTerm = async (e, pageNum = null) => {
    if (e) e.preventDefault()
    setIsSearching(true)
    await fetchPelanggarans(term, pageNum || page, filters)
    setIsSearching(false)
  }

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value,
    }
    setFilters(newFilters)
    setPage(1) // Reset to first page when filtering
    fetchPelanggarans(term, 1, newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {

      tingkat: "",
    }
    setFilters(clearedFilters)
    setPage(1)
    fetchPelanggarans(term, 1, clearedFilters)
  }

  const hasActiveFilters = () => {
    return filters.tingkat !== ""
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const submitData = new FormData()

    submitData.append("tingkat", formData.tingkat)
    submitData.append("nama_pelanggaran", formData.nama_pelanggaran)
    submitData.append("sanksi", formData.sanksi)

    if (formData.file) {
      submitData.append("file", formData.file)
    }

    try {
      let response
      if (editMode) {
        submitData.append("_method", "PUT")
        response = await axios.post(`${API_BASE_URL}/api/pelanggarans/${currentItem.id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        response = await axios.post(`${API_BASE_URL}/api/pelanggarans`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      if (response.data.success) {
        alert(response.data.message)
        setShowModal(false)
        resetForm()
        fetchPelanggarans(term, page, filters)
      }
    } catch (error) {
      console.log("ERROR TAMBAH DATA", error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        alert("Terjadi kesalahan: " + (error.response?.data?.message || error.message))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setCurrentItem(item)
    setFormData({

      tingkat: item.tingkat || "",
      nama_pelanggaran: item.nama_pelanggaran,
      sanksi: item.sanksi,
      file: null,
    })
    setEditMode(true)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/pelanggarans/${id}`)
      if (response.data.success) {
        alert(response.data.message)
        fetchPelanggarans(term, page, filters)
      }
    } catch (error) {
      alert("Gagal menghapus data: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${pilihan.length} data yang dipilih?`)) {
      return
    }

    setLoading(true)
    try {
      const deletePromises = pilihan.map((item) => axios.delete(`${API_BASE_URL}/api/pelanggarans/${item.id}`))
      await Promise.all(deletePromises)
      alert(`${pilihan.length} data berhasil dihapus`)
      setPilihan([])
      setSelectAll(false)
      fetchPelanggarans(term, page, filters)
    } catch (error) {
      alert("Gagal menghapus data")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    if (checked) {
      setPilihan([...pelanggarans])
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
    setFormData({

      tingkat: "",
      nama_pelanggaran: "",
      sanksi: "",
      file: null,
    })
    setCurrentItem(null)
    setEditMode(false)
    setErrors({})
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getTingkatBadgeClass = (tingkat) => {
    switch (tingkat) {
      case "prodi":
        return "badge-primary"
      case "ppds":
        return "badge-success"
      case "fakultas":
        return "badge-warning"
      default:
        return "badge-secondary"
    }
  }

  const getTingkatLabel = (tingkat) => {
    const option = tingkatOptions.find((opt) => opt.value === tingkat)
    return option ? option.label : tingkat
  }

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="mr-3">Data Pelanggaran</h1>
            <span className="badge badge-primary p-2">Total: {total}</span>
            {hasActiveFilters() && (
              <span className="badge badge-info p-2 ml-2">
                <i className="fas fa-filter mr-1"></i>
                Filter Aktif
              </span>
            )}
          </div>
          {user?.roles?.[0]?.name === "admin" && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus mr-1"></i>
              Tambah Pelanggaran
            </button>
          )}
        </div>

        <div className="section-body">
          <div className="card">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
                <div className="d-flex mb-2 mb-md-0">
                  {user?.roles?.[0]?.name === "admin" && (
                    <button className="btn btn-outline-secondary mr-2" onClick={() => setShowFilters(!showFilters)}>
                      <i className={`fas fa-filter mr-1 ${hasActiveFilters() ? "text-primary" : ""}`}></i>
                      Filter
                      {hasActiveFilters() && <span className="badge badge-primary ml-1">!</span>}
                    </button>
                  )}
                </div>

                <div className="d-flex align-items-center">
                  <form onSubmit={getPelanggaransByTerm} className="mr-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cari data..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                      />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="submit" disabled={isSearching}>
                          {isSearching ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          ) : (
                            <i className="fas fa-search"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {pilihan.length > 0 && (
                    <button className="btn btn-danger" onClick={handleDeleteAll} disabled={loading}>
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <i className="fas fa-trash mr-1"></i>
                          Hapus ({pilihan.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-3 p-3 bg-light rounded">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group mb-2">
                        <label className="form-label font-weight-bold">
                          <i className="fas fa-layer-group mr-1"></i>
                          Tingkat
                        </label>
                        <select
                          className="form-control"
                          value={filters.tingkat}
                          onChange={(e) => handleFilterChange("tingkat", e.target.value)}
                        >
                          <option value="">Semua Tingkat</option>
                          {tingkatOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>



                    <div className="col-md-4 d-flex align-items-end">
                      <div className="form-group mb-2">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={clearFilters}
                          disabled={!hasActiveFilters()}
                        >
                          <i className="fas fa-times mr-1"></i>
                          Reset Filter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="thead-light">
                    <tr>
                      <th width="40">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="selectAll"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                          <label className="custom-control-label" htmlFor="selectAll"></label>
                        </div>
                      </th>
                      <th>Tingkat</th>

                      <th>Nama Pelanggaran</th>
                      <th>Sanksi</th>
                      <th>File</th>
                      <th>Tanggal Dibuat</th>
                      <th width="120">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pelanggarans.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="d-flex flex-column align-items-center">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Tidak ada data pelanggaran ditemukan</h5>
                            {(term || hasActiveFilters()) && (
                              <p className="text-muted">
                                Tidak ada hasil untuk pencarian "{term}"
                                {hasActiveFilters() && " dengan filter yang diterapkan"}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pelanggarans.map((data, index) => (
                        <tr key={data.id}>
                          <td>
                            <div className="custom-control custom-checkbox">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={`check-${data.id}`}
                                checked={pilihan.some((item) => item.id === data.id) || selectAll}
                                onChange={(e) => handleCheck(e, data)}
                              />
                              <label className="custom-control-label" htmlFor={`check-${data.id}`}></label>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getTingkatBadgeClass(data.tingkat)}`}>
                              {getTingkatLabel(data.tingkat)}
                            </span>
                          </td>

                          <td>
                            <div>
                              <strong className="text-primary">{data.nama_pelanggaran}</strong>
                            </div>
                          </td>
                          <td>
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "200px" }}
                              title={data.sanksi}
                            >
                              {data.sanksi}
                            </span>
                          </td>
                          <td>
                            {data.file ? (
                              <a
                                className="btn btn-sm btn-outline-info"
                                href={`${baseurl}/storage/${data.file}`}
                                title="Download File"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="fas fa-download mr-1"></i>
                                File
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(data.created_at).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button className="btn btn-sm btn-warning" onClick={() => handleEdit(data)} title="Edit">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(data.id)}
                                title="Hapus"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-footer bg-white">
              <nav>
                <ul className="pagination justify-content-center mb-0">
                  {links.map((data, index) => (
                    <li
                      className={`page-item ${data.label == page ? "active" : ""} ${data.url == null ? "disabled" : ""
                        }`}
                      key={index}
                    >
                      <button
                        className="page-link"
                        onClick={(e) => {
                          e.preventDefault()
                          if (data.url) {
                            getPelanggaransByTerm(null, data.label)
                          }
                        }}
                        disabled={data.url == null}
                      >
                        {data.label === "&laquo; Previous" ? (
                          <span aria-hidden="true">&laquo;</span>
                        ) : data.label === "Next &raquo;" ? (
                          <span aria-hidden="true">&raquo;</span>
                        ) : (
                          data.label
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className={`fas ${editMode ? "fa-edit" : "fa-plus"} mr-2`}></i>
                    {editMode ? "Edit Data" : "Tambah Data"} Pelanggaran
                  </h5>
                  <button type="button" className="close text-white" onClick={() => setShowModal(false)}>
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="tingkat" className="font-weight-bold">
                            <i className="fas fa-layer-group mr-1"></i>
                            Tingkat <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-control ${errors.tingkat ? "is-invalid" : ""}`}
                            id="tingkat"
                            name="tingkat"
                            value={formData.tingkat}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Pilih Tingkat</option>
                            {tingkatOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.tingkat && <div className="invalid-feedback">{errors.tingkat[0]}</div>}
                        </div>
                      </div>


                      <div className="col-md-12">
                        <div className="form-group">
                          <label htmlFor="file" className="font-weight-bold">
                            <i className="fas fa-file mr-1"></i>
                            File Pendukung
                          </label>
                          <div className="custom-file">
                            <input
                              type="file"
                              className={`custom-file-input ${errors.file ? "is-invalid" : ""}`}
                              id="file"
                              name="file"
                              onChange={handleInputChange}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <label className="custom-file-label" htmlFor="file">
                              {formData.file ? formData.file.name : "Pilih file..."}
                            </label>
                          </div>
                          <small className="form-text text-muted">
                            <i className="fas fa-info-circle mr-1"></i>
                            Format: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 2MB.
                          </small>
                          {errors.file && <div className="invalid-feedback d-block">{errors.file[0]}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="nama_pelanggaran" className="font-weight-bold">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Nama Pelanggaran <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nama_pelanggaran ? "is-invalid" : ""}`}
                        id="nama_pelanggaran"
                        name="nama_pelanggaran"
                        value={formData.nama_pelanggaran}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama pelanggaran..."
                        required
                      />
                      {errors.nama_pelanggaran && <div className="invalid-feedback">{errors.nama_pelanggaran[0]}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="sanksi" className="font-weight-bold">
                        <i className="fas fa-gavel mr-1"></i>
                        Sanksi
                      </label>
                      <textarea
                        className={`form-control ${errors.sanksi ? "is-invalid" : ""}`}
                        id="sanksi"
                        name="sanksi"
                        value={formData.sanksi}
                        onChange={handleInputChange}
                        placeholder="Masukkan sanksi yang diberikan..."
                        rows="3"

                      />
                      {errors.sanksi && <div className="invalid-feedback">{errors.sanksi[0]}</div>}
                    </div>
                  </div>

                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                    >
                      <i className="fas fa-times mr-1"></i>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm mr-2" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className={`fas ${editMode ? "fa-save" : "fa-plus"} mr-1`}></i>
                          {editMode ? "Update" : "Simpan"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PelanggaranManagement
