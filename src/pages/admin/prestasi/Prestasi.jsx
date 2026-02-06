import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import { CustomPagination } from "../../../components/custom-pagination";
import { Card, Table, Form, InputGroup, Button, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Prestasi() {
  const [prestasi, setPrestasi] = useState([]);
  const [term, setTerm] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [prodis, setProdis] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const [loading, setLoading] = useState(false);

  const getPrestasi = useCallback(async (
    pageNumber = 1,
    searchTerm = term,
    selectedProdiId = prodiId
  ) => {
    setLoading(true);
    const toastId = toast.loading("Memuat data prestasi...");
    try {
      const res = await axios.get(
        `/api/admin-prestasi?page=${pageNumber}&term=${searchTerm}&prodiId=${selectedProdiId}`
      );
      setTotalItem(res.data.total);
      setActivePage(res.data.current_page);
      setPrestasi(res.data.data);
      toast.success("Data dimuat", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data prestasi", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [term, prodiId]);

  const getProdiOptions = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdis(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching prodi options:", err);
    }
  };

  useEffect(() => {
    getPrestasi();
    getProdiOptions();
  }, [getPrestasi]);

  const handleSearch = (e) => {
    e.preventDefault();
    getPrestasi(1, term, prodiId);
  };

  const handleProdiChange = (e) => {
    const newProdiId = e.target.value;
    setProdiId(newProdiId);
    getPrestasi(1, term, newProdiId);
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1 className="font-weight-bold">Prestasi Residen</h1>
          <div className="section-header-breadcrumb">
            <div className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="breadcrumb-item active">Prestasi Residen</div>
          </div>
        </div>

        <div className="section-body mt-4">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="row align-items-center">
                <div className="col-lg-3 border-right text-left">
                  <h6 className="text-dark mb-1" style={{ fontWeight: 700 }}>Filter & Pencarian</h6>
                  <p className="small text-muted mb-0">Temukan prestasi berdasarkan nama, NIM, atau prodi.</p>
                </div>
                <div className="col-lg-9 pt-3 pt-lg-0">
                  <Form onSubmit={handleSearch}>
                    <div className="row g-3">
                      <div className="col-md-5">
                        <InputGroup>

                          <Form.Control

                            placeholder="Cari Nama / NIM / Prestasi..."
                            style={{ borderRadius: '0 10px 10px 0', height: '45px' }}
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                          />
                        </InputGroup>
                      </div>
                      <div className="col-md-4">
                        <Form.Select

                          value={prodiId}
                          onChange={handleProdiChange}
                        >
                          <option value="">Semua Program Studi</option>
                          {prodis.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3 d-flex gap-2 text-left">
                        <Button variant="primary" type="submit" className="flex-grow-1 shadow-sm px-4" style={{ borderRadius: '10px', fontWeight: 600 }}>
                          Cari
                        </Button>
                        <a
                          className="btn btn-outline-primary shadow-sm"
                          href={`${baseurl}/prestasi/export`}
                          style={{ borderRadius: '10px' }}
                          title="Export Excel"
                        >
                          <i className="fas fa-file-export"></i>
                        </a>
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
                Total Data: <span className="text-primary">{totalItem}</span>
              </h4>
            </Card.Header>
            <Card.Body className="p-0 text-left">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">NIM / Nama</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Program Studi</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Tipe</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Pencapaian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <Spinner animation="border" variant="primary" size="sm" className="mr-2" />
                          <span className="text-muted">Memuat data...</span>
                        </td>
                      </tr>
                    ) : prestasi.length > 0 ? (
                      prestasi.map((data) => (
                        <tr key={data.id}>
                          <td className="px-4 py-3 border-light text-left">
                            <div className="fw-bold text-dark">{data.user.username}</div>
                            <div className="small text-muted">{data.user.name}</div>
                          </td>
                          <td className="px-4 py-3 border-light text-muted small text-left">
                            {data.user.biodata?.prodi?.name || '-'}
                          </td>
                          <td className="px-4 py-3 border-light text-left">
                            <Badge bg="soft-info" className="text-info px-2 py-1" style={{ fontSize: '0.7rem', backgroundColor: '#e0f2fe' }}>
                              {data.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 border-light text-left">
                            <a
                              href={`${baseurl}/storage/prestasi/${data.prestasi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary fw-bold text-decoration-none d-flex align-items-center"
                            >
                              <i className="fas fa-certificate mr-2 opacity-50"></i>
                              {data.name}
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          <i className="fas fa-award fa-2x mb-3 d-block opacity-20"></i>
                          Belum ada data prestasi ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            {totalItem > 0 && (
              <Card.Footer className="bg-white border-top-light py-3">
                <CustomPagination
                  activePage={activePage}
                  itemsCountPerPage={10}
                  totalItemsCount={totalItem}
                  pageRangeDisplayed={5}
                  onChange={(pageNumber) => getPrestasi(pageNumber)}
                />
              </Card.Footer>
            )}
          </Card>
        </div>
      </section>
      <style>{`
        .border-top-light { border-top: 1px solid #f1f5f9; }
        .opacity-20 { opacity: 0.2; }
        .bg-soft-info { background-color: #e0f2fe; color: #0369a1; }
      `}</style>
    </div>
  );
}

