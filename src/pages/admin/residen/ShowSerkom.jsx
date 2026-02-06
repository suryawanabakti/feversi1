import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import baseurl from "../../../api/baseurl";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import useAuthContext from "../../../context/AuthContext";

const ShowSerkom = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { id } = useParams();
  const [serkom, setSerkom] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const [formloading, setloadingform] = useState(true);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState([]);
  const [cardHeader, setCardHeader] = useState("");

  const [name, setName] = useState("");
  const [file, setFile] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    file && formData.append("file", file);
    try {
      const response = await axios({
        method: "post",
        url: "/api/residen/serkom/" + id,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);
      toast.success("Berhasil tambah SK JABATAN");
      setShow(false);
      getSerkom();
    } catch (err) {
      console.log("@err", err);
      if (err.response.status == 422) {
        toast.error(err.response.data.message);
        setErrors(err.response.data.errors);
      }
    }
    setLoading(false);
  };

  const columns = [
    { field: "name", headerName: "Nama Serkom", width: 200 },

    {
      field: "created_at",
      headerName: "Tanggal Upload",
      width: 200,
      renderCell: (cellValues) => {
        return new Date(cellValues.row.created_at).toLocaleDateString(
          undefined,
          options
        );
      },
    },
    {
      field: "id",
      headerName: "Aksi",
      width: 150,
      renderCell: (cellValues) => {
        const onClick = (e) => {
          e.stopPropagation();
        };
        return (
          <>
            <a
              href={`${baseurl}/storage/serkom/${cellValues.row.file}`}
              className="btn btn-primary"
              target="_blank"
            >
              <i className="fas fa-download"></i>
            </a>
            {user.roles[0].name == "prodi" && (
              <button
                onClick={() => handleDelete(cellValues.row.id)}
                type="button"
                className="btn btn-danger ml-2"
                disabled={loading}
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </>
        );
      },
    },
  ];

  const handleDelete = async (id) => {
    setLoading(true);
    if (confirm("Apakah anda yakin menghapus data ini ?")) {
      const tid = toast.loading("Hapus data .. ");
      await axios.delete("/api/residen/serkom/delete/" + id);
      await getSerkom();
      toast.remove(tid);
    }
    setLoading(false);
  };

  const getSerkom = async () => {
    try {
      const res = await axios.get("/api/residen/serkom/" + id);
      console.log("@res", res);
      setCardHeader(res.data.name);
      setSerkom(res.data.serkom);
    } catch (err) {
      console.log(err);
      toast.error("Gagal Mengambil Data Serkom");
    }
    setloadingform(false);
  };

  const handleDeleteAll = async () => {
    const selectedIDs = new Set(pilihan);
    setLoading(true);
    try {
      await axios.post("/api/serkom/delete-all", { pilihan });
      toast.success("Berhasil hapus serkom yang dipilih");
      setSerkom((r) => r.filter((x) => !selectedIDs.has(x.id)));
    } catch (err) {
      console.log(err);
      toast.error("Gagal hapus serkom, serkom sudah digunakan");
    }
    setLoading(false);
  };

  useEffect(() => {
    getSerkom();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Sertifikat Kompetensi</h1>
          <Link to={`/residen/biodata/${id}`} className="btn btn-primary">
            Kembali
          </Link>
        </div>
        <div className="section-body">
          <div className="card">
            <div className="card-header">
              <h4>Data Serkom, {cardHeader}</h4>
              <div className="card-header-action">
                {user.roles[0].name == "prodi" && (
                  <Button variant="primary" onClick={handleShow}>
                    Tambah Sertifikat Kompetensi
                  </Button>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                      rows={serkom}
                      columns={columns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      disableSelectionOnClick
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Serkom</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSave}>
          <Modal.Body>
            <div className="form-group">
              <label htmlFor="">
                Nama <span className="text-danger">*</span>{" "}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nama Serkom ..."
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">
                File <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                className="form-control"
                placeholder="Nama File ..."
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              Simpan
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default ShowSerkom;
