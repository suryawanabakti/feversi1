import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import useAuthContext from "../../../context/AuthContext";

export default function SkJabatan() {
  const { user } = useAuthContext();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [skjabatan, setSkJabatan] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getDosen = async () => {
    const res = await axios.get("/api/dosen/" + id);
    console.log("@res", res.data.data.sk_jabatan);
    setName(res.data.data.name);
    setSkJabatan(res.data.data.sk_jabatan || []);
  };

  const [jabatanStruktural, setJabatanStruktural] = useState("");
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("jabatanStruktural", jabatanStruktural);
    file && formData.append("file", file);
    try {
      const response = await axios({
        method: "post",
        url: `/api/dosen/${id}/sk-jabatan`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);
      toast.success("Berhasil tambah SK JABATAN");
      setShow(false);
      getDosen();
    } catch (err) {
      console.log("@err", err);
      if (err.response.status == 422) {
        toast.error(err.response.data.message);
        setErrors(err.response.data.errors);
      }
    }
    setLoading(false);
  };

  const onDelete = async (e, id) => {
    e.preventDefault();
    const toastId = toast.loading("Sedang menghapus data ... ");
    if (confirm("Anda yakin menghapus sk jabatan ?")) {
      await axios.delete(`/api/dosen/sk-jabatan/${id}`);
      await getDosen();
      toast.success("berhasil hapus sk jabatan");
    }
    toast.remove(toastId);
  };

  useEffect(() => {
    getDosen();
  }, []);
  return (
    <>
      <div className="main-content">
        <section className="section">
          <div className="section-header justify-content-between">
            <h1>SK Jabatan</h1>
            <Link to={`/dosen/show/${id}`} className="btn btn-primary">
              Kembali
            </Link>
          </div>
          <div className="section-body">
            <div className="row">
              <div className="card">
                <div className="card-header">
                  <h4 className="">Daftar Sk Jabatan, {name} </h4>
                  <div className="card-header-action">
                    {user.roles[0].name == "prodi" && (
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleShow}
                      >
                        Tambah SK Jabatan
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Jabatan Struktural</th>
                        <th>File</th>
                        {user.roles[0].name == "prodi" && <th>Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {skjabatan.map((data, index) => {
                        return (
                          <tr>
                            <td>{index + 1}</td>
                            <td>{data.jabatan_struktural}</td>
                            <td>
                              <a
                                target="_blank"
                                href={`${baseurl}/dosen/skjabatan/${data.file}`}
                              >
                                Download
                              </a>
                            </td>
                            {user.roles[0].name == "prodi" && (
                              <td>
                                <a
                                  onClick={(e) => onDelete(e, data.id)}
                                  href="#"
                                >
                                  <i className="fas fa-trash text-danger"></i>
                                </a>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah SK JABATAN</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="">
              Jabatan Struktural <span className="text-danger">*</span>{" "}
            </label>
            <select
              className="form-control"
              onChange={(e) => setJabatanStruktural(e.target.value)}
            >
              <option value="">Pilih Jabatan Struktural</option>
              <option value="Ketua Departemen">Ketua Departemen</option>
              <option value="Sekretaris Departemen">
                Sekretaris Departemen
              </option>
              <option value="Ketua Program Studi">Ketua Program Studi</option>
              <option value="Sekretaris Program Studi">
                Sekretaris Program Studi
              </option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="">
              File <span className="text-danger">*</span>{" "}
            </label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Loading..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
