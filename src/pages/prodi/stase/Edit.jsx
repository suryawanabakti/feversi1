"use client"
import { useEffect, useRef, useState } from "react"
import Select from "react-select"
import axios from "../../../api/axios"
import { toast } from "react-hot-toast"
import useAuthContext from "../../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Link, useParams } from "react-router-dom"
import { Spinner, Badge } from "react-bootstrap"
import baseurl from "../../../api/baseurl"
import { CustomPagination } from "../../../components/custom-pagination"
import "./table.css"

const EditStase = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tampilkanData, setTampilkanData] = useState(5)
  const [pilihan, setPilihan] = useState([])
  const [residen, setResiden] = useState([])
  const [rumahsakit, setRumahsakit] = useState([])
  const [tahap, setTahap] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [errors, setErrors] = useState([])
  const [stase, setStase] = useState("")
  const [idRumahsakit, setIdRumahsakit] = useState("")
  const [namaRumaSakit, setNamaRumahSakit] = useState("")
  const [tahun, setTahun] = useState("")
  const [bulan, setBulan] = useState("")
  const [file, setFile] = useState(null)
  const [currentFile, setCurrentFile] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [term, setTerm] = useState("")
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const checkedAll = useRef()

  const options = [
    { value: 5, label: "Tampilkan 5 Data" },
    { value: 10, label: "Tampilkan 10 Data" },
    { value: 15, label: "Tampilkan 15 Data" },
    { value: 20, label: "Tampilkan 20 Data" },
  ]

  const getStase = async () => {
    try {
      const res = await axios.get("/api/stase/" + id)
      setBulan(res.data.data.bulan)
      setTahun(res.data.data.tahun)
      setStase(res.data.data.nama || "")
      setIdRumahsakit(res.data.data.rumahsakit.id)
      setNamaRumahSakit(res.data.data.rumahsakit.name)
      setCurrentFile(res.data.data.file || "")
      // Ensure each resident has jam_kerja, default to 1 if not present
      // Ensure each resident has jam_kerja, default to 1 if not present
      const staseResidenWithJamKerja = res.data.data.staseresiden.map((resident) => ({
        ...resident.user, // Spread user properties (including id as User ID)
        jam_kerja: resident.jam_kerja || 1, // Get jam_kerja from pivot or default to 1
        tahap: resident.tahap || resident.user.biodata?.tahap || "Tahap 1", // Get tahap from pivot
      }))
      setPilihan(staseResidenWithJamKerja)
      setTahap(res.data.data.tahap)
    } catch (err) {
      toast.error("Gagal memuat data stase")
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

  // Remove current file
  const handleRemoveCurrentFile = () => {
    setCurrentFile("")
    toast.success("File saat ini akan dihapus saat menyimpan")
  }

  // Download current file
  const handleDownloadCurrentFile = () => {
    if (currentFile) {
      window.open(`${currentFile}`, "_blank") // Use baseurl for download
    }
  }

  const handleChangeTampilkanData = async (value) => {
    setTampilkanData(value)
    setTerm("")
    await getResiden(1, "", value) // Reset term and page to 1
  }

  const handleSave = async (e) => {
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
      // Tambahkan file baru jika ada
      if (file) {
        formData.append("file", file)
      }
      // Tambahkan informasi file saat ini
      formData.append("current_file", currentFile)
      const res = await axios.post("/api/stase/update/" + id, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      toast.success("Berhasil Ubah Stase")
      navigate("/stase")
    } catch (err) {
      console.log("@err", err)
      if (err.response && err.response.status === 422) {
        toast.error(err.response.data.message)
        setErrors(err.response.data.errors)
      } else {
        toast.error("Gagal ubah stase")
      }
    } finally {
      setLoading(false)
    }
  }

  const cancelForm = () => {
    getResiden()
    setFile(null)
    // Reset file input
    const fileInput = document.getElementById("fileInput")
    if (fileInput) {
      fileInput.value = ""
    }
    location.reload() // This will reload the page, which might not be ideal for a SPA
  }

  const handleAllCheck = (e) => {
    const isChecked = e.target.checked
    setSelectAllChecked(isChecked)
    if (isChecked) {
      // Tambahkan jam_kerja default untuk semua residen
      const residenWithJamKerja = residen.map((resident) => ({
        ...resident,
        jam_kerja: 1, // default 1 jam per minggu
      }))
      setPilihan(residenWithJamKerja)
    } else {
      setPilihan([])
    }
  }

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
      setTotal(res.data.meta.total)
      setResiden(res.data.data)
      toast.remove(toastId)
    } catch (err) {
      toast.error("Gagal memuat data residen")
    } finally {
      setLoadingData(false)
    }
  }

  const getResidenByTerm = async (e) => {
    e.preventDefault()
    await getResiden(1, term, tampilkanData) // Reset to page 1 on search
  }

  const getRumahSakit = async () => {
    try {
      const res = await axios.get("/api/stase/get-rumahsakit")
      setRumahsakit(res.data.data)
    } catch (err) {
      toast.error("Gagal memuat data rumah sakit")
    }
  }

  const onChangeCheckBox = (e, resident) => {
    if (e.target.checked) {
      // Tambahkan residen dengan jam_kerja default atau yang sudah ada
      const existingResident = pilihan.find((p) => p.id === resident.id)
      const residenWithJamKerja = {
        ...resident,
        jam_kerja: existingResident?.jam_kerja || 1, // use existing or default 1
        tahap: existingResident?.tahap || resident.tahap || "Tahap 1", // use existing or default 1
      }
      setPilihan([...pilihan, residenWithJamKerja])
    } else {
      setPilihan((current) => current.filter((item) => item.id !== resident.id))
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
        resident.id === residenId ? { ...resident, tahap: tahap || "Tahap 1" } : resident,
      ),
    )
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

  // Handle pagination change
  const handlePageChange = async (pageNumber) => {
    await getResiden(pageNumber, term, tampilkanData)
  }

  useEffect(() => {
    getRumahSakit()
    getResiden()
    getStase()
  }, [])

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h1>
              Edit Stase : {bulan} / {tahun}, {namaRumaSakit}
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
                  Edit Stase
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex gap-3">
            <Badge bg="success" className="fs-6">
              Terpilih: {pilihan.length}
            </Badge>
            <Badge bg="info" className="fs-6">
              Total Jam: {pilihan.reduce((total, resident) => total + (resident.jam_kerja || 0), 0)}
            </Badge>
          </div>
        </div>
        <div className="section-body">
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
                      </select>
                      {errors.tahun && <div className="invalid-feedback">{errors.tahun[0]}</div>}
                    </div>
                  </div>
                </div>
                {/* Upload File */}
                <div className="form-group col-md-6">
                  <label className="form-label fw-bold">Upload File Jadwal Jaga</label>
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
                        File baru terpilih: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </small>
                    </div>
                  )}
                  {errors.file && <div className="invalid-feedback d-block">{errors.file[0]}</div>}
                  <small className="text-muted">
                    Format yang didukung: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                  </small>
                </div>
                {/* Current File Display */}
                {currentFile && (
                  <div className="form-group col-md-12">
                    <label className="form-label fw-bold">File Saat Ini</label>
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="me-3">
                        <i className="fas fa-file-alt fa-2x text-primary"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">File Jadwal Jaga</h6>
                        <small className="text-muted">File yang sedang digunakan</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleDownloadCurrentFile}
                        >
                          <i className="fas fa-download me-1"></i>
                          Download
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleRemoveCurrentFile}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Hapus
                        </button>
                      </div>
                    </div>
                    {!currentFile && (
                      <small className="text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        File ini akan dihapus saat menyimpan
                      </small>
                    )}
                  </div>
                )}
                {/* Tahap */}

                {/* Rumah Sakit */}
                <div className="form-group col-md-4">
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
              </div>
            </div>
          </div>
          <div className="card mt-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="card-title">Pilih Residen</h4>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                {/* Display Options */}
                <div className="col-md-4 mb-3">
                  <Select
                    placeholder="Tampilkan 5 Data"
                    options={options}
                    defaultValue={options.find((option) => option.value === 5)}
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
                <table className="table table-bordered table-hover align-middle">
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
                      Menampilkan {residen.length} dari {total} data | Jumlah Residen Dipilih: {pilihan.length}
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
                      Simpan Perubahan Stase
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
      </section>
    </div>
  )
}

export default EditStase
