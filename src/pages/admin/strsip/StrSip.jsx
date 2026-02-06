import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import { CustomPagination } from "../../../components/custom-pagination";
import { Link } from "react-router-dom";
import { Card, Table, Form, InputGroup, Button, Badge, Spinner } from "react-bootstrap";

export default function StrSip() {
  const [dataList, setDataList] = useState([]);
  const [term, setTerm] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [prodis, setProdis] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleViewDocument = async (e, filePath, fileUrl) => {
    e.preventDefault();
    if (!fileUrl) return;
    const toastId = toast.loading("Membuka dokumen...");
    try {
      const response = await axios.get(`/api/documents/${filePath}/${fileUrl}`, {
        responseType: "blob",
      });
      const file = new Blob([response.data], { type: response.headers["content-type"] });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
      toast.dismiss(toastId);
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Gagal membuka dokumen. Anda mungkin tidak memiliki akses.");
    }
  };

  const getProdiOptions = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdis(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching prodi options:", err);
    }
  };

  const getDatas = useCallback(async (pageNumber = 1, searchTerm = term, selectedProdiId = prodiId) => {
    setLoading(true);
    const toastId = toast.loading("Memuat data dokumen...");
    try {
      const res = await axios.get(
        `/api/str-sip?page=${pageNumber}&term=${searchTerm}&prodiId=${selectedProdiId}`
      );
      setTotalItem(res.data.total);
      setActivePage(res.data.current_page);
      setDataList(res.data.data);
      toast.success("Data dimuat", { id: toastId });
    } catch (err) {
      console.error("respon", err);
      toast.error("Gagal mengambil data STR/SIP", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [term, prodiId]);

  const handleSearch = (e) => {
    e.preventDefault();
    getDatas(1, term, prodiId);
  };

  const handleProdiChange = (e) => {
    const newProdiId = e.target.value;
    setProdiId(newProdiId);
    getDatas(1, term, newProdiId);
  };

  useEffect(() => {
    getDatas();
    getProdiOptions();
  }, [getDatas]);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1 className="font-weight-bold">Dokumen Residen</h1>
          <div className="section-header-breadcrumb">
            <div className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="breadcrumb-item active">Dokumen Residen</div>
          </div>
        </div>

        <div className="section-body mt-4">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4 text-left">
              <div className="row align-items-center">
                <div className="col-lg-3 border-right text-left">
                  <h6 className="text-dark mb-1" style={{ fontWeight: 700 }}>Filter & Pencarian</h6>
                  <p className="small text-muted mb-0">Temukan residen berdasarkan nama, NIM, atau prodi.</p>
                </div>
                <div className="col-lg-9 pt-3 pt-lg-0">
                  <Form onSubmit={handleSearch}>
                    <div className="row g-3">
                      <div className="col-md-5">
                        <InputGroup>

                          <Form.Control

                            placeholder="Cari Nama / NIM..."

                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                          />
                        </InputGroup>
                      </div>
                      <div className="col-md-4">
                        <Form.Select

                          style={{ borderRadius: '10px', height: '45px' }}
                          value={prodiId}
                          onChange={handleProdiChange}
                        >
                          <option value="">Semua Program Studi</option>
                          {prodis.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3 d-flex gap-2">
                        <Button variant="primary" type="submit" className="flex-grow-1 shadow-sm px-4" style={{ borderRadius: '10px', fontWeight: 600 }}>
                          Cari
                        </Button>
                        <Button
                          variant="white"
                          className="shadow-sm border-0"
                          onClick={() => { setTerm(""); setProdiId(""); getDatas(1, "", ""); }}
                          style={{ borderRadius: '10px' }}
                          title="Reset Filter"
                        >
                          <i className="fas fa-undo text-secondary"></i>
                        </Button>
                      </div>
                    </div>
                  </Form>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-bottom-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Total Residen: <span className="text-primary">{totalItem}</span>
              </h4>
            </Card.Header>
            <Card.Body className="p-0 text-left">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold">NIM / Nama</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">STR</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">SIP</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">Ijazah</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <Spinner animation="border" variant="primary" size="sm" className="mr-2" />
                          <span className="text-muted">Memuat data residen...</span>
                        </td>
                      </tr>
                    ) : dataList.length > 0 ? (
                      dataList.map((data) => (
                        <tr key={data.id}>
                          <td className="px-4 py-3 border-light">
                            <div className="fw-bold text-dark">{data.username}</div>
                            <div className="small text-muted">{data.name}</div>
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {data.biodata?.str ? (
                              <a
                                href="#"
                                onClick={(e) => handleViewDocument(e, "str", data.biodata.str)}
                                className="btn btn-sm btn-soft-primary px-3 text-primary"
                                style={{ borderRadius: '6px', fontWeight: 600 }}
                              >
                                <i className="fas fa-eye mr-1"></i> Lihat
                              </a>
                            ) : (
                              <Badge bg="soft-danger" className="text-danger fw-normal">Belum ada</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {data.biodata?.sip ? (
                              <a
                                href="#"
                                onClick={(e) => handleViewDocument(e, "sip", data.biodata.sip)}
                                className="btn btn-sm btn-soft-primary px-3 text-primary"
                                style={{ borderRadius: '6px', fontWeight: 600 }}
                              >
                                <i className="fas fa-eye mr-1"></i> Lihat
                              </a>
                            ) : (
                              <Badge bg="soft-danger" className="text-danger fw-normal">Belum ada</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {data.biodata?.ijazah_terakhir ? (
                              <a
                                href="#"
                                onClick={(e) => handleViewDocument(e, "ijazahterakhir", data.biodata.ijazah_terakhir)}
                                className="btn btn-sm btn-soft-info px-3 text-info"
                                style={{ borderRadius: '6px', fontWeight: 600 }}
                              >
                                <i className="fas fa-certificate mr-1"></i> Ijazah
                              </a>
                            ) : (
                              <Badge bg="soft-danger" className="text-danger fw-normal">Belum ada</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 border-light text-center">
                            {data.biodata?.pas_foto ? (
                              <a
                                href="#"
                                onClick={(e) => handleViewDocument(e, "pasfoto", data.biodata.pas_foto)}
                                className="btn btn-sm btn-soft-success px-3 text-success"
                                style={{ borderRadius: '6px', fontWeight: 600 }}
                              >
                                <i className="fas fa-eye mr-1"></i> Foto
                              </a>
                            ) : (
                              <Badge bg="soft-danger" className="text-danger fw-normal">Belum ada</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          <i className="fas fa-id-card fa-2x mb-3 d-block opacity-20"></i>
                          Tidak ada data residen ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            {totalItem > 10 && (
              <Card.Footer className="bg-white border-top-light py-3">
                <CustomPagination
                  activePage={activePage}
                  itemsCountPerPage={10}
                  totalItemsCount={totalItem}
                  pageRangeDisplayed={5}
                  onChange={(pageNumber) => getDatas(pageNumber)}
                />
              </Card.Footer>
            )}
          </Card>
        </div>
      </section>
      <style>{`
        .border-top-light { border-top: 1px solid #f1f5f9; }
        .opacity-20 { opacity: 0.2; }
        .btn-soft-primary { background-color: #e0f2fe; border: none; }
        .btn-soft-primary:hover { background-color: #bae6fd; color: #0369a1 !important; }
        .btn-soft-info { background-color: #e0f2fe; border: none; }
        .btn-soft-info:hover { background-color: #bae6fd; color: #0891b2 !important; }
        .btn-soft-success { background-color: #dcfce7; border: none; }
        .btn-soft-success:hover { background-color: #bbf7d0; color: #15803d !important; }
        .badge[class*="soft-"] { font-weight: 500; font-size: 0.7rem; }
        .bg-soft-danger { background-color: #fee2e2; }
      `}</style>
    </div>
  );
}

