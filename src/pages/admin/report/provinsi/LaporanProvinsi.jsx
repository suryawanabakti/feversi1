import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../../api/axios";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Bar } from "react-chartjs-2";
import { toast } from "react-hot-toast";
import { Card, Form, InputGroup, Button, Table, Badge } from "react-bootstrap";
import useAuthContext from "../../../../context/AuthContext";
import "leaflet/dist/leaflet.css";

// ... (marker icon fix remains same)

const LaporanProvinsi = () => {
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
  const [dataChart, setDataChart] = useState({
    labels: [],
    datasets: [
      {
        label: "Jumlah Residen",
        data: [],
        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(37, 99, 235, 0.9)",
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
        ticks: { stepSize: 1, font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      }
    },
  };

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
    const toastId = toast.loading("Memuat sebaran data...");
    try {
      const { prodiId, status } = filters;
      const res = await axios.get(`/api/laporan-provinsi`, {
        params: { prodiId, status },
      });

      const reportData = res.data.data || res.data;
      setDatas(reportData);

      setDataChart({
        labels: reportData.map((d) => d.nama),
        datasets: [
          {
            label: "Jumlah Residen",
            data: reportData.map((d) => d.totalResiden),
            backgroundColor: "rgba(37, 99, 235, 0.7)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 2,
            borderRadius: 6,
            hoverBackgroundColor: "rgba(37, 99, 235, 0.9)",
          },
        ],
      });
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
            <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Sebaran Residen</h1>
            <p className="text-muted mt-1">Statistik dan peta sebaran residen berdasarkan provinsi di Indonesia.</p>
          </div>
        </div>

        <div className="section-body mt-4">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="row align-items-center">
                <div className="col-lg-3 border-right">
                  <h6 className="text-dark mb-1" style={{ fontWeight: 700 }}>Filter Laporan</h6>
                  <p className="small text-muted mb-0">Sesuaikan parameter untuk akurasi data.</p>
                </div>
                <div className="col-lg-9 pt-3 pt-lg-0">
                  <div className="row">
                    {isAdmin && (
                      <div className="col-md-6 text-left">
                        <Form.Group className="mb-0">
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
                      <Form.Group className="mb-0">
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
                  <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Peta Interaktif</h4>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ height: "550px", width: "100%" }}>
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
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted small">Populasi:</span>
                                <Badge bg="primary" style={{ borderRadius: '4px' }}>{data.totalResiden}</Badge>
                              </div>
                              <Link
                                to={`/report-provinsi/${data.id}?prodiId=${filters.prodiId}&status=${filters.status}`}
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
              <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px', height: "614px" }}>
                <Card.Header className="bg-white border-bottom-0 py-3 px-4 d-flex justify-content-between align-items-center">
                  <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Data Wilayah</h4>
                </Card.Header>
                <Card.Body className="p-0 d-flex flex-column">
                  <div className="p-3 bg-light border-bottom">
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-right-0">
                        <i className="fas fa-search text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        className="border-left-0"
                        placeholder="Cari provinsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                  <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto' }}>
                    <Table hover className="mb-0">
                      <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                        <tr>
                          <th className="border-0 px-4 py-3 text-muted small text-uppercase fw-bold">Provinsi</th>
                          <th className="border-0 px-4 py-3 text-muted small text-uppercase fw-bold text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDatas.map((data) => (
                          <tr key={data.id}>
                            <td className="px-4 py-3 border-light">
                              <Link
                                to={`/report-provinsi/${data.id}?prodiId=${filters.prodiId}&status=${filters.status}`}
                                className="text-dark fw-bold text-decoration-none"
                              >
                                {data.nama}
                              </Link>
                            </td>
                            <td className="px-4 py-3 border-light text-center">
                              <Badge
                                bg="primary"
                                pill
                                className="px-3"
                                style={{ backgroundColor: '#2563eb' }}
                              >
                                {data.totalResiden}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="col-12 mt-4">
              <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                <Card.Header className="bg-white border-bottom-0 py-3 px-4">
                  <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Grafik Perbandingan</h4>
                </Card.Header>
                <Card.Body className="p-4">
                  <div style={{ height: "400px" }}>
                    <Bar data={dataChart} options={chartOptions} />
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



export default LaporanProvinsi;
