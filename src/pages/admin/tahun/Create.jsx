import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

const Create = (props) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post("/api/tahun", { name });
      toast.success("Berhasil Menambah Tahun : " + name);
      setErrors([]);
      console.log(res);
      props.addRumahsakit({
        id: res.data.id,
        tahun: res.data.tahun,
      });
      props.handleClose();
    } catch (err) {
      toast.error("Gagal Menambah Rumah Sakit");
      console.log(err);
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal menambah rumah sakit , koneksi bermasalah");
      }
      if (err.response) {
        if (err.response.status == 422) {
          setErrors(err.response.data.errors);
        }
      }
    }
    setLoading(false);
  };
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Tambah Tahun</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSave}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Nama Tahun <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama Tahun...."
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
