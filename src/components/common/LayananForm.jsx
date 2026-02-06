import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-hot-toast";

/**
 * LayananForm Component
 * 
 * Reusable modal form for creating/editing layanan records.
 * 
 * @param {boolean} show - Whether modal is visible
 * @param {Function} handleClose - Callback to close modal
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Object} initialData - Initial form data for editing (null for create)
 * @param {string} type - Type of layanan (informasi, pengaduan, konseling)
 * @param {boolean} loading - Whether form is submitting
 */
const LayananForm = ({ show, handleClose, onSubmit, initialData = null, type, loading = false }) => {
    const [topik, setTopik] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});

    const isEdit = !!initialData;

    useEffect(() => {
        if (show && initialData) {
            setTopik(initialData.topik || "");
            setDeskripsi(initialData.deskripsi || "");
        } else if (show) {
            resetForm();
        }
    }, [show, initialData]);

    const resetForm = () => {
        setTopik("");
        setDeskripsi("");
        setFile(null);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!topik || !deskripsi) {
            toast.error("Topik dan Deskripsi wajib diisi");
            return;
        }

        const formData = new FormData();
        formData.append("topik", topik);
        formData.append("deskripsi", deskripsi);
        if (file) {
            formData.append("file", file);
        }

        try {
            await onSubmit(formData, initialData?.id);
            resetForm();
            handleClose();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            }
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case "informasi":
                return "Informasi";
            case "pengaduan":
                return "Pengaduan";
            case "konseling":
                return "Konseling";
            default:
                return type;
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title className="h5">
                    {isEdit ? "Edit" : "Tambah"} {getTypeLabel()}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="font-weight-bold">
                            Topik <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={topik}
                            onChange={(e) => setTopik(e.target.value)}
                            placeholder="Masukkan topik"
                            isInvalid={!!errors.topik}
                            maxLength={255}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.topik?.[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="font-weight-bold">
                            Deskripsi <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            placeholder="Masukkan deskripsi"
                            isInvalid={!!errors.deskripsi}
                            maxLength={5000}
                        />
                        <Form.Text className="text-muted">
                            {deskripsi.length}/5000 karakter
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                            {errors.deskripsi?.[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-0">
                        <Form.Label className="font-weight-bold">
                            File Pendukung {!isEdit && "(Opsional)"}
                        </Form.Label>
                        <Form.Control
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            isInvalid={!!errors.file}
                        />
                        <Form.Text className="text-muted">
                            Format: JPG, PNG, WEBP, PDF (Maks. 5MB)
                        </Form.Text>
                        {isEdit && initialData?.file && !file && (
                            <div className="mt-2">
                                <small className="text-muted">
                                    File saat ini:{" "}
                                    <a
                                        href={initialData.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Lihat File
                                    </a>
                                </small>
                            </div>
                        )}
                        <Form.Control.Feedback type="invalid">
                            {errors.file?.[0]}
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
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-2"></i>
                                Simpan
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default LayananForm;
