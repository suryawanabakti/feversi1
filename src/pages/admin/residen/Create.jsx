import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import Select from "react-select";

const Create = (props) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [selectProdi, setSelectProdi] = useState([]);

  const getProdi = async () => {
    const res = await axios.get("/api/biodata/get-prodi");
    setSelectProdi(res.data.data);
    console.warn(res);
  };

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      await axios.post("/api/residen", { username, name, prodiId });
      toast.success("Berhasil Menambah Residen");
      setErrors([]);
      if (props.onSuccess) props.onSuccess();
      props.handleClose();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Mohon perbaiki data yang salah");
      } else {
        toast.error(err.response?.data?.message || "Gagal Menambah Residen");
      }
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getProdi();
  }, []);
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Tambah Residen</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSave}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              Nim <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Nim...."
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
              Nama Lengkap <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama Lengkap...."
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
              Prodi <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Select
              options={selectProdi}
              onChange={({ value }) => setProdiId(value)}
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
