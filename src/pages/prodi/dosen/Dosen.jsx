"use client";

import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import {
  Button,
  Spinner,
  Badge,
  Card,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import useAuthContext from "../../../context/AuthContext";
import { CustomPagination } from "../../../components/custom-pagination";
import { DeleteConfirmationDialog } from "../../../components/delete-confimation-dialog";
import "./dosen-style.css";

const Dosen = () => {
  const { user } = useAuthContext();
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [dosen, setDosen] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [namaProdi, setNamaProdi] = useState("");
  const [prodi, setProdi] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const getProdi = async () => {
    try {
      const res = await axios.get("/api/prodi-options");
      setProdi(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal mengambil Data Prodi");
    }
  };

  const getDosen = async (
    pageNumber = page,
    searchTerm = term,
    prodiFilter = namaProdi
  ) => {
    setIsSearching(true);
    const toastId = toast.loading("Mohon tunggu, Sedang memuat data ...");
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (pageNumber) params.append('page', pageNumber);
      if (prodiFilter && prodiFilter !== 'semua') params.append('prodi_id', prodiFilter);

      const res = await axios.get(`/api/dosen?${params.toString()}`);

      // Handle paginated response
      const responseData = res.data;

      if (responseData.data && Array.isArray(responseData.data)) {
        setDosen(responseData.data);

        // Handle pagination metadata
        // For ResourceCollection, meta is usually inside 'meta' key
        // For basic Paginator, it's at root level
        const meta = responseData.meta || responseData;

        if (meta.current_page) {
          setPage(meta.current_page);
          setTotal(meta.total);
        }
      } else {
        // Fallback
        setDosen(responseData);
        setTotal(responseData.length || 0);
      }
    } catch (err) {
      console.log("@error", err);
      toast.error("Gagal Mengambil Data Dosen, Jaringan Bermasalah");
    }
    toast.dismiss(toastId);
    setLoading(false);
    setIsSearching(false);
  };

  // Export function with authentication
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (namaProdi && namaProdi !== 'semua') {
        params.append('prodi_id', namaProdi);
      }

      const response = await axios.get(
        `/api/dosen/export?${params.toString()}`,
        {
          responseType: "blob", // Important for file download
        }
      );

      // Create URL for downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `dosen-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil, file sedang didownload");
    } catch (err) {
      console.log(err);
      toast.error("Gagal export data");
    }
    setExportLoading(false);
  };

  const handleCheck = (event, row) => {
    if (event.target.checked) {
      setPilihan([...pilihan, row]);
    } else {
      setPilihan(pilihan.filter((selectedRow) => selectedRow.id !== row.id));
    }
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    setPilihan(e.target.checked ? [...dosen] : []);
  };

  const confirmDeleteDosen = async () => {
    setLoading(true);
    try {
      // Extract IDs from selected dosen
      const ids = pilihan.map(d => d.id);

      await axios.post("/api/dosen/delete-bulk", { ids });
      toast.success(`Berhasil menghapus ${pilihan.length} dosen yang dipilih`);
      setPilihan([]);
      setSelectAll(false);
      getDosen();
    } catch (err) {
      console.log(err);
      toast.error("Gagal hapus dosen, dosen sudah digunakan");
    }
    setLoading(false);
    setConfirmDeleteOpen(false);
  };

  const handleChangeFilter = async (value) => {
    setNamaProdi(value);
    await getDosen(1, term, value);
  };

  useEffect(() => {
    getDosen();
    user.roles[0].name === "admin" && getProdi();
  }, []);

  const isAdmin = user.roles[0].name === "admin";
  const isProdi = user.roles[0].name === "prodi";

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="mr-3">Dosen</h1>
            <Badge bg="primary" className="p-2">
              Total: {total}
            </Badge>
          </div>
          {isProdi && (
            <div>
              <Link to="/dosen/create" className="btn btn-primary">
                <i className="fas fa-plus-circle mr-1"></i> Tambah Dosen
              </Link>
            </div>
          )}
        </div>
        <div className="section-body">
          <Card>
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
                <div className="d-flex mb-2 mb-md-0">
                  {(isProdi || isAdmin) && (
                    <Button
                      variant="success"
                      className="mr-2"
                      onClick={handleExport}
                      disabled={exportLoading}
                    >
                      {exportLoading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="mr-1"
                          />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-excel mr-1"></i> Export
                          Excel
                        </>
                      )}
                    </Button>
                  )}

                  {isAdmin && (
                    <Form.Select
                      className="mr-2"
                      style={{ width: "200px" }}
                      value={namaProdi}
                      onChange={(e) => handleChangeFilter(e.target.value)}
                    >
                      <option value="semua">Semua Prodi</option>
                      {prodi.map((data, index) => (
                        <option value={data.id} key={index}>
                          {data.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </div>
                <div className="d-flex align-items-center">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      getDosen(1, term, namaProdi);
                    }}
                  >
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Cari dosen..."
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
                  {pilihan.length > 0 && isProdi && (
                    <Button
                      variant="danger"
                      className="ml-2"
                      onClick={() => setConfirmDeleteOpen(true)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <i className="fas fa-trash mr-1"></i>
                          Hapus ({pilihan.length})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="thead-light">
                    <tr>
                      {isProdi && (
                        <th width="40">
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th>Nama Dosen</th>
                      <th>Status Dosen</th>
                      <th>Nomor Dosen</th>
                      <th>Jabatan Fungsional</th>
                      <th>Golongan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!dosen || dosen.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isProdi ? 7 : 6}
                          className="text-center py-4"
                        >
                          <div className="d-flex flex-column align-items-center">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">
                              Tidak ada data dosen ditemukan
                            </h5>
                            {term && (
                              <p className="text-muted">
                                Tidak ada hasil untuk pencarian "{term}"
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dosen.map((data) => (
                        <tr key={data.id}>
                          {isProdi && (
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={
                                  pilihan.some((item) => item.id === data.id) ||
                                  selectAll
                                }
                                onChange={(e) => handleCheck(e, data)}
                                value={data.id}
                              />
                            </td>
                          )}
                          <td>
                            <Link
                              to={`/dosen/show/${data.id}`}
                              className="font-weight-bold text-decoration-none"
                            >
                              {data.name}
                            </Link>
                          </td>
                          <td>
                            <Badge
                              bg={
                                data.type_nomor === "NIDN" ? "success" : "info"
                              }
                              className="p-2"
                            >
                              {data.type_nomor}
                            </Badge>
                          </td>
                          <td>{data.nomor}</td>
                          <td>{data.jabatan_fungsional || "-"}</td>
                          <td>{data.golongan || "-"}</td>
                          <td>
                            <div className="d-flex">
                              <Link
                                to={`/dosen/show/${data.id}`}
                                className="btn btn-sm btn-info mr-1"
                                title="Lihat Detail"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <Link
                                to={`/dosen/sk-jabatan/${data.id}`}
                                className="btn btn-sm btn-primary"
                                title="SK Jabatan"
                              >
                                <i className="fas fa-file-alt"></i>
                              </Link>
                            </div>
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
                  onChange={(pageNumber) =>
                    getDosen(pageNumber, term, namaProdi)
                  }
                  pageRangeDisplayed={5}
                />
              )}
            </Card.Footer>
          </Card>
        </div>
      </section>

      <DeleteConfirmationDialog
        isOpen={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDeleteDosen}
        title="Konfirmasi Penghapusan Dosen"
        description={`Apakah Anda yakin ingin menghapus ${pilihan.length} data dosen yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={loading}
      />
    </div>
  );
};

export default Dosen;
