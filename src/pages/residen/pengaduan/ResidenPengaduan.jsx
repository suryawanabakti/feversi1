import React, { useEffect, useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { toast } from "react-hot-toast";
import axios from "../../../api/axios";
import LayananTable from "../../../components/common/LayananTable";
import LayananForm from "../../../components/common/LayananForm";

/**
 * ResidenPengaduan Component
 * 
 * Manages complaints from residents with privacy protection.
 */
export default function ResidenPengaduan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/residen/layanan-pengaduan");
      // Laravel Resource Collection wraps data in 'data' key
      const responseData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setData(responseData);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengaduan "${item.topik}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/residen/layanan-pengaduan/${item.id}`);
      toast.success("Pengaduan berhasil dihapus");
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menghapus pengaduan");
    }
  };

  const handleSubmit = async (formData, id) => {
    setSubmitting(true);
    try {
      if (id) {
        // Update - use /update endpoint
        await axios.post(`/api/residen/layanan-pengaduan/${id}/update`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Pengaduan berhasil diperbarui");
      } else {
        // Create
        await axios.post("/api/residen/layanan-pengaduan", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Pengaduan berhasil ditambahkan");
      }
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menyimpan pengaduan");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Pengaduan</h1>
        </div>

        <div className="section-body">
          <Alert variant="danger" className="d-flex align-items-center mb-3">
            <i className="fas fa-bullhorn fa-2x me-3"></i>
            <div>
              <strong>Kerahasiaan Terjamin</strong>
              <p className="mb-0 mt-1">
                Identitas pelapor akan dijaga kerahasiaannya oleh <strong>PPPDS</strong>
              </p>
            </div>
          </Alert>

          <Card className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Total Pengaduan</h6>
                  <h3 className="mb-0 text-primary">{data.length}</h3>
                </div>
                <Button variant="primary" onClick={handleCreate}>
                  <i className="fas fa-plus me-2"></i>
                  Tambah Pengaduan
                </Button>
              </div>
            </Card.Body>
          </Card>

          {loading ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Memuat data...</p>
              </Card.Body>
            </Card>
          ) : (
            <LayananTable
              data={data}
              onEdit={handleEdit}
              onDelete={handleDelete}
              type="pengaduan"
            />
          )}
        </div>
      </section>

      <LayananForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={selectedItem}
        type="pengaduan"
        loading={submitting}
      />
    </div>
  );
}
