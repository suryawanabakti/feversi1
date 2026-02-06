import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../../api/axios";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, Table, Form, InputGroup, Button, Badge, Spinner } from "react-bootstrap";
import { CustomPagination } from "../../../../components/custom-pagination";

const ShowLaporanKabupaten = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParam] = useSearchParams();

  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDatas = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Memuat rincian wilayah...");
    try {
      const prodiId = searchParam.get("prodiId") || "";
      const status = searchParam.get("status") || "";

      const res = await axios.get(`/api/laporan-kabupaten/${id}`, {
        params: { prodiId, status }
      });

      setDatas(res.data.data || res.data);
      toast.success("Rincian siap ditampilkan", { id: toastId });
    } catch (err) {
      console.error("Error fetching detail data:", err);
      toast.error("Gagal memuat rincian", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [id, searchParam]);

  useEffect(() => {
    fetchDatas();
  }, [fetchDatas]);

  const filteredDatas = datas.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredDatas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const displayedDatas = filteredDatas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const regencyName = datas.length > 0 ? datas[0].namaKabupaten : "Wilayah";
  const statusLabel = searchParam.get("status") === "alumni" ? "Alumni" : "Residen Aktif";

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header border-bottom-0 pb-0 bg-transparent shadow-none d-flex justify-content-between align-items-center">
          <div>
            <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Detail Sebaran Kabupaten</h1>
            <p className="text-muted mt-1">
              Wilayah <strong>{regencyName}</strong> &bull; {statusLabel}
            </p>
          </div>
          <div className="section-header-breadcrumb">
            <Button
              className="btn btn-white shadow-sm border-0 py-2 px-3"
              style={{ borderRadius: '10px', fontWeight: 600, transition: 'all 0.3s' }}
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left mr-2 text-primary"></i> Kembali
            </Button>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="row">
            <div className="col-12">
              <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                <Card.Header className="bg-white border-bottom-0 py-3 px-4 d-flex justify-content-between align-items-center flex-wrap">
                  <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Populasi di {regencyName} ({totalItems})
                  </h4>
                  <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                    {searchParam.get("prodiId") && datas.length > 0 && (
                      <Badge bg="info" className="px-3 py-2 mr-2" style={{ borderRadius: '8px' }}>
                        {datas[0].prodi}
                      </Badge>
                    )}
                    <InputGroup size="sm" style={{ width: '250px' }}>
                      <InputGroup.Text className="bg-white border-right-0">
                        <i className="fas fa-search text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="border-left-0"
                        placeholder="Cari residen..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body className="p-0 text-left">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-2">Memuat data...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">NIM / Username</th>
                            <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Nama Lengkap</th>
                            <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Program Studi</th>
                            <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Lokasi Tugas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedDatas.length > 0 ? (
                            displayedDatas.map((data) => (
                              <tr key={data.id}>
                                <td className="px-4 py-3 border-light text-left">
                                  <Link
                                    to={`/residen/biodata/${data.id}`}
                                    className="text-primary fw-bold text-decoration-none"
                                  >
                                    {data.username}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 border-light text-left">
                                  <span className="fw-bold text-dark">{data.name}</span>
                                </td>
                                <td className="px-4 py-3 border-light text-muted small text-left">
                                  {data.prodi}
                                </td>
                                <td className="px-4 py-3 border-light text-left">
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-map-marker-alt text-danger mr-2 tiny"></i>
                                    <span className="small">{data.tempatBertugas || '-'}</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center py-5 text-muted">
                                <i className="fas fa-user-slash fa-2x mb-3 d-block"></i>
                                Tidak ada data yang ditemukan
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
                {totalPages > 1 && (
                  <Card.Footer className="bg-white border-top-light py-3">
                    <CustomPagination
                      activePage={currentPage}
                      itemsCountPerPage={itemsPerPage}
                      totalItemsCount={totalItems}
                      onChange={(pageNumber) => setCurrentPage(pageNumber)}
                      pageRangeDisplayed={5}
                    />
                  </Card.Footer>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .tiny { font-size: 0.7rem; }
        .border-top-light { border-top: 1px solid #f1f5f9; }
      `}</style>
    </div>
  );
};

export default ShowLaporanKabupaten;
