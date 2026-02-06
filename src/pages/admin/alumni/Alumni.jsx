import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import useAuthContext from "../../../context/AuthContext";
import { CustomPagination } from "../../../components/custom-pagination";
import { Card, Button, Form, InputGroup, Spinner, Badge } from "react-bootstrap";

const Alumni = () => {
  const { user } = useAuthContext();
  const [alumni, setAlumni] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [term, setTerm] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [prodi, setProdi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const getAlumni = async (
    pageNumber = page,
    searchTerm = term,
    filterProdi = prodiId
  ) => {
    setIsSearching(true);
    const toastId = toast.loading("Mohon tunggu, sedang memuat data...");

    try {
      const params = new URLSearchParams();
      if (pageNumber) params.append("page", pageNumber);
      if (searchTerm) params.append("search", searchTerm);
      if (filterProdi) params.append("prodiId", filterProdi);

      const res = await axios.get(`/api/alumni?${params.toString()}`);

      const responseData = res.data;

      if (responseData.data && Array.isArray(responseData.data)) {
        setAlumni(responseData.data);

        const meta = responseData.meta || responseData;
        if (meta.current_page) {
          setPage(meta.current_page);
          setTotal(meta.total);
        }
      } else {
        setAlumni(responseData);
        setTotal(responseData.length || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data alumni");
    }

    toast.dismiss(toastId);
    setLoading(false);
    setIsSearching(false);
  };

  const getProdi = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdi(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal mengambil Data Prodi");
    }
  };

  const handleChangeFilter = async (value) => {
    setProdiId(value);
    await getAlumni(1, term, value);
  };

  useEffect(() => {
    if (user?.roles?.[0]?.name === "admin") {
      getProdi();
    }
    getAlumni();
  }, []);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (prodiId) params.append("prodiId", prodiId);

      const response = await axios.get(`/api/alumni/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alumni-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export berhasil");
    } catch (error) {
      console.error(error);
      toast.error("Gagal export data");
    }
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="mr-3">Alumni</h1>
            <Badge bg="primary" className="p-2">
              Total: {total}
            </Badge>
          </div>
        </div>

        <div className="section-body">
          <Card>
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
                <div className="d-flex mb-2 mb-md-0">
                  {user?.roles?.[0]?.name === "admin" && (
                    <>
                      <Button
                        variant="success"
                        className="mr-2"
                        onClick={handleExport}
                      >
                        <i className="fas fa-file-excel mr-1"></i> Export Excel
                      </Button>
                      <Form.Select
                        className="mr-2"
                        style={{ width: "200px" }}
                        value={prodiId}
                        onChange={(e) => handleChangeFilter(e.target.value)}
                      >
                        <option value="">Semua Prodi</option>
                        {prodi.map((data, index) => (
                          <option value={data.id} key={index}>
                            {data.name}
                          </option>
                        ))}
                      </Form.Select>
                    </>
                  )}
                </div>

                <div className="d-flex align-items-center">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      getAlumni(1, term, prodiId);
                    }}
                  >
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Cari alumni..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                      />
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <i className="fas fa-search"></i>
                        )}
                      </Button>
                    </InputGroup>
                  </Form>
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="thead-light">
                    <tr>
                      <th>NIM</th>
                      <th>Nama</th>
                      <th>Prodi</th>
                      <th>Tanggal Ujian Akhir</th>
                      <th>Tempat Bertugas</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!alumni || alumni.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="d-flex flex-column align-items-center">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Tidak ada data alumni ditemukan</h5>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      alumni.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>
                            <Link to={`/alumni/biodata/${item.id}`} className="text-primary font-weight-bold text-decoration-none">
                              {item.username}
                            </Link>
                          </td>
                          <td>{item.name}</td>
                          <td>{item.biodata?.prodi?.name || "-"}</td>
                          <td>{item.ujian?.[0]?.tanggal_ujian || "-"}</td>
                          <td>{item.biodata?.tempat_bertugas || "-"}</td>
                          <td>
                            <Link to={`/alumni/biodata/${item.id}`} className="btn btn-sm btn-info">
                              <i className="fas fa-eye"></i> Detail
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>

            <Card.Footer className="bg-white">
              {total > 0 && (
                <CustomPagination
                  activePage={page}
                  itemsCountPerPage={10}
                  totalItemsCount={total}
                  onChange={(pageNumber) => getAlumni(pageNumber, term, prodiId)}
                  pageRangeDisplayed={5}
                />
              )}
            </Card.Footer>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Alumni;
