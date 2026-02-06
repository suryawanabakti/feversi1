import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

/**
 * Create Prestasi Component
 * 
 * Modal form for uploading new Achievements (Prestasi).
 * Fetches year options from the API for consistency.
 */
const Create = ({ show, handleClose, getPrestasi }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [tahun, setTahun] = useState("");
  const [type, setType] = useState("");
  const [prestasi, setPrestasi] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      getTahunAjaran();
    }
  }, [show]);

  const getTahunAjaran = async () => {
    try {
      const res = await axios.get("/api/tahun");
      setTahunAjaran(res.data);
    } catch (err) {
      console.error("Gagal mengambil tahun ajaran", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !tahun || !type || !prestasi) {
      toast.error("Semua field bertanda * wajib diisi.");
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("tahun", tahun);
    formData.append("prestasi", prestasi);

    try {
      await axios.post("/api/prestasi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Prestasi berhasil disimpan");
      resetForm();
      handleClose();
      getPrestasi();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Validasi gagal. Silakan cek form.");
      } else {
        toast.error(err.response?.data?.message || "Gagal menyimpan prestasi");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setTahun("");
    setType("");
    setPrestasi(null);
    setErrors({});
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h5">Tambah Prestasi & Penghargaan</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-4">
          <div className="row">
            <div className="col-md-6 text-left">
              <Form.Group className="mb-3">
                <Form.Label className="font-weight-bold">
                  Jenis Prestasi <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  isInvalid={!!errors.type}
                >
                  <option value="">Pilih Jenis Prestasi</option>
                  <option value="Lokal">Lokal</option>
                  <option value="Nasional">Nasional</option>
                  <option value="International">International</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6 text-left">
              <Form.Group className="mb-3">
                <Form.Label className="font-weight-bold">
                  Tahun <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  isInvalid={!!errors.tahun}
                >
                  <option value="">Pilih Tahun</option>
                  {tahunAjaran.map((item) => (
                    <option key={item.id} value={item.tahun}>
                      {item.tahun}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.tahun?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3 text-left">
            <Form.Label className="font-weight-bold">
              Nama Kegiatan <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan nama kegiatan atau penghargaan..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.[0]}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-0 text-left">
            <Form.Label className="font-weight-bold">
              Bukti Prestasi <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setPrestasi(e.target.files[0])}
              isInvalid={!!errors.prestasi}
            />
            <Form.Text className="text-muted">
              Format: JPG, PNG, PDF (Maks. 5MB)
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.prestasi?.[0]}
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
                Menyimpan...
              </>
            ) : (
              "Simpan Prestasi"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Create;
