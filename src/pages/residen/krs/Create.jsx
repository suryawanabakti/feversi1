import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

/**
 * Create KRS Component
 * 
 * Modal form for uploading new KRS (Kartu Rencana Studi).
 */
const Create = ({ show, handleClose, getKrs }) => {
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState("");
  const [tahun, setTahun] = useState("");
  const [krs, setKrs] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      getTahunAjaran();
    }
  }, [show]);

  const getTahunAjaran = async () => {
    try {
      const res = await axios.get("/api/tahun-ajaran");
      setTahunAjaran(res.data);
    } catch (err) {
      console.error("Gagal mengambil tahun ajaran", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!semester || !tahun || !krs) {
      toast.error("Semua field bertanda * wajib diisi.");
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("semester", semester);
    formData.append("tahun", tahun);
    formData.append("krs", krs);

    try {
      await axios.post("/api/krs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("KRS berhasil diunggah");
      resetForm();
      handleClose();
      getKrs();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Validasi gagal. Silakan cek form.");
      } else {
        toast.error(err.response?.data?.message || "Gagal mengunggah KRS");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSemester("");
    setTahun("");
    setKrs(null);
    setErrors({});
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h5">Tambah KRS</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-4">
          <div className="row">
            <div className="col-md-6 text-left">
              <Form.Group className="mb-3">
                <Form.Label className="font-weight-bold">
                  Tahun Ajaran <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  isInvalid={!!errors.tahun}
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {tahunAjaran.map((item) => (
                    <option key={item.id} value={item.tahun_ajaran}>
                      {item.tahun_ajaran}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.tahun?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6 text-left">
              <Form.Group className="mb-3">
                <Form.Label className="font-weight-bold">
                  Semester <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  isInvalid={!!errors.semester}
                >
                  <option value="">Pilih Semester</option>
                  <option value="Awal / Juli - Desember">Awal / Juli - Desember</option>
                  <option value="Akhir / Januari - Juni">Akhir / Januari - Juni</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.semester?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-0 text-left">
            <Form.Label className="font-weight-bold">
              File KRS <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setKrs(e.target.files[0])}
              isInvalid={!!errors.krs}
            />
            <Form.Text className="text-muted">
              Format: JPG, PNG, PDF (Maks. 5MB)
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.krs?.[0]}
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
              "Simpan KRS"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default Create;
