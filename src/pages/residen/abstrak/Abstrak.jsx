import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Button, Spinner, Card } from "react-bootstrap";
import Create from "./Create";
import CustomTable from "../../../components/common/CustomTable";

/**
 * Abstrak Page Component
 * 
 * Manages display and deletion of Abstrak Jurnal Publikasi.
 * Uses CustomTable for a professional, consistent look.
 */
const Abstrak = () => {
  const [abstrak, setAbstrak] = useState([]);
  const [show, setShow] = useState(false);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const columns = [
    { field: "semester", headerName: "Judul", width: "30%" },
    { field: "jenis_publikasi", headerName: "Jenis Publikasi", width: "20%" },
    {
      field: "link",
      headerName: "Link Publikasi",
      width: "20%",
      renderCell: ({ row }) => {
        return row.link ? (
          <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
            {row.link}
          </a>
        ) : <span className="text-muted">-</span>;
      },
    },
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
          href={row.abstrak_url}
          className="btn btn-outline-primary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
          title="Download Abstrak"
        >
          <i className="fas fa-download"></i>
        </a>
      ),
    },
  ];

  const getAbstrak = async () => {
    setFetching(true);
    try {
      const res = await axios.get("/api/abstrak");
      // Handle Laravel Resource collection structure
      setAbstrak(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal Mengambil Data Abstrak");
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Hapus ${pilihan.length} data yang dipilih?`)) return;

    setLoading(true);
    try {
      await axios.post("/api/abstrak/delete-all", { pilihan });
      toast.success("Berhasil hapus abstrak yang dipilih");
      getAbstrak();
      setPilihan([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal hapus Abstrak");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAbstrak();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header shadow-sm">
          <h1>Abstrak Jurnal Publikasi</h1>
        </div>
        <div className="section-body">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">Daftar Publikasi</h5>
              <div>
                <Button
                  variant="primary"
                  onClick={handleShow}
                  className="mr-2 px-4 shadow-sm"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah Abstrak
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
                rows={abstrak}
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
        getAbstrak={getAbstrak}
      />
    </div>
  );
};

export default Abstrak;
