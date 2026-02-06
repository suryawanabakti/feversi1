import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../../api/axios";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { toast } from "react-hot-toast";
import { Card, Table, Form, InputGroup, Button, Badge } from "react-bootstrap";
import useAuthContext from "../../../../context/AuthContext";
import "leaflet/dist/leaflet.css";

const LaporanKabupaten = () => {
  const { user } = useAuthContext();
  const isAdmin = user?.roles?.[0]?.name === "admin";

  const [prodis, setProdis] = useState([]);
  const [filters, setFilters] = useState({
    prodiId: "",
    status: "",
  });

  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const getProdiOptions = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdis(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching prodi options:", err);
    }
  };

  const fetchDatas = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Memuat sebaran data kabupaten...");
    try {
      const { prodiId, status } = filters;
      const res = await axios.get(`/api/laporan-kabupaten`, {
        params: { prodiId, status },
      });
      setDatas(res.data.data || res.data);
      toast.success("Data sebaran siap", { id: toastId });
    } catch (err) {
      console.error("Error fetching report data:", err);
      toast.error("Gagal memuat data", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAdmin) {
      getProdiOptions();
    }
    fetchDatas();
  }, [isAdmin, fetchDatas]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredDatas = datas.filter(d =>
    d.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header border-bottom-0 pb-0 bg-transparent shadow-none">
          <div>
            <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Sebaran per Kabupaten</h1>
            <p className="text-muted mt-1">Populasi residen berdasarkan kabupaten/kota di seluruh Indonesia.</p>
          </div>
        </div>

        <div className="section-body mt-4">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="row align-items-center">
                <div className="col-lg-3 border-right text-left">
                  <h6 className="text-dark mb-1" style={{ fontWeight: 700 }}>Filter Wilayah</h6>
                  <p className="small text-muted mb-0">Sesuaikan data berdasarkan prodi dan status.</p>
                </div>
                <div className="col-lg-9 pt-3 pt-lg-0">
                  <div className="row">
                    {isAdmin && (
                      <div className="col-md-6 text-left">
                        <Form.Group className="mb-0 text-left">
                          <Form.Label className="text-dark small font-weight-bold mb-1">Program Studi</Form.Label>
                          <Form.Select
                            name="prodiId"
                            className="border-0 bg-light"
                            style={{ borderRadius: '10px', height: '45px' }}
                            value={filters.prodiId}
                            onChange={handleFilterChange}
                          >
                            <option value="">Semua Program Studi</option>
                            {prodis.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    )}
                    <div className={`col-md-${isAdmin ? "6" : "12"} text-left`}>
                      <Form.Group className="mb-0 text-left">
                        <Form.Label className="text-dark small font-weight-bold mb-1">Status Keanggotaan</Form.Label>
                        <Form.Select
                          name="status"
                          className="border-0 bg-light"
                          style={{ borderRadius: '10px', height: '45px' }}
                          value={filters.status}
                          onChange={handleFilterChange}
                        >
                          <option value="">Residen Aktif</option>
                          <option value="alumni">Alumni / Lulus</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <div className="row">
            <div className="col-lg-8">
              <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                <Card.Header className="bg-white border-bottom-0 py-3 px-4">
                  <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Peta Sebaran</h4>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ height: "600px", width: "100%" }}>
                    <MapContainer
                      center={[-0.789275, 113.921327]}
                      zoom={5}
                      scrollWheelZoom={true}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      />
                      {datas.map((data) => data.totalResiden > 0 && (
                        <Marker position={[data.latitude, data.longitude]} key={data.id}>
                          <Popup className="custom-popup">
                            <div className="p-1" style={{ minWidth: '150px' }}>
                              <h6 className="mb-2 font-weight-bold" style={{ color: '#1e293b' }}>{data.nama}</h6>
                              <div className="d-flex justify-content-between align-items-center mb-3 text-left">
                                <span className="text-muted small">Populasi:</span>
                                <Badge bg="primary" style={{ borderRadius: '4px' }}>{data.totalResiden}</Badge>
                              </div>
                              <Link
                                to={`/report-kabupaten/${data.id}?prodiId=${filters.prodiId}&status=${filters.status}`}
                                className="btn btn-primary btn-block btn-sm text-white py-2"
                                style={{ borderRadius: '8px', fontWeight: 600 }}
                              >
                                Detail Wilayah
                              </Link>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="col-lg-4">
              <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px', height: "664px" }}>
                <Card.Header className="bg-white border-bottom-0 py-3 px-4">
                  <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tabel Data</h4>
                </Card.Header>
                <Card.Body className="p-0 d-flex flex-column">
                  <div className="p-3 bg-light border-bottom">
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-right-0">
                        <i className="fas fa-search text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="border-left-0"
                        placeholder="Cari kabupaten..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                  <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto' }}>
                    <Table hover className="mb-0">
                      <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                        <tr>
                          <th className="border-0 px-4 py-3 text-muted small text-uppercase fw-bold text-left">Kabupaten / Kota</th>
                          <th className="border-0 px-4 py-3 text-muted small text-uppercase fw-bold text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDatas.length > 0 ? (
                          filteredDatas.map((data) => (
                            <tr key={data.id}>
                              <td className="px-4 py-3 border-light text-left">
                                <Link
                                  to={`/report-kabupaten/${data.id}?prodiId=${filters.prodiId}&status=${filters.status}`}
                                  className="text-dark fw-bold text-decoration-none"
                                >
                                  {data.nama}
                                </Link>
                              </td>
                              <td className="px-4 py-3 border-light text-center">
                                <Badge bg="primary" pill className="px-3">{data.totalResiden}</Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center py-5 text-muted">Tidak ada data</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LaporanKabupaten;

