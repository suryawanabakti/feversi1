import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-hot-toast";
import CustomTable from "../../../components/common/CustomTable";
import useAuthContext from "../../../context/AuthContext";

export default function Format() {
  const { user } = useAuthContext();
  const [dataFormat, setDataFormat] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false); // For form submission
  const [tableLoading, setTableLoading] = useState(true); // For table data loading

  const [name, setName] = useState("");
  const [file, setFile] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Columns definition for CustomTable
  const columns = [
    {
      field: "name",
      headerName: "Nama Format",
      renderCell: ({ row }) => {
        return (
          <a target="_blank" href={row.file_url} rel="noreferrer">
            {row.name}
          </a>
        );
      },
    },
    {
      field: "aksi",
      headerName: "Aksi",
      width: "100px",
      renderCell: ({ row }) => {
        if (user?.roles?.[0]?.name === "admin") {
          return (
            <a
              href="#"
              title="hapus"
              onClick={(e) => handleDelete(e, row.id)}
              className="text-danger ml-2"
            >
              <i className="fas fa-trash"></i>
            </a>
          );
        }
        return null;
      },
    },
  ];

  const getFormat = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get("/api/format");
      // Laravel Resource collection returns data wrapped in 'data' key
      setDataFormat(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal memuat data format");
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (confirm("Apakah anda yakin ?")) {
      const toastId = toast.loading("Sedang menghapus ... ");
      try {
        await axios.delete("/api/format/" + id); // Changed to standard RESTful delete
        await getFormat();
        toast.dismiss(toastId);
        toast.success("Berhasil dihapus");
      } catch (err) {
        toast.dismiss(toastId);
        toast.error("Gagal menghapus");
        console.log(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    name && formData.append("name", name);
    file && formData.append("file", file);
    try {
      const response = await axios({
        method: "post",
        url: "/api/format",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("@res", response);
      toast.success("Berhasil menambahkan format");
      getFormat();
      handleClose();
      // Reset form
      setName("");
      setFile(null);
    } catch (err) {
      toast.error("Error saat menyimpan");
      console.log("@err", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getFormat();
  }, []);

  return (
    <>
      <div className="main-content">
        <section className="section">
          <div className="section-header">
            <h1>Daftar Format</h1>
          </div>
          <div className="section-body">
            <div className="row">
              <div className="col-md-12 mb-2 d-flex justify-content-between">
                {user?.roles?.[0]?.name === "admin" && (
                  <Button variant="primary" type="button" onClick={handleShow}>
                    Tambah Format
                  </Button>
                )}
              </div>
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h4>Data Format</h4>
                  </div>
                  <div className="card-body">
                    <CustomTable
                      columns={columns}
                      rows={dataFormat}
                      loading={tableLoading}
                      pageSize={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Format</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="form-group">
              <label htmlFor="">
                Nama Format <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Upload File</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
