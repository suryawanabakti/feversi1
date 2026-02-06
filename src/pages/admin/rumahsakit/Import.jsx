"use client"

import { useState } from "react"
import axios from "../../../api/axios"

const Import = (props) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        alert("File harus berformat CSV")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Pilih file CSV terlebih dahulu")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await axios.post("/api/rumahsakit/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      alert("Berhasil mengimpor data rumah sakit")
      props.getRumahSakit()
      props.handleClose()
      setFile(null)
    } catch (err) {
      alert("Gagal mengimpor data")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "nama_rumah_sakit,is_active\nRS Contoh 1,true\nRS Contoh 2,false"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_rumah_sakit.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setFile(null)
    props.handleClose()
  }

  if (!props.show) return null

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title font-weight-bold">
              <i className="fas fa-file-import mr-2"></i>
              Import Rumah Sakit
            </h5>
            <button type="button" className="close text-white" onClick={handleClose}>
              <span>&times;</span>
            </button>
          </div>
          <form onSubmit={handleImport}>
            <div className="modal-body p-4">
              <div className="alert alert-info">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Format CSV:</strong> File harus memiliki kolom: nama_rumah_sakit, is_active
              </div>

              <div className="form-group mb-3">
                <label className="font-weight-bold">
                  <i className="fas fa-file-csv mr-2"></i>
                  File CSV
                </label>
                <input
                  type="file"
                  className="form-control-file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {file && (
                  <small className="text-muted mt-1 d-block">
                    <i className="fas fa-check-circle text-success mr-1"></i>
                    File terpilih: {file.name}
                  </small>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={downloadTemplate}
                  disabled={loading}
                >
                  <i className="fas fa-download mr-2"></i>
                  Download Template CSV
                </button>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                <i className="fas fa-times mr-2"></i>
                Batal
              </button>
              <button type="submit" className="btn btn-info" disabled={!file || loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-import mr-2"></i>
                    Import
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

export default Import
