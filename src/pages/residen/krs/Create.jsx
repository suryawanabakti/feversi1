import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

const Create = (props) => {
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const getTahunAjaran = async () => {
    const res = await axios.get("/api/tahun-ajaran");
    console.log("tahunAjaran", res);
    setTahunAjaran(res.data);
  };
  const [semester, setSemester] = useState("");
  const [krs, setKrs] = useState();
  const [tahun, setTahun] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("semester", semester);
      formData.append("tahun", tahun);
      krs && formData.append("krs", krs);
      const response = await axios({
        method: "post",
        url: "/api/krs",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("berhasil simpan");
      setErrors([]);
      console.log(response);
      props.addKrs({
        id: response.data.id,
        tahun: response.data.tahun,
        semester: response.data.semester,
        krs: response.data.krs,
        created_at: response.data.created_at,
      });
      props.handleClose();
    } catch (err) {
      toast.error("Gagal KRS");
      console.log(err);
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal KRS , koneksi bermasalah");
        alert("error akhir sesi berrakhir, segera reload browser");
        location.reload();
      }
      if (err.response) {
        if (err.response.status == 422) {
          setErrors(err.response.data.errors);
        } else {
          alert("error akhir sesi berrakhir, segera reload browser");
          location.reload();
        }
      } else {
        alert("error akhir sesi berrakhir, segera reload browser");
        location.reload();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    getTahunAjaran();
  }, []);
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Tambah KRS</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSave}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Tahun <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              aria-label="Default select example"
              onChange={(e) => setTahun(e.target.value)}
            >
              <option value="">Pilih Tahun ...</option>
              {tahunAjaran.map((data) => {
                return (
                  <option
                    key={data.id}
                    value={data.tahun_ajaran}
                    defaultValue={tahun}
                    selected={tahun == data.tahun_ajaran}
                  >
                    {data.tahun_ajaran}
                  </option>
                );
              })}
            </Form.Select>
            {errors.tahun && (
              <div className="text-danger">
                {" "}
                <small>{errors.tahun[0]}</small>{" "}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Semester <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              aria-label="Default select example"
              onChange={(e) => setSemester(e.target.value)}
            >
              <option>Pilih Semester</option>
              <option value="Awal / Juli - Desember">
                Awal / Juli - Desember
              </option>
              <option value="Akhir / Januari - Juni">
                Akhir / Januari - Juni
              </option>
            </Form.Select>
            {errors.semester && (
              <div className="text-danger">
                {" "}
                <small>{errors.semester[0]}</small>{" "}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              KRS <span className="text-danger">*</span>
            </Form.Label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setKrs(e.target.files[0])}
            />
            {errors.krs && (
              <div className="text-danger">
                {" "}
                <small>{errors.krs[0]}</small>{" "}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={props.handleClose}>
            <i class="fas fa-window-close"></i> Batal
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
                <i class="fas fa-save"></i> Simpan
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Create;
