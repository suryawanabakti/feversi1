import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Button, Card, Table, Form, InputGroup, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import useAuthContext from "../../../context/AuthContext";
import baseurl from "../../../api/baseurl";

export default function LewatMasaStudi() {
  const { user } = useAuthContext();
  const [residen, setResiden] = useState([]);
  const [selection, setSelection] = useState([]);
  const [prodiId, setProdiId] = useState("");
  const [prodis, setProdis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getProdiOptions = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdis(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching prodi options:", err);
    }
  };

  const getData = useCallback(async (selectedProdiId = prodiId) => {
    setLoading(true);
    const tid = toast.loading("Memuat data residen lewat masa studi...");
    try {
      const res = await axios.get(`/api/residen-lewat-masa-studi`, {
        params: { prodiId: selectedProdiId }
      });
      setResiden(res.data);
      toast.success("Data dimuat", { id: tid });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data", { id: tid });
    } finally {
      setLoading(false);
    }
  }, [prodiId]);

  useEffect(() => {
    getData();
    getProdiOptions();
  }, [getData]);

  const handleProdiChange = (e) => {
    const value = e.target.value;
    setProdiId(value);
    getData(value);
  };

  const toggleSelection = (id) => {
    setSelection(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selection.length === filteredResiden.length) {
      setSelection([]);
    } else {
      setSelection(filteredResiden.map(r => r.id));
    }
  };

  const sendEmail = async () => {
    setLoading(true);
    const tid = toast.loading("Sedang mengirim email pemberitahuan...");
    try {
      await axios.post(`/api/residen-lewat-masa-studi/send-email`, {
        selection,
      });
      toast.success("Email berhasil dikirim ke residen terpilih", { id: tid });
      setSelection([]);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim email", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const filteredResiden = residen.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (exam, label) => {
    const isSuccess = !!exam;
    return (
      <Badge
        bg={isSuccess ? "soft-success" : "soft-secondary"}
        className={`me-1 ${isSuccess ? "text-success" : "text-muted"}`}
        title={isSuccess ? `${label} - Tgl: ${exam.tgl_ujian}` : `${label} - Belum`}
        style={{ cursor: 'help', fontSize: '0.7rem', padding: '0.4em 0.6em' }}
      >
        {label[0]}
      </Badge>
    );
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header border-bottom-0 pb-0 bg-transparent shadow-none">
          <div>
            <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Lewat Masa Studi</h1>
            <p className="text-muted mt-1">Daftar residen yang belum lulus meskipun telah melewati masa studi normal.</p>
          </div>
        </div>

        <div className="section-body mt-4 text-left">
          <div className="alert alert-custom bg-soft-info border-0 text-info d-flex align-items-center mb-4 p-3" style={{ borderRadius: '12px' }}>
            <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
              <i className="fas fa-info-circle small"></i>
            </div>
            <div className="small">
              Residen di bawah ini telah melewati <strong>masa studi maksimal</strong> sesuai kurikulum prodi masing-masing dan belum menyelesaikan <strong>ujian akhir</strong>.
            </div>
          </div>

          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4 ">
              <div className="row align-items-center">
                <div className="col-lg-3 border-right text-left">
                  <h6 className="text-dark mb-1" style={{ fontWeight: 700 }}>Filter & Aksi</h6>
                  <p className="small text-muted mb-0">Sesuaikan data dan ambil tindakan cepat.</p>
                </div>
                <div className="col-lg-9 pt-3 pt-lg-0">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-0">
                          <i className="fas fa-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                          className="bg-light border-0"
                          placeholder="Cari Nama / NIM..."
                          style={{ borderRadius: '0 10px 10px 0', height: '45px' }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </div>
                    {user?.roles?.[0]?.name === "admin" && (
                      <div className="col-md-4 text-left">
                        <Form.Select
                          className="bg-light border-0"
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
                    )}
                    <div className="col-md-4 d-flex gap-2 text-left">
                      <Button
                        variant="primary"
                        onClick={sendEmail}
                        disabled={loading || selection.length === 0}
                        className="flex-grow-1 shadow-sm"
                        style={{ borderRadius: '10px', fontWeight: 600 }}
                      >
                        <i className="far fa-paper-plane me-2"></i> Kirim Email ({selection.length})
                      </Button>
                      <a
                        className="btn btn-outline-primary"
                        href={`${baseurl}/export-residen-habis-masa-studi`}
                        style={{ borderRadius: '10px' }}
                      >
                        <i className="fas fa-file-export"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden text-left" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-white border-bottom-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Daftar Residen: <span className="text-primary">{filteredResiden.length}</span>
              </h4>
            </Card.Header>
            <Card.Body className="p-0 text-left">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 text-center" style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selection.length > 0 && selection.length === filteredResiden.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">NIM / Nama</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Angkatan</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Masa Studi</th>
                      <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-left">Status Ujian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-left">
                          <Spinner animation="border" variant="primary" size="sm" className="mr-2" />
                          <span className="text-muted">Menganalisis data masa studi...</span>
                        </td>
                      </tr>
                    ) : filteredResiden.length > 0 ? (
                      filteredResiden.map((data) => (
                        <tr key={data.id}>
                          <td className="px-4 py-3 border-light text-center">
                            <Form.Check
                              type="checkbox"
                              checked={selection.includes(data.id)}
                              onChange={() => toggleSelection(data.id)}
                            />
                          </td>
                          <td className="px-4 py-3 border-light text-left">
                            <Link to={`/residen/biodata/${data.id}`} className="fw-bold text-primary text-decoration-none d-block">
                              {data.username}
                            </Link>
                            <span className="small text-dark fw-medium">{data.name}</span>
                          </td>
                          <td className="px-4 py-3 border-light text-left">
                            <Badge bg="soft-dark" className="text-dark fw-normal rounded-pill px-3">
                              Tahun {data.tahunResidenMasuk}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 border-light text-left">
                            <div className="fw-bold text-danger">{data.masaStudi} Semester</div>
                            <div className="small text-muted">Lewat {data.sudahLewat} sem.</div>
                          </td>
                          <td className="px-4 py-3 border-light text-left">
                            <div className="d-flex align-items-center">
                              {getStatusBadge(data.proposal, "Proposal")}
                              {getStatusBadge(data.hasil, "Hasil")}
                              {getStatusBadge(data.akhir, "Akhir")}
                              {getStatusBadge(data.nasional, "Nasional")}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted text-left">
                          <i className="fas fa-user-check fa-2x mb-3 d-block opacity-20"></i>
                          Tidak ada residen yang melewati masa studi saat ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </section>
      <style>{`
        .bg-soft-info { background-color: #e0f2fe !important; }
        .bg-soft-success { background-color: #dcfce7 !important; }
        .bg-soft-secondary { background-color: #f1f5f9 !important; }
        .bg-soft-dark { background-color: #f1f5f9 !important; }
        .opacity-20 { opacity: 0.2; }
        .text-left { text-align: left !important; }
        table th, table td { vertical-align: middle !important; }
      `}</style>
    </div>
  );
}

