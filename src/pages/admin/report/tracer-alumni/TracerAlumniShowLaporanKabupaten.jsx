import React, { useState, useEffect } from "react";
import axios from "../../../../api/axios";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { CustomPagination } from "../../../../components/custom-pagination";

const TracerAlumniShowLaporanKabupaten = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam] = useSearchParams();

  // Pagination states
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [term, setTerm] = useState("");

  const getData = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/tracer-alumni/laporan-kabupaten/${id}`,
        {
          params: {
            page: pageNumber,
            per_page: perPage,
            search: term,
            prodiId: searchParam.get("prodiId"),
            status: searchParam.get("status"),
          }
        }
      );
      setDatas(res.data.data);
      setTotal(res.data.meta.total);
      setPage(res.data.meta.current_page);
      setPerPage(res.data.meta.per_page);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const handlePageChange = (pageNumber) => {
    getData(pageNumber);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getData(1);
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header justify-content-between">
          <h1>
            Laporan Detail Alumni
            {searchParam.get("prodiId") ? ` - Prodi` : ""}
            {searchParam.get("status") ? ` - ${searchParam.get("status")}` : ""}
          </h1>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Kembali
          </button>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4>Daftar Alumni</h4>
                  <div className="card-header-form">
                    <form onSubmit={handleSearch}>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search"
                          value={term}
                          onChange={(e) => setTerm(e.target.value)}
                        />
                        <div className="input-group-btn">
                          <button className="btn btn-primary">
                            <i className="fas fa-search"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>NIM</th>
                          <th>Nama Alumni</th>
                          <th>Prodi</th>
                          <th>Tempat Bertugas</th>
                          <th>Tahun</th>
                          <th>Bulan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : datas.length > 0 ? (
                          datas.map((item, index) => (
                            <tr key={item.id}>
                              <td>{(page - 1) * perPage + index + 1}</td>
                              <td>
                                <Link to={`/alumni/biodata/${item.id}`}>
                                  {item.username}
                                </Link>
                              </td>
                              <td>{item.name}</td>
                              <td>{item.prodi}</td>
                              <td>{item.tempatBertugas}</td>
                              <td>{item.tahunLulus}</td>
                              <td>{item.bulanLulus}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Data tidak ditemukan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer text-right">
                  <div className="d-flex justify-content-center">
                    <CustomPagination
                      activePage={page}
                      itemsCountPerPage={perPage}
                      totalItemsCount={total}
                      pageRangeDisplayed={5}
                      onChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TracerAlumniShowLaporanKabupaten;
