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

  const handleSample = async () => {
    try {
      const res = await axios.get("/api/prodi-get-sample2", {
        responseType: "blob",
      });
      const href = URL.createObjectURL(res.data);

      // create "a" HTML element with href to file & click
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", "sampel-prodi-new.xlsx"); //or any other extension
      document.body.appendChild(link);
      link.click();

      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      toast.success("berhasil download sample");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios({
        method: "post",
        url: "/api/prodi/import",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Berhasi import prodi");
      props.getProdi();
      props.handleClose();
      setErrors([]);
    } catch (err) {
      toast.error("Gagal import Prodi");
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal import Prodi , koneksi bermasalah");
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
        <Modal.Title className="fw-bold">Import Prodi</Modal.Title>
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
              placeholder="Masukkan Username...."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            <i className="fas fa-window-close"></i> Batal
          </Button>
          <Button variant="primary" onClick={handleSample}>
            <i class="fas fa-download"></i> Unduh Sampel
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
