"use client"

import { useState } from "react"
import axios from "../../../api/axios"

const Create = (props) => {
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const handleKategoriChange = (value, checked) => {
    if (checked) {
      setKategori([...kategori, value])
    } else {
      setKategori(kategori.filter((item) => item !== value))
    }
  }

  const handleSave = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      const res = await axios.post("/api/rumahsakit", {
        name,
        is_active: isActive,
        kategori,
      })

      alert("Berhasil Menambah Rumah Sakit: " + name)
      setErrors([])
      console.log(res)

      props.addRumahsakit({
        id: res.data.data.id,
        name: res.data.data.name,
        is_active: res.data.data.is_active,
        kategori: res.data.data.kategori,
      })

      // Reset form
      setName("")
      setIsActive(true)
      setKategori([])
      props.handleClose()
    } catch (err) {
      alert("Gagal Menambah Rumah Sakit")
      console.log(err)
      if (err.code == "ERR_NETWORK") {
        alert("Gagal menambah rumah sakit, koneksi bermasalah")
      }
      if (err.response) {
        if (err.response.status == 422) {
          setErrors(err.response.data.errors)
        }
      }
    }
    setLoading(false)
  }

  const handleClose = () => {
    setName("")
    setIsActive(true)
    setKategori([])
    setErrors([])
    props.handleClose()
  }

  if (!props.show) return null

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title font-weight-bold">
              <i className="fas fa-plus-circle mr-2"></i>
              Tambah Rumah Sakit
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
  )
}

export default Create
