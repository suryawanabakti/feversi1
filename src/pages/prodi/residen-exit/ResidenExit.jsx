"use client"

import { useState, useEffect } from "react"
import axios from "../../../api/axios"

import UserSearchSelect from "./UserSearchSelect"
import baseurl from "../../../api/baseurl"

const ResidenExitCRUD = () => {
  const [residenExits, setResidenExits] = useState([])
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
  const [formData, setFormData] = useState({
    user_id: "",
    alasan: "",
    file: null,
  })
  const [errors, setErrors] = useState({})

  const API_BASE_URL = baseurl

  useEffect(() => {
    fetchResidenExits()
  }, [])

  const fetchResidenExits = async (searchTerm = "", pageNum = 1) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/residen-exits`, {
        params: {
          search: searchTerm,
          page: pageNum,
        },
      })
      if (response.data.success) {
        const data = response.data.data
        setResidenExits(data.data || [])
        setTotal(data.meta?.total || data.total || 0)
        setLinks(data.meta?.links || data.links || [])
        setPage(data.meta?.current_page || data.current_page || 1)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Gagal mengambil data")
    } finally {
      setLoading(false)
    }
  }

  const getResidenExitsByTerm = async (e, pageNum = null) => {
    if (e) e.preventDefault()
    setIsSearching(true)
    await fetchResidenExits(term, pageNum || page)
    setIsSearching(false)
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

  const handleUserChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      user_id: userId,
    }))

    if (errors.user_id) {
      setErrors((prev) => ({
        ...prev,
        user_id: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const submitData = new FormData()
    submitData.append("user_id", formData.user_id)
    submitData.append("alasan", formData.alasan)
    if (formData.file) {
      submitData.append("file", formData.file)
    }

    try {
      let response
      if (editMode) {
        submitData.append("_method", "PUT")
        // Laravel sometimes handles PUT with files better via POST + _method
        response = await axios.post(`${API_BASE_URL}/api/residen-exits/${currentItem.id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        response = await axios.post(`${API_BASE_URL}/api/residen-exits`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      if (response.data.success) {
        alert(response.data.message)
        setShowModal(false)
        resetForm()
        fetchResidenExits(term, page)
      }
    } catch (error) {
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
      user_id: item.user_id,
      alasan: item.alasan,
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
      const response = await axios.delete(`${API_BASE_URL}/api/residen-exits/${id}`)
      if (response.data.success) {
        alert(response.data.message)
        fetchResidenExits(term, page)
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
      const deletePromises = pilihan.map((item) => axios.delete(`${API_BASE_URL}/api/residen-exits/${item.id}`))
      await Promise.all(deletePromises)
      alert(`${pilihan.length} data berhasil dihapus`)
      setPilihan([])
      setSelectAll(false)
      fetchResidenExits(term, page)
    } catch (error) {
      alert("Gagal menghapus data")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/residen-exits/${id}/download`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `file_${id}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert("Gagal mendownload file")
    }
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    if (checked) {
      setPilihan([...residenExits])
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
      user_id: "",
      alasan: "",
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

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="mr-3">Residen Exit</h1>
            <span className="badge badge-primary p-2">Total: {total}</span>
          </div>
          <div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus-circle mr-1"></i> Tambah Data
            </button>
          </div>
        </div>

        <div className="section-body">
          <div className="card">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
                <div className="d-flex mb-2 mb-md-0">
                  {/* <a
                    href={`${API_BASE_URL}/api/residen-exits-export`}
                    className="btn btn-success mr-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-file-excel mr-1"></i> Export Excel
                  </a> */}
                </div>

                <div className="d-flex align-items-center">
                  <form onSubmit={getResidenExitsByTerm} className="mr-2">
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
                      <th>User</th>
                      <th>Alasan</th>
                      <th>File</th>
                      <th>Tanggal Dibuat</th>

                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residenExits.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="d-flex flex-column align-items-center">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Tidak ada data residen exit ditemukan</h5>
                            {term && <p className="text-muted">Tidak ada hasil untuk pencarian "{term}"</p>}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      residenExits.map((data, index) => (
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
                            <div>
                              <strong className="text-primary">{data.user?.name}</strong>
                              <br />
                              <small className="text-muted">{data.user?.username && `@${data.user.username} • `}</small>
                            </div>
                          </td>
                          <td>
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "200px" }}
                              title={data.alasan}
                            >
                              {data.alasan}
                            </span>
                          </td>
                          <td>
                            {data.file ? (
                              <a
                                className="btn btn-sm btn-outline-info"
                                href={`${baseurl}/storage/${data.file}`}
                                title="Download File"
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
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleEdit(data)}
                                disabled={loading}
                                title="Edit Data"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(data.id)}
                                disabled={loading}
                                title="Hapus Data"
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
                            getResidenExitsByTerm(null, data.label)
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
                    {editMode ? "Edit Data" : "Tambah Data"} Residen Exit
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
                          <label className="font-weight-bold">
                            <i className="fas fa-user mr-1"></i>
                            User <span className="text-danger">*</span>
                          </label>
                          <UserSearchSelect
                            value={formData.user_id}
                            onChange={handleUserChange}
                            error={errors.user_id ? errors.user_id[0] : ""}
                            required={true}
                            placeholder="Cari user minimal 3 huruf..."
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="file" className="font-weight-bold">
                            <i className="fas fa-file mr-1"></i>
                            File {!editMode && <span className="text-danger">*</span>}
                          </label>
                          <div className="custom-file">
                            <input
                              type="file"
                              className={`custom-file-input ${errors.file ? "is-invalid" : ""}`}
                              id="file"
                              name="file"
                              onChange={handleInputChange}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              required={!editMode}
                            />
                            <label className="custom-file-label" htmlFor="file">
                              {formData.file ? formData.file.name : "Pilih file..."}
                            </label>
                          </div>
                          <small className="form-text text-muted">
                            <i className="fas fa-info-circle mr-1"></i>
                            Format: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimall 2MB.
                          </small>
                          {errors.file && <div className="invalid-feedback d-block">{errors.file[0]}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="alasan" className="font-weight-bold">
                        <i className="fas fa-list mr-1"></i>
                        Alasan <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.alasan ? "is-invalid" : ""}`}
                        id="alasan"
                        name="alasan"
                        value={formData.alasan}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Pilih alasan...</option>
                        <option value="DO">DO (Drop Out)</option>
                        <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                        <option value="Skorsing">Skorsing</option>
                        <option value="Meninggal">Meninggal</option>
                      </select>
                      {errors.alasan && <div className="invalid-feedback">{errors.alasan[0]}</div>}
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
          {/* <div className="modal-backdrop fade show"></div> */}
        </>
      )}
    </div>
  )
}

export default ResidenExitCRUD
