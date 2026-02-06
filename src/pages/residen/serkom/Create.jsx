import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

/**
 * Create Serkom Component
 * 
 * Modal form for uploading new Sertifikat Kompetensi.
 */
const Create = ({ show, handleClose, getSerkom }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !file) {
            toast.error("Nama dan File wajib diisi");
            return;
        }

        setLoading(true);
        setErrors({});

        const formData = new FormData();
        formData.append("name", name);
        formData.append("file", file);

        try {
            await axios.post("/api/serkom", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Sertifikat berhasil diunggah");
            setName("");
            setFile(null);
            handleClose();
            getSerkom();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                toast.error("Validasi gagal. Silakan cek form.");
            } else {
                toast.error(err.response?.data?.message || "Gagal mengunggah sertifikat");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title className="h5">Tambah Sertifikat Kompetensi</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="font-weight-bold">
                            Nama Sertifikat <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Contoh: Sertifikat Kompetensi Bedah"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-0">
                        <Form.Label className="font-weight-bold">
                            File Sertifikat <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            isInvalid={!!errors.file}
                        />
                        <Form.Text className="text-muted">
                            Format: JPG, PNG, PDF (Maks. 5MB)
                        </Form.Text>
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
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mr-2" />
                                Mengunggah...
                            </>
                        ) : (
                            "Simpan Sertifikat"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default Create;
