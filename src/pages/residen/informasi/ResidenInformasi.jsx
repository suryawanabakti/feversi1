import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";
import axios from "../../../api/axios";
import LayananTable from "../../../components/common/LayananTable";
import LayananForm from "../../../components/common/LayananForm";

/**
 * ResidenInformasi Component
 * 
 * Manages information requests from residents.
 */
export default function ResidenInformasi() {
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
      const res = await axios.get("/api/residen/layanan-informasi");
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
    if (!window.confirm(`Apakah Anda yakin ingin menghapus informasi "${item.topik}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/residen/layanan-informasi/${item.id}`);
      toast.success("Informasi berhasil dihapus");
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menghapus informasi");
    }
  };

  const handleSubmit = async (formData, id) => {
    setSubmitting(true);
    try {
      if (id) {
        // Update - use /update endpoint
        await axios.post(`/api/residen/layanan-informasi/${id}/update`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Informasi berhasil diperbarui");
      } else {
        // Create
        await axios.post("/api/residen/layanan-informasi", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Informasi berhasil ditambahkan");
      }
      getData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menyimpan informasi");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Informasi</h1>
        </div>

        <div className="section-body">
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Total Informasi</h6>
                  <h3 className="mb-0 text-primary">{data.length}</h3>
                </div>
                <Button variant="primary" onClick={handleCreate}>
                  <i className="fas fa-plus me-2"></i>
                  Tambah Informasi
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
              type="informasi"
            />
          )}
        </div>
      </section>

      <LayananForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={selectedItem}
        type="informasi"
        loading={submitting}
      />
    </div>
  );
}
