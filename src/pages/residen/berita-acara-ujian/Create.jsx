import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

/**
 * Create BAU Component
 * 
 * Modal form for uploading new Berita Acara Ujian.
 */
const Create = ({ show, handleClose, getBau }) => {
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState("");
  const [bau, setBau] = useState(null);
  const [tglUjian, setTglUjian] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!semester || !bau || !tglUjian) {
      toast.error("Semua field bertanda * wajib diisi.");
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("semester", semester);
    formData.append("bau", bau);
    formData.append("tglUjian", tglUjian);

    try {
      const response = await axios.post("/api/bau", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check for custom error code from backend
      if (response.data.code === 202) {
        toast.error("Gagal simpan: " + response.data.message);
        setLoading(false);
        return;
      }

      toast.success("Berita Acara Ujian berhasil diunggah");
      resetForm();
      handleClose();
      getBau();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Validasi gagal. Silakan cek form.");
      } else if (err.response?.status === 421) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || "Gagal mengunggah Berita Acara Ujian");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSemester("");
    setBau(null);
    setTglUjian("");
    setErrors({});
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h5">Tambah Berita Acara Ujian</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-4">
          <Form.Group className="mb-3 text-left">
            <Form.Label className="font-weight-bold">
              Tanggal Ujian <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              value={tglUjian}
              onChange={(e) => setTglUjian(e.target.value)}
              isInvalid={!!errors.tglUjian}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tglUjian?.[0]}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 text-left">
            <Form.Label className="font-weight-bold">
              Jenis Ujian <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              isInvalid={!!errors.semester}
            >
              <option value="">Pilih Jenis Ujian</option>
              <option value="Proposal">Proposal</option>
              <option value="Hasil">Hasil</option>
              <option value="Akhir">Akhir / Lokal</option>
              <option value="Nasional">Nasional</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.semester?.[0]}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-0 text-left">
            <Form.Label className="font-weight-bold">
              Upload File Berita Acara <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setBau(e.target.files[0])}
              isInvalid={!!errors.bau}
            />
            <Form.Text className="text-muted">
              Format: JPG, PNG, PDF (Maks. 5MB)
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.bau?.[0]}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="px-4">
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mr-2" />
                Mengunggah...
              </>
            ) : (
              "Simpan Berita Acara"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Create;
