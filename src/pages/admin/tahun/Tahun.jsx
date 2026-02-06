"use client"

import React, { useEffect, useState } from "react"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import axios from "../../../api/axios" // Assuming this path is correct in your project
import { toast } from "react-hot-toast"
import Button from "react-bootstrap/Button" // Keeping react-bootstrap for existing buttons
import Spinner from "react-bootstrap/Spinner" // Keeping react-bootstrap for existing spinner
// import Create from "./Create" // Assuming these components exist and are handled elsewhere
// import Import from "./Import" // Assuming these components exist and are handled elsewhere
import Modal from "react-bootstrap/Modal" // Keeping react-bootstrap for existing modal
import Form from "react-bootstrap/Form" // Keeping react-bootstrap for existing form
import { DeleteConfirmationDialog } from "../../../components/delete-confimation-dialog"

// Placeholder components for Create and Import if they are not provided
const Create = ({ addRumahsakit, show, onHiden, handleClose, getRumahSakit }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Create Tahun</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>Create Tahun form goes here.</p>
      <Button onClick={() => {
        addRumahsakit({ id: Math.random(), tahun: 'New Tahun ' + Math.floor(Math.random() * 100) });
        handleClose();
        getRumahSakit();
      }}>Add Dummy Tahun</Button>
    </Modal.Body>
  </Modal>
);

const Import = ({ addRumahsakit, show, onHiden, handleClose, getRumahSakit }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Import Tahun</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>Import Tahun form goes here.</p>
      <Button onClick={() => {
        addRumahsakit({ id: Math.random(), tahun: 'Imported Tahun ' + Math.floor(Math.random() * 100) });
        handleClose();
        getRumahSakit();
      }}>Import Dummy Tahun</Button>
    </Modal.Body>
  </Modal>
);


const Tahun = () => {
  const [rowPerPage, setRowPerPage] = useState(5)
  const [rumahSakit, setRumahSakit] = useState([])
  const [show, setShow] = useState(false)
  const [showEdt, setShowEdt] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [pilihan, setPilihan] = useState([])
  const [loading, setLoading] = useState(false)
  const [rumahSakitId, setRumahSakitId] = useState("")
  const [errors, setErrors] = useState([])
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false) // State for custom confirmation dialog

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const handleCloseImport = () => setShowImport(false)
  const handleShowImport = () => setShowImport(true)

  const [name, setName] = useState("")

  const columns = [{ field: "tahun", headerName: "Tahun", width: 500 }]

  const handleSave = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      const res = await axios.post("/api/rumahsakit/update/" + rumahSakitId, {
        name,
      })
      toast.success("Berhasil Mengubah Rumah Sakit : " + name)
      setErrors([])
      console.log(res)
      getRumahSakit()
      handleCloseEdt()
    } catch (err) {
      toast.error("Gagal Mengubah Rumah Sakit")
      console.log(err)
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal Mengubah rumah sakit , koneksi bermasalah")
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
      const res = await axios.get("/api/rumahsakit-show/" + rumahSakitId)
      setName(res.data.name)
      setShowEdt(true)
    } catch (err) {
      toast.error("gagal ambil data rumah sakit")
    }
  }

  const handleCloseEdt = () => setShowEdt(false)

  const addRumahsakit = (rumah) => {
    setRumahSakit([...rumahSakit, rumah])
  }

  const getRumahSakit = async () => {
    try {
      const res = await axios.get("/api/tahun")
      setRumahSakit(res.data)
    } catch (err) {
      console.log(err)
      toast.error("Gagal Mengambil Data Rumah Sakit")
    }
  }

  const handleDeleteAll = async () => {
    setLoading(true)
    try {
      await axios.post("/api/tahun/delete-all", { pilihan })
      toast.success("Berhasil hapus tahun yang dipilih")
      const selectedIDs = new Set(pilihan)
      setRumahSakit((r) => r.filter((x) => !selectedIDs.has(x.id)))
      setPilihan([]) // Clear selection after deletion
      setConfirmDeleteOpen(false) // Close the confirmation dialog
    } catch (err) {
      console.log(err)
      toast.error("Gagal hapus tahun, tahun sudah digunakan")
    }
    setLoading(false)
  }

  useEffect(() => {
    getRumahSakit()
  }, [])

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Tahun</h1>
        </div>
        <div className="section-body">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-2">
                  <div className="row">
                    <div className="col-md-3">
                      <select
                        name=""
                        className="form-control"
                        id=""
                        onChange={(e) => setRowPerPage(parseInt(e.target.value))}
                      >
                        <option value="5">Show 5 Data</option>
                        <option value="10">Show 10 Data</option>
                        <option value="20">Show 20 Data</option>
                        <option value="40">Show 40 Data</option>
                      </select>
                    </div>
                    <div className="col-md-9">
                      <Button variant="primary" onClick={handleShow}>
                        Tambah Rumah Sakit
                      </Button>
                      <Button
                        variant="primary"
                        className="ml-2"
                        onClick={handleShowImport}
                      >
                        <i className="fas fa-file-import"></i> Import
                      </Button>
                      <button
                        className="btn btn-danger float-right"
                        disabled={pilihan.length === 0 || loading}
                        onClick={() => setConfirmDeleteOpen(true)} // Open custom confirmation
                      >
                        <span>
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="grow"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                              Loading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash mr-2"></i>
                              Hapus {pilihan.length !== 0 && pilihan.length}{" "}
                              Data
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div
                    style={{
                      height:
                        rowPerPage == 10
                          ? "800px"
                          : rowPerPage == 20
                          ? "1100px"
                          : rowPerPage == 40
                          ? "1300px"
                          : "400px",
                      width: "100%",
                    }}
                  >
                    <DataGrid
                      rows={rumahSakit}
                      columns={columns}
                      pageSizeOptions={[rowPerPage]} // Use pageSizeOptions instead of pageSize
                      disableRowSelectionOnClick // Use disableRowSelectionOnClick instead of disableSelectionOnClick
                      checkboxSelection
                      disableColumnFilter
                      disableColumnSelector
                      disableDensitySelector
                      slots={{ toolbar: GridToolbar }} // Use slots instead of components
                      slotProps={{ // Use slotProps instead of componentsProps
                        toolbar: {
                          showQuickFilter: true,
                          quickFilterProps: { debounceMs: 500 },
                        },
                      }}
                      onRowSelectionModelChange={(data) => { // Use onRowSelectionModelChange instead of onSelectionModelChange
                        setPilihan(data);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal (kept as react-bootstrap) */}
      <Modal show={showEdt} onHide={handleCloseEdt}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Edit Rumah Sakit</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                Nama Rumah Sakit <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan Nama Rumah Sakit...."
              />
              {errors.name && (
                <div className="text-danger">
                  {" "}
                  <small>{errors.name[0]}</small>{" "}
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="warning" onClick={handleCloseEdt}>
              <i className="fas fa-window-close"></i> Batal
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  {" "}
                  <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Simpan
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Custom Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleDeleteAll}
        title="Konfirmasi Penghapusan Tahun"
        description={`Apakah Anda yakin ingin menghapus ${pilihan.length} tahun yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={loading}
      />

      {/* Create and Import Modals (kept as react-bootstrap) */}
      <Import
        addRumahsakit={addRumahsakit}
        show={showImport}
        onHiden={handleCloseImport}
        handleClose={handleCloseImport}
        getRumahSakit={getRumahSakit}
      />
      <Create
        addRumahsakit={addRumahsakit}
        show={show}
        onHiden={handleClose}
        handleClose={handleClose}
        getRumahSakit={getRumahSakit}
      />
    </div>
  )
}

export default Tahun
