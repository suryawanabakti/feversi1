"use client"
import { useEffect, useState } from "react"
import Select from "react-select"
import axios from "../../../api/axios"
import { toast } from "react-hot-toast"
import useAuthContext from "../../../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { Spinner, Badge } from "react-bootstrap"
import { CustomPagination } from "../../../components/custom-pagination"
import "./stase-styles.css"

const CreateStase = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [tampilkanData, setTampilkanData] = useState(15)
  const [pilihan, setPilihan] = useState([])
  const [residen, setResiden] = useState([])
  const [rumahsakit, setRumahsakit] = useState([])
  const [tahap, setTahap] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [errors, setErrors] = useState([])
  const [stase, setStase] = useState("")
  const [idRumahsakit, setIdRumahsakit] = useState("")
  const [tahun, setTahun] = useState("")
  const [bulan, setBulan] = useState("")
  const [file, setFile] = useState(null)
  const [term, setTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [tahunAjaran, setTahunAjaran] = useState([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)

  const options = [
    { value: 5, label: "Tampilkan 5 Data" },
    { value: 10, label: "Tampilkan 10 Data" },
    { value: 15, label: "Tampilkan 15 Data" },
    { value: 20, label: "Tampilkan 20 Data" },
  ]

  // Fetch academic years
  const getTahunAjaran = async () => {
    try {
      const res = await axios.get("/api/tahun")
      setTahunAjaran(res.data)
    } catch (err) {
      toast.error("Gagal memuat data tahun ajaran")
    }
  }

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validasi tipe file (opsional)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, JPEG, atau PNG")
        e.target.value = ""
        return
      }
      // Validasi ukuran file (maksimal 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (selectedFile.size > maxSize) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB")
        e.target.value = ""
        return
      }
      setFile(selectedFile)
      // Clear file error if exists
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: null }))
      }
    }
  }

  // Handle change in display data count
  const handleChangeTampilkanData = async (value) => {
    setTampilkanData(value)
    setTerm("")
    await getResiden(1, "", value) // Reset term and page to 1
  }

  // Save stase data
  const handleSave = async () => {
    if (pilihan.length === 0) {
      toast.error("Pilih minimal satu residen")
      return
    }
    // Validasi jam kerja
    const invalidJamKerja = pilihan.some((resident) => !resident.jam_kerja || resident.jam_kerja <= 0)
    if (invalidJamKerja) {
      toast.error("Semua residen yang dipilih harus memiliki jam kerja yang valid (lebih dari 0)")
      return
    }
    setLoading(true)
    try {
      // Gunakan FormData untuk mengirim file
      const formData = new FormData()
      formData.append("pilihan", JSON.stringify(pilihan))
      formData.append("stase", stase)
      formData.append("idRumahsakit", idRumahsakit)
      formData.append("tahun", tahun)
      formData.append("bulan", bulan)
      formData.append("tahap", tahap)
      if (file) {
        formData.append("file", file)
      }
      const res = await axios.post("/api/stase", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      toast.success("Berhasil menambahkan stase")
      navigate("/stase")
    } catch (err) {
      if (err.response && err.response.status === 422) {
        toast.error(err.response.data.message)
        setErrors(err.response.data.errors)
      } else {
        toast.error("Gagal menambahkan stase. Silakan coba lagi.")
      }
      console.log("ERR", err)
    } finally {
      setLoading(false)
    }
  }

  // Cancel form and reset
  const cancelForm = () => {
    setErrors([])
    getResiden()
    setTerm("")
    setBulan("")
    setTahun("")
    setIdRumahsakit("")
    setStase("")
    setFile(null)
    setPilihan([])
    setSelectAllChecked(false)
    // Reset file input
    const fileInput = document.getElementById("fileInput")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Handle select all checkbox
  const handleAllCheck = (e) => {
    const isChecked = e.target.checked
    setSelectAllChecked(isChecked)
    if (isChecked) {
      // Tambahkan jam_kerja default untuk semua residen
      const residenWithJamKerja = residen.map((resident) => ({
        ...resident,
        jam_kerja: 1, // default 1 jam per minggu
        tahap: "Tahap 1", // default 1 jam per minggu
      }))
      setPilihan(residenWithJamKerja)
    } else {
      setPilihan([])
    }
  }

  // Get residents data
  const getResiden = async (pageNumber = currentPage, searchTerm = term, displayData = tampilkanData) => {
    setLoadingData(true)
    try {
      const toastId = toast.loading("Memuat data residen...")
      const res = await axios.post(`/api/stase/get-residen`, {
        tampilkanData: displayData,
        pageNumber,
        term: searchTerm,
      })
      setCurrentPage(res.data.meta.current_page)
      // setPerPage(res.data.meta.per_page) // perPage is not used directly by CustomPagination
      setTotal(res.data.meta.total)
      setResiden(res.data.data)
      toast.remove(toastId)
    } catch (err) {
      toast.error("Gagal memuat data residen")
    } finally {
      setLoadingData(false)
    }
  }

  // Search residents by term
  const getResidenByTerm = async (e) => {
    e.preventDefault()
    await getResiden(1, term, tampilkanData) // Reset to page 1 on search
  }

  // Get hospitals data
  const getRumahSakit = async () => {
    try {
      const res = await axios.get("/api/stase/get-rumahsakit")
      setRumahsakit(res.data.data)
    } catch (err) {
      toast.error("Gagal memuat data rumah sakit")
    }
  }

  // Handle checkbox change for individual resident
  const onChangeCheckBox = (e, resident) => {
    console.log("RES", resident)
    if (e.target.checked) {
      // Tambahkan residen dengan jam_kerja default
      const residenWithJamKerja = {
        ...resident,
        jam_kerja: 1, // default 1 jam per minggu
        tahap: resident.tahap || "Tahap 1", // default 1 jam per minggu
      }
      setPilihan([...pilihan, residenWithJamKerja])
    } else {
      setPilihan(pilihan.filter((item) => item.id !== resident.id))
    }
  }

  // Handle jam kerja change
  const handleJamKerjaChange = (residenId, jamKerja) => {
    setPilihan(
      pilihan.map((resident) =>
        resident.id === residenId ? { ...resident, jam_kerja: Number.parseInt(jamKerja) || 0 } : resident,
      ),
    )
  }

   const handleTahap = (residenId, tahap) => {

    setPilihan(
      pilihan.map((resident) =>
        resident.id === residenId ? { ...resident, tahap: tahap || 'Tahap 1'} : resident,
      ),
    )
  }

  // Handle pagination change
  const handlePageChange = async (pageNumber) => {
    await getResiden(pageNumber, term, tampilkanData)
  }

  // Check if a resident is selected
  const isResidentSelected = (residentId) => {
    return pilihan.some((item) => item.id === residentId)
  }

  // Get jam kerja for selected resident
  const getJamKerja = (residentId) => {
    const selectedResident = pilihan.find((item) => item.id === residentId)
    return selectedResident ? selectedResident.jam_kerja : 0
  }
  const getTahap = (residentId) => {
    const selectedResident = pilihan.find((item) => item.id === residentId)
    return selectedResident ? selectedResident.tahap : 'Tahap 1'
  }

  useEffect(() => {
    getRumahSakit()
    getResiden()
    getTahunAjaran()
  }, [])

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h1>Buat Stase</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/stase">Stase</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Buat Stase
                </li>
              </ol>
            </nav>
          </div>
          <Badge bg="primary" className="fs-6">
            Total Residen: {total}
          </Badge>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white">
                  <h4 className="card-title">Informasi Stase</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Periode Stase */}
                    <div className="form-group col-md-6">
                      <label className="form-label fw-bold">
                        Periode Stase <span className="text-danger">*</span>
                      </label>
                      <div className="row">
                        <div className="col-md-6">
                          <select
                            className={`form-select ${errors.bulan ? "is-invalid" : ""}`}
                            value={bulan}
                            onChange={(e) => setBulan(e.target.value)}
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
                          {errors.bulan && <div className="invalid-feedback">{errors.bulan[0]}</div>}
                        </div>
                        <div className="col-md-6">
                          <select
                            className={`form-select ${errors.tahun ? "is-invalid" : ""}`}
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
                          >
                            <option value="">Pilih Tahun</option>
                            {tahunAjaran.map((data) => (
                              <option key={data.id} value={data.tahun}>
                                {data.tahun}
                              </option>
                            ))}
                          </select>
                          {errors.tahun && <div className="invalid-feedback">{errors.tahun[0]}</div>}
                        </div>
                      </div>
                    </div>
              
                    {/* Rumah Sakit */}
                    <div className="form-group col-md-6 ">
                      <label className="form-label fw-bold">
                        Rumah Sakit <span className="text-danger">*</span>
                      </label>
                      <Select
                        className={errors.idRumahsakit ? "is-invalid" : ""}
                        options={rumahsakit}
                        placeholder="Pilih Rumah Sakit"
                        value={rumahsakit.filter((option) => option.value === idRumahsakit)}
                        onChange={({ value }) => setIdRumahsakit(value)}
                      />
                      {errors.idRumahsakit && <div className="text-danger small mt-1">{errors.idRumahsakit[0]}</div>}
                    </div>
                    {/* Upload File */}
                    <div className="form-group col-md-6">
                      <label className="form-label fw-bold">
                        Upload File Jadwal Jaga
                      </label>
                      <div className="input-group">
                        <input
                          type="file"
                          id="fileInput"
                          className={`form-control ${errors.file ? "is-invalid" : ""}`}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <span className="input-group-text">
                          <i className="fas fa-upload"></i>
                        </span>
                      </div>
                      {file && (
                        <div className="mt-2">
                          <small className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            File terpilih: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </small>
                        </div>
                      )}
                      {errors.file && <div className="invalid-feedback d-block">{errors.file[0]}</div>}
                      <small className="text-muted">
                        Format yang didukung: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mt-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h4 className="card-title">Pilih Residen</h4>
                  <div className="d-flex gap-3">
                    <Badge bg="success" className="fs-6">
                      Terpilih: {pilihan.length}
                    </Badge>
                    <Badge bg="info" className="fs-6">
                      Total Jam: {pilihan.reduce((total, resident) => total + (resident.jam_kerja || 0), 0)}
                    </Badge>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    {/* Display Options */}
                    <div className="col-md-4 mb-3">
                      <Select
                        placeholder="Tampilkan 15 Data"
                        options={options}
                        defaultValue={options.find((option) => option.value === 15)}
                        onChange={({ value }) => handleChangeTampilkanData(value)}
                      />
                    </div>
                    {/* Search */}
                    <div className="col-md-4 mb-3">
                      <form onSubmit={getResidenByTerm}>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Cari berdasarkan NIM/Nama..."
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                          />
                          <button className="btn btn-primary" type="submit" disabled={loadingData}>
                            {loadingData ? <Spinner animation="border" size="sm" /> : <i className="fas fa-search"></i>}
                          </button>
                        </div>
                      </form>
                    </div>
                    {/* Show All Button */}
                    <div className="col-md-4 mb-3">
                      <button className="btn btn-outline-primary w-100" onClick={() => getResiden(1, "", tampilkanData)} disabled={loadingData}>
                        {loadingData ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Memuat...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-list me-2"></i>
                            Tampilkan Semua
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Residents Table */}
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th width="50" className="text-center">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="checkBoxAll"
                                onChange={handleAllCheck}
                                checked={selectAllChecked}
                              />
                              <label className="form-check-label" htmlFor="checkBoxAll">
                                <span className="visually-hidden">Pilih Semua</span>
                              </label>
                            </div>
                          </th>
                          <th width="150">NIM</th>
                          <th>Nama</th>
                          <th>Tahap</th>
                          <th width="200">Jam Kerja/Minggu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingData ? (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              <Spinner animation="border" variant="primary" />
                              <p className="mt-2 mb-0">Memuat data...</p>
                            </td>
                          </tr>
                        ) : residen.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              <div className="empty-state">
                                <i className="fas fa-search empty-state-icon"></i>
                                <h5>Tidak ada data residen</h5>
                                <p className="text-muted">
                                  Tidak ada data residen yang ditemukan. Coba ubah kriteria pencarian.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          residen.map((data, index) => (
                            <tr key={data.id} className={isResidentSelected(data.id) ? "table-active" : ""}>
                              <td className="text-center">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`checkboxPilihan${index}`}
                                    checked={isResidentSelected(data.id)}
                                    onChange={(e) => onChangeCheckBox(e, data)}
                                  />
                                  <label className="form-check-label" htmlFor={`checkboxPilihan${index}`}>
                                    <span className="visually-hidden">Pilih</span>
                                  </label>
                                </div>
                              </td>
                              <td>
                                <Link to={`/residen/biodata/${data.id}`} className="text-decoration-none">
                                  {data.username}
                                </Link>
                              </td>
                              <td>{data.name}</td>
                                 <td>
                                {isResidentSelected(data.id) ? (
                                  <div className="input-group">
                                    <select name="tahap" id="tahap" value={getTahap(data.id)} onChange={(e) => handleTahap(data.id, e.target.value)}>
                                      <option value="Tahap 1">Tahap 1</option>
                                      <option value="Tahap 2">Tahap 2</option>
                                      <option value="Tahap 3">Tahap 3</option>
                                    </select>

                                  
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                {isResidentSelected(data.id) ? (
                                  <div className="input-group">
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={getJamKerja(data.id)}
                                      onChange={(e) => handleJamKerjaChange(data.id, e.target.value)}
                                      min="1"
                                      max="168"
                                      placeholder="1"
                                    />
                                    <span className="input-group-text">jam</span>
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {residen.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <small className="text-muted">
                          Menampilkan {residen.length} dari {total} data
                        </small>
                      </div>
                      <CustomPagination
                        activePage={currentPage}
                        itemsCountPerPage={tampilkanData} // Use tampilkanData for itemsCountPerPage
                        totalItemsCount={total}
                        onChange={handlePageChange}
                        pageRangeDisplayed={5}
                      />
                    </div>
                  )}
                </div>
                {/* Card Footer with Actions */}
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading || pilihan.length === 0}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Simpan Stase
                        </>
                      )}
                    </button>
                    <button className="btn btn-outline-secondary" onClick={cancelForm} disabled={loading}>
                      <i className="fas fa-times me-2"></i>
                      Batalkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CreateStase
