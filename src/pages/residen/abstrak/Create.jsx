import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

/**
 * Create Abstrak Component
 * 
 * Modal form for uploading new Abstrak Jurnal Publikasi.
 */
const Create = ({ show, handleClose, getAbstrak }) => {
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState("");
  const [abstrak, setAbstrak] = useState(null);
  const [link, setLink] = useState("");
  const [jenisPublikasi, setJenisPublikasi] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!semester || !jenisPublikasi || !abstrak) {
      toast.error("Judul (Semester), Jenis Publikasi, dan Abstrak wajib diisi.");
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("semester", semester);
    formData.append("jenisPublikasi", jenisPublikasi);
    formData.append("abstrak", abstrak);
    if (link) formData.append("link", link);
    if (keterangan) formData.append("keterangan", keterangan);

    try {
      await axios.post("/api/abstrak", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Abstrak berhasil diunggah");
      resetForm();
      handleClose();
      getAbstrak();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Validasi gagal. Silakan cek form.");
      } else {
        toast.error(err.response?.data?.message || "Gagal mengunggah abstrak");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSemester("");
    setAbstrak(null);
    setLink("");
    setJenisPublikasi("");
    setKeterangan("");
    setErrors({});
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h5">Tambah Abstrak Jurnal Publikasi</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-4">
          <div className="row">
            <div className="col-md-6 text-left">
              <Form.Group className="mb-3">
                <Form.Label className="font-weight-bold">
                  Judul (Semester) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contoh: Semester 5"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  isInvalid={!!errors.semester}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.semester?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6 text-left">
              <Form.Group className="mb-3">
                <Form.Label className="font-weight-bold">
                  Jenis Publikasi <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={jenisPublikasi}
                  onChange={(e) => setJenisPublikasi(e.target.value)}
                  isInvalid={!!errors.jenisPublikasi}
                >
                  <option value="">Pilih Jenis Publikasi</option>
                  <option value="Nasional">Nasional</option>
                  <option value="International">International</option>
                  <option value="SCOPUS">SCOPUS</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.jenisPublikasi?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3 text-left">
            <Form.Label className="font-weight-bold">Link Publikasi</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/journal/123"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              isInvalid={!!errors.link}
            />
            <Form.Control.Feedback type="invalid">
              {errors.link?.[0]}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 text-left">
            <Form.Label className="font-weight-bold">
              File Abstrak <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setAbstrak(e.target.files[0])}
              isInvalid={!!errors.abstrak}
            />
            <Form.Text className="text-muted">
              Format: JPG, PNG, PDF (Maks. 5MB)
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.abstrak?.[0]}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-0 text-left">
            <Form.Label className="font-weight-bold">Keterangan Tambahan</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Berikan keterangan tambahan jika ada..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              isInvalid={!!errors.keterangan}
            />
            <Form.Control.Feedback type="invalid">
              {errors.keterangan?.[0]}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light text-left">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="px-4 text-left">
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mr-2" />
                Mengunggah...
              </>
            ) : (
              "Simpan Publikasi"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Create;
