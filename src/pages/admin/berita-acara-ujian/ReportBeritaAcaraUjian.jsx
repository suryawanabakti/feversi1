import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, Table, Form, Button, Badge, Spinner, InputGroup } from "react-bootstrap";
import baseurl from "../../../api/baseurl";

export default function ReportBeritaAcaraUjian() {
  const [loading, setLoading] = useState(false);
  const [prodiId, setProdiId] = useState("");
  const [proposal, setProposal] = useState(false);
  const [hasil, setHasil] = useState(false);
  const [akhir, setAkhir] = useState(false);
  const [nasional, setNasional] = useState(false);
  const [residen, setResiden] = useState([]);
  const [prodis, setProdis] = useState([]);

  const getProdiOptions = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdis(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching prodi options:", err);
    }
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Sedang memfilter data...");
    try {
      const res = await axios.post("/api/laporan/berita-acara-ujian", {
        prodiId,
        proposal,
        hasil,
        akhir,
        nasional,
      });
      setResiden(res.data);
      toast.success(`${res.data.length} residen ditemukan`, { id: tid });
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data. Silakan coba lagi.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProdiOptions();
  }, []);

  const getStatusBadge = (exam, label) => {
    const isSuccess = !!exam;
    return (
      <Badge
        bg={isSuccess ? "soft-success" : "soft-secondary"}
        className={`me-1 ${isSuccess ? "text-success" : "text-muted"}`}
        title={isSuccess ? `${label} - Tgl: ${exam.tgl_ujian}` : `${label} - Belum`}
        style={{ cursor: 'help', fontSize: '0.75rem', padding: '0.4em 0.7em' }}
      >
        {label}
      </Badge>
    );
  };

  const exportUrl = `${baseurl}/api/laporan/berita-acara-ujian-export?proposal=${proposal ? 1 : 0
    }&hasil=${hasil ? 1 : 0}&akhir=${akhir ? 1 : 0
    }&nasional=${nasional ? 1 : 0}&prodiId=${prodiId || ""
    }`;

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header border-bottom-0 pb-0 bg-transparent shadow-none">
          <div>
            <h1 className="text-dark" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Berita Acara Ujian</h1>
            <p className="text-muted mt-1">Laporan status ujian kelulusan residen.</p>
          </div>
        </div>

        <div className="section-body mt-4 text-left">
          <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="row align-items-center">
                <div className="col-lg-3 border-right text-left">
                  <h6 className="text-dark mb-1" style={{ fontWeight: 700 }}>Filter Laporan</h6>
                  <p className="small text-muted mb-0">Pilih program studi dan jenis ujian.</p>
                </div>
                <div className="col-lg-9 pt-3 pt-lg-0">
                  <Form onSubmit={submit}>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-4">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Program Studi</Form.Label>
                        <Form.Select
                          disabled={loading}
                          className="bg-light border-0"
                          style={{ borderRadius: '10px', height: '45px' }}
                          value={prodiId}
                          onChange={(e) => setProdiId(e.target.value)}
                        >
                          <option value="">Semua Program Studi</option>
                          {prodis.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-5">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Tahapan Ujian</Form.Label>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {[
                            { name: 'Proposal', state: proposal, set: setProposal },
                            { name: 'Hasil', state: hasil, set: setHasil },
                            { name: 'Akhir', state: akhir, set: setAkhir },
                            { name: 'Nasional', state: nasional, set: setNasional }
                          ].map((item) => (
                            <div key={item.name}>
                              <input
                                type="checkbox"
                                className="btn-check"
                                id={`btn-check-${item.name}`}
                                checked={item.state}
                                onChange={(e) => item.set(e.target.checked)}
                                autoComplete="off"
                              />
                              <label
                                className={`btn btn-sm ${item.state ? 'btn-primary' : 'btn-soft-secondary text-muted'} px-3 rounded-pill`}
                                htmlFor={`btn-check-${item.name}`}
                                style={{ fontWeight: 600, transition: 'all 0.2s' }}
                              >
                                {item.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-md-3 d-flex gap-2">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                          className="flex-grow-1 shadow-sm"
                          style={{ borderRadius: '10px', fontWeight: 600, height: '45px' }}
                        >
                          {loading ? <Spinner size="sm" /> : 'Filter Data'}
                        </Button>
                        {residen.length > 0 && (
                          <a
                            href={exportUrl}
                            className="btn btn-soft-success shadow-none p-0 d-flex align-items-center justify-content-center"
                            style={{ borderRadius: '10px', width: '45px', height: '45px' }}
                            title="Export Excel"
                          >
                            <i className="fas fa-file-excel fs-5 text-success"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </Form>
                </div>
              </div>
            </Card.Body>
          </Card>

          {residen.length > 0 ? (
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-white border-bottom-0 py-3 px-4">
                <h4 className="m-0 text-dark" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Hasil Analisis: <span className="text-primary">{residen.length} Residen</span>
                </h4>
              </Card.Header>
              <Card.Body className="p-0 text-left">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold">NIM / Nama</th>
                        <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold">Status Ujian</th>
                        <th className="px-4 py-3 border-0 text-muted small text-uppercase fw-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residen.map((data) => (
                        <tr key={data.id}>
                          <td className="px-4 py-3 border-light">
                            <div className="fw-bold text-dark">{data.username}</div>
                            <div className="small text-muted">{data.name}</div>
                          </td>
                          <td className="px-4 py-3 border-light align-middle">
                            <div className="d-flex flex-wrap gap-1">
                              {getStatusBadge(data.proposal, "Proposal")}
                              {getStatusBadge(data.hasil, "Hasil")}
                              {getStatusBadge(data.akhir, "Akhir")}
                              {getStatusBadge(data.nasional, "Nasional")}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-light text-center align-middle">
                            <Link
                              to={`/residen/biodata/${data.id}`}
                              className="btn btn-sm btn-soft-primary px-3 text-primary"
                              style={{ borderRadius: '6px', fontWeight: 600 }}
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          ) : !loading && (
            <Card className="border-0 shadow-sm overflow-hidden text-center py-5" style={{ borderRadius: '15px' }}>
              <Card.Body>
                <div className="opacity-20 mb-3">
                  <i className="fas fa-clipboard-list fa-3x"></i>
                </div>
                <h6 className="text-muted fw-normal">Silakan pilih filter untuk melihat laporan berita acara ujian.</h6>
              </Card.Body>
            </Card>
          )}
        </div>
      </section>
      <style>{`
        .bg-soft-success { background-color: #dcfce7 !important; }
        .bg-soft-secondary { background-color: #f1f5f9 !important; }
        .btn-soft-secondary { background-color: #f1f5f9; border: none; }
        .btn-soft-primary { background-color: #e0f2fe; border: none; }
        .btn-soft-primary:hover { background-color: #bae6fd; color: #0369a1 !important; }
        .btn-soft-success { background-color: #dcfce7; border: none; }
        .btn-soft-success:hover { background-color: #bbf7d0; }
        .text-left { text-align: left !important; }
        .opacity-20 { opacity: 0.2; }
      `}</style>
    </div>
  );
}

