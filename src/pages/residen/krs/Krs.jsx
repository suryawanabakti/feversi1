import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Button, Spinner, Card } from "react-bootstrap";
import Create from "./Create";
import CustomTable from "../../../components/common/CustomTable";
import { Link } from "react-router-dom";


/**
 * KRS Page Component
 * 
 * Manages display and deletion of Kartu Rencana Studi (KRS).
 * Uses CustomTable for a professional, consistent look.
 */
const Krs = () => {
  const [krs, setKrs] = useState([]);
  const [show, setShow] = useState(false);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const columns = [
    { field: "tahun", headerName: "Tahun", width: "15%" },
    { field: "semester", headerName: "Semester", width: "15%" },
    {
      field: "created_at",
      headerName: "Tanggal Upload",
      width: "25%",
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
      width: "15%",
      renderCell: ({ row }) => (
        <a
          href={row.krs_url}
          className="btn btn-outline-primary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
          title="Download KRS"
        >
          <i className="fas fa-download mr-1"></i> Download
        </a>
      ),
    },
  ];

  const getKrs = async () => {
    setFetching(true);
    try {
      const res = await axios.get("/api/krs");
      // Handle Laravel Resource collection structure
      setKrs(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal Mengambil Data KRS");
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Hapus ${pilihan.length} data yang dipilih?`)) return;

    setLoading(true);
    try {
      await axios.post("/api/krs/delete-all", { pilihan });
      toast.success("Berhasil hapus KRS yang dipilih");
      getKrs();
      setPilihan([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal hapus KRS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKrs();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1 className="font-weight-bold">Kartu Rencana Studi</h1>
          <div className="section-header-breadcrumb">
            <div className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="breadcrumb-item active">KRS</div>
          </div>
        </div>
        <div className="section-body">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">Daftar KRS</h5>
              <div>
                <Button
                  variant="primary"
                  onClick={handleShow}
                  className="mr-2 px-4 shadow-sm"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah KRS
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
                rows={krs}
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
        getKrs={getKrs}
      />
    </div>
  );
};

export default Krs;
