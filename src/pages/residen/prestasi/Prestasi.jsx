import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Button, Spinner, Card } from "react-bootstrap";
import Create from "./Create";
import CustomTable from "../../../components/common/CustomTable";

/**
 * Prestasi Page Component
 * 
 * Manages display and deletion of achievements (Prestasi).
 * Uses CustomTable for a professional, consistent look.
 */
const Prestasi = () => {
  const [prestasi, setPrestasi] = useState([]);
  const [show, setShow] = useState(false);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const columns = [
    { field: "type", headerName: "Jenis Prestasi", width: "20%" },
    { field: "name", headerName: "Nama Kegiatan", width: "35%" },
    { field: "tahun", headerName: "Tahun", width: "15%" },
    {
      field: "created_at",
      headerName: "Tanggal Upload",
      width: "20%",
      renderCell: ({ row }) => {
        return new Date(row.created_at).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    },
    {
      field: "actions",
      headerName: "Aksi",
      width: "10%",
      renderCell: ({ row }) => (
        <a
          href={row.prestasi_url}
          className="btn btn-outline-primary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
          title="Download Bukti Prestasi"
        >
          <i className="fas fa-download"></i>
        </a>
      ),
    },
  ];

  const getPrestasi = async () => {
    setFetching(true);
    try {
      const res = await axios.get("/api/prestasi");
      // Handle Laravel Resource collection structure
      setPrestasi(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal Mengambil Data Prestasi");
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Hapus ${pilihan.length} data prestasi yang dipilih?`)) return;

    setLoading(true);
    try {
      await axios.post("/api/prestasi/delete-all", { pilihan });
      toast.success("Berhasil hapus prestasi yang dipilih");
      getPrestasi();
      setPilihan([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal hapus Prestasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrestasi();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header shadow-sm">
          <h1>Prestasi</h1>
        </div>
        <div className="section-body">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">Daftar Prestasi & Penghargaan</h5>
              <div>
                <Button
                  variant="primary"
                  onClick={handleShow}
                  className="mr-2 px-4 shadow-sm"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah Prestasi
                </Button>
                <Button
                  variant="danger"
                  className="px-4 shadow-sm"
                  disabled={pilihan.length === 0 || loading}
                  onClick={handleDeleteAll}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash mr-2"></i>
                      Hapus {pilihan.length > 0 && pilihan.length} Data
                    </>
                  )}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <CustomTable
                rows={prestasi}
                columns={columns}
                loading={fetching}
                checkboxSelection
                onSelectionModelChange={setPilihan}
                pageSize={10}
              />
            </Card.Body>
          </Card>
        </div>
      </section>

      <Create
        show={show}
        handleClose={handleClose}
        getPrestasi={getPrestasi}
      />
    </div>
  );
};

export default Prestasi;
