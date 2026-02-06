import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

const Import = (props) => {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios({
        method: "post",
        url: "/api/rumahsakit/import",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Berhasi import rumah sakit");
      props.getRumahSakit();
      props.handleClose();
      setErrors([]);
    } catch (err) {
      toast.error("Gagal import Rumah Sakit");
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal import Rumah Sakit , koneksi bermasalah");
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
        <Modal.Title className="fw-bold">Import Rumah Sakit</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSave}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              Upload .xls <span className="text-danger">*</span>{" "}
            </Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
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

export default Import;
