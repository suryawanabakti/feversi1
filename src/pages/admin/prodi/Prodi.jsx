"use client";

import React, { useState, useEffect } from "react";
import { Button, Badge, InputGroup } from "react-bootstrap";
import { toast } from "react-hot-toast";
import axios from "../../../api/axios";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import { DeleteConfirmationDialog } from "../../../components/delete-confimation-dialog";
import { CustomPagination } from "../../../components/custom-pagination";

// Create Modal Component
const Create = ({ show, onHide, handleClose, getProdi }) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [masaStudi, setMasaStudi] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  const handleModalClose = () => {
    setUsername("");
    setName("");
    setMasaStudi("");
    setErrors([]);
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await axios.post("/api/prodi", {
        username: username,
        name: name,
        masaStudi: masaStudi,
      });

      if (response.status === 201) {
        toast.success("Prodi berhasil ditambahkan");
        handleModalClose();
        getProdi(); // Refresh data
      }
    } catch (err) {
      console.log(err);

      if (err.code === "ERR_NETWORK") {
        toast.error("Gagal menambahkan prodi, koneksi bermasalah");
      } else if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Validasi gagal. Silakan periksa data yang dimasukkan.");
      } else if (err.response?.status === 409) {
        toast.error("Username sudah digunakan");
      } else {
        toast.error("Gagal menambahkan prodi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Tambah Prodi</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>
              Username <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Username..."
              required
            />
            {errors.username && (
              <div className="text-danger">
                <small>{errors.username[0]}</small>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>
              Nama Prodi <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama Prodi..."
              required
            />
            {errors.name && (
              <div className="text-danger">
                <small>{errors.name[0]}</small>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formMasaStudi">
            <Form.Label>
              Masa Studi (Tahun) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              value={masaStudi}
              onChange={(e) => setMasaStudi(e.target.value)}
              placeholder="Masukkan Masa Studi..."
              min="1"
              max="10"
              required
            />
            {errors.masaStudi && (
              <div className="text-danger">
                <small>{errors.masaStudi[0]}</small>
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleModalClose}
            disabled={loading}
          >
            <i className="fas fa-window-close"></i> Batal
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
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
                <i className="fas fa-save"></i> Simpan
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const Import = ({ show, onHiden, handleClose, getProdi }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Import Prodi</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>Import Prodi form goes here.</p>
      <Button
        onClick={() => {
          console.log("Importing dummy prodi...");
          handleClose();
          getProdi();
        }}
      >
        Import Dummy Prodi
      </Button>
    </Modal.Body>
  </Modal>
);

const Prodi = () => {
  const [show, setShow] = useState(false);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowImport = () => setShowImport(true);
  const handleCloseImport = () => setShowImport(false);
  const [dataDosen, setDataDosen] = useState([]);
  const handleCloseEdit = () => setShowEdit(false);

  const getDosen = async () => {
    const res = await axios.get("/api/prodi-get-dosen");
    setDataDosen(res.data.data);
  };
  const [prodi, setProdi] = useState([]);
  const [usernameEdt, setUsernameEdt] = useState("");
  const [nameEdt, setNameEdt] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [masaStudi, setMasaStudi] = useState("");
  const [kps, setkps] = useState("");
  const [sps, setsps] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [term, setTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const getProdi = async (pageNumber = page, searchTerm = term) => {
    setIsSearching(true);
    const toastId = toast.loading("Sedang memuat data prodi...");
    try {
      const params = new URLSearchParams();
      if (pageNumber) params.append('page', pageNumber);
      if (searchTerm) params.append('search', searchTerm);

      const res = await axios.get(`/api/prodi?${params.toString()}`);

      const responseData = res.data;
      if (responseData.data && Array.isArray(responseData.data)) {
        setProdi(responseData.data);
        const meta = responseData.meta || responseData;
        if (meta.current_page) {
          setPage(meta.current_page);
          setTotal(meta.total);
        }
      } else {
        setProdi(responseData);
        setTotal(responseData.length || 0);
      }
    } catch (err) {
      console.log(err);
      toast.error("Gagal mengambil Data Prodi");
    }
    toast.dismiss(toastId);
    setLoading(false);
    setIsSearching(false);
  };

  const [errors, setErrors] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [placeholderKps, setPlaceHolderKps] = useState("");
  const [placeholderSps, setPlaceHolderSps] = useState("");

  const handleResetPassword = async (prodiId, name) => {
    setLoading(true);
    if (confirm("Apakah anda yakin mereset passsword " + name + " ?")) {
      try {
        await axios.post("/api/reset-password/" + prodiId);
        toast.success("Berhasil reset password prodi " + name);
      } catch (error) {
        toast.error("Gagal reset password prodi " + name);
        console.log(error);
      }
    }
    setLoading(false);
  };

  const handleShowEdit = async (prodiId) => {
    try {
      const res = await axios.get("/api/prodi-show/" + prodiId);
      setProdiId(res.data.id);
      setUsernameEdt(res.data.username);
      setNameEdt(res.data.prodi.name);
      setMasaStudi(res.data.prodi.masa_studi);
      res.data.prodi.ketuaprodi
        ? setPlaceHolderKps(res.data.prodi.ketuaprodi.name)
        : setPlaceHolderKps("");
      res.data.prodi.sekertariatprodi
        ? setPlaceHolderSps(res.data.prodi.sekertariatprodi.name)
        : setPlaceHolderSps("");
      setShowEdit(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post("/api/prodi/update/" + prodiId, {
        name: nameEdt,
        masaStudi,
        kps,
        sps,
      });
      toast.success("Berhasil ubah prodi");
      getProdi();
      handleCloseEdit();
      setErrors([]);
    } catch (err) {
      console.log(err);
      toast.error("Gagal ubah prodi");
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal ubah prodi , koneksi bermasalah");
        location.reload();
      }
      if (err.response.status == 422) {
        setErrors(err.response.data.errors);
      }
    }
    setLoading(false);
  };

  const columns = [
    { field: "username", headerName: "Username", width: 300 },
    { field: "name", headerName: "Nama Prodi", width: 200 },
    {
      field: "kps",
      headerName: "Ketua Prodi",
      width: 200,
      renderCell: (cellValues) => {
        return (
          cellValues.row.prodi.ketuaprodi &&
          cellValues.row.prodi.ketuaprodi.name
        );
      },
    },
    {
      field: "sps",
      headerName: "Sekertariat Prodi",
      width: 200,
      renderCell: (cellValues) => {
        return (
          cellValues.row.prodi.sekertariatprodi &&
          cellValues.row.prodi.sekertariatprodi.name
        );
      },
    },
    {
      field: "masa_studi",
      headerName: "Masa Studi",
      width: 100,
      renderCell: (cellValues) => {
        return `${cellValues.row.prodi.masa_studi} Tahun`;
      },
    },
    {
      field: "action",
      headerName: "Aksi",
      width: 120,
      renderCell: (cellValues) => {
        return (
          <>
            <Button
              variant="primary"
              title="Ubah"
              onClick={() => handleShowEdit(cellValues.row.id)}
            >
              <i className="fas fa-pen"></i>
            </Button>
            <Button
              disabled={loading}
              title="Reset Password"
              className="ml-1"
              variant="primary"
              onClick={() =>
                handleResetPassword(cellValues.row.id, cellValues.row.name)
              }
            >
              <i className="fas fa-key"></i>
            </Button>
          </>
        );
      },
    },
  ];



  const confirmDeleteProdi = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/prodi/delete-all", { pilihan });
      if (res.data.code == 201) {
        toast.error(res.data.message);
      } else {
        toast.success("Berhasil hapus Prodi yang dipilih");
        const selectedIDs = new Set(pilihan);
        setProdi((r) => r.filter((x) => !selectedIDs.has(x.id)));
        setPilihan([]);
      }
    } catch (err) {
      console.log(err);
      toast.error("Gagal hapus Prodi, Prodi sudah digunakan");
    }
    setLoading(false);
    setConfirmDeleteOpen(false);
  };

  useEffect(() => {
    getProdi();
    getDosen();
  }, []);

  return (
    <>
      <div className="main-content">
        <section className="section">
          <div className="section-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h1 className="mr-3">Prodi</h1>
              <Badge bg="primary" className="p-2">
                Total: {total}
              </Badge>
            </div>
          </div>

          <div className="section-body">
            <div className="card">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
                  <div className="d-flex mb-2 mb-md-0">
                    <Button variant="primary" onClick={handleShow} className="mr-2">
                      <i className="fas fa-plus-circle mr-1"></i> Tambah Prodi
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleShowImport}
                    >
                      <i className="fas fa-file-excel mr-1"></i> Import
                    </Button>
                  </div>

                  <div className="d-flex align-items-center">
                    {pilihan.length > 0 && (
                      <Button
                        variant="danger"
                        className="mr-2"
                        onClick={() => setConfirmDeleteOpen(true)}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : <><i className="fas fa-trash mr-1"></i> Hapus ({pilihan.length})</>}
                      </Button>
                    )}
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        getProdi(1, term);
                      }}
                    >
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Cari prodi..."
                          value={term}
                          onChange={(e) => setTerm(e.target.value)}
                        />
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <i className="fas fa-search"></i>
                          )}
                        </Button>
                      </InputGroup>
                    </Form>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="thead-light">
                      <tr>
                        <th width="40">
                          <Form.Check
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) setPilihan(prodi.map(p => p.id));
                              else setPilihan([]);
                            }}
                            checked={prodi.length > 0 && pilihan.length === prodi.length}
                          />
                        </th>
                        <th>Username</th>
                        <th>Nama Prodi</th>
                        <th>Ketua Prodi</th>
                        <th>Sekertariat Prodi</th>
                        <th>Masa Studi</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!prodi || prodi.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <div className="d-flex flex-column align-items-center">
                              <i className="fas fa-search fa-3x text-muted mb-3"></i>
                              <h5 className="text-muted">Tidak ada data prodi ditemukan</h5>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        prodi.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={pilihan.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setPilihan([...pilihan, item.id]);
                                  else setPilihan(pilihan.filter(id => id !== item.id));
                                }}
                              />
                            </td>
                            <td>{item.username}</td>
                            <td className="font-weight-bold">{item.name}</td>
                            <td>{item.prodi?.ketuaprodi?.name || "-"}</td>
                            <td>{item.prodi?.sekertariatprodi?.name || "-"}</td>
                            <td>
                              <Badge bg="info">{item.prodi?.masa_studi} Tahun</Badge>
                            </td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="mr-1"
                                  title="Ubah"
                                  onClick={() => handleShowEdit(item.id)}
                                >
                                  <i className="fas fa-pen"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={loading}
                                  title="Reset Password"
                                  variant="warning"
                                  onClick={() =>
                                    handleResetPassword(item.id, item.name)
                                  }
                                >
                                  <i className="fas fa-key"></i>
                                </Button>
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
                {total > 0 && (
                  <CustomPagination
                    activePage={page}
                    itemsCountPerPage={10}
                    totalItemsCount={total}
                    onChange={(pageNumber) => getProdi(pageNumber, term)}
                    pageRangeDisplayed={5}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Import
        show={showImport}
        onHiden={handleCloseImport}
        handleClose={handleCloseImport}
        getProdi={getProdi}
      />
      <Create
        show={show}
        onHide={handleClose}
        handleClose={handleClose}
        getProdi={getProdi}
      />
      <Modal show={showEdit} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Ubah Prodi</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>
                Username <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={usernameEdt}
                onChange={(e) => setUsernameEdt(e.target.value)}
                placeholder="Masukkan Username...."
              />
              {errors.username && (
                <div className="text-danger ">
                  {" "}
                  <small>{errors.username[0]}</small>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                Nama Prodi <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={nameEdt}
                onChange={(e) => setNameEdt(e.target.value)}
                placeholder="Masukkan Nama Prodi...."
              />
              {errors.name && (
                <div className="text-danger">
                  {" "}
                  <small>{errors.name[0]}</small>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                Masa Studi <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={masaStudi}
                onChange={(e) => setMasaStudi(e.target.value)}
                placeholder="Masukkan Masa Studi...."
              />
              {errors.masaStudi && (
                <div className="text-danger">
                  {" "}
                  <small>{errors.masaStudi[0]}</small>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Ketua Prodi Studi </Form.Label>
              <Select
                options={dataDosen}
                placeholder={placeholderKps}
                onChange={({ value }) => setkps(value)}
              />
              {errors.kpsId && (
                <div className="text-danger">
                  {" "}
                  <small>{errors.kpsId[0]}</small>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Sekertaris Prodi Studi </Form.Label>
              <Select
                options={dataDosen}
                placeholder={placeholderSps}
                onChange={({ value }) => setsps(value)}
              />
              {errors.sksId && (
                <div className="text-danger">
                  {" "}
                  <small>{errors.sksId[0]}</small>
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEdit}>
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

      <DeleteConfirmationDialog
        isOpen={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDeleteProdi}
        title="Konfirmasi Penghapusan Prodi"
        description={`Apakah Anda yakin ingin menghapus ${pilihan.length} prodi yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={loading}
      />
    </>
  );
};

export default Prodi;
