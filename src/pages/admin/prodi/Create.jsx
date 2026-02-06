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
  const [masaStudi, setMasaStudi] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      await axios.post("/api/prodi", { username, name, masaStudi });
      toast.success("Berhasi tambah prodi");
      props.getProdi();
      props.handleClose();
      setErrors([]);
    } catch (err) {
      toast.error("Gagal Menambah Prodi");
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal menambah Prodi , koneksi bermasalah");
        location.reload();
      }
      if (err.response.status == 422) {
        setErrors(err.response.data.errors);
      }
      console.log(err);
    }
    setLoading(false);
  };
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Tambah Prodi</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSave}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              Username <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Username...."
            />
            {errors.username && (
              <div className="text-danger ">
                {" "}
                <small>{errors.username[0]}</small>
              </div>
            )}

            <Form.Text className="text-danger"></Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Nama Prodi <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama Prodi...."
            />
            {errors.name && (
              <div className="text-danger">
                {" "}
                <small>{errors.name[0]}</small>{" "}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>
              Masa Studi <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setMasaStudi(e.target.value)}
              placeholder="Masukkan Masa Studi ...."
            />
            {errors.masaStudi && (
              <div className="text-danger">
                {" "}
                <small>{errors.masaStudi[0]}</small>{" "}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={props.handleClose}>
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
  );
};

export default Create;
