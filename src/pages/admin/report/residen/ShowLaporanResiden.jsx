import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../api/axios";
import { CustomPagination } from "../../../../components/custom-pagination";

export default function ShowLaporanResiden() {
  const { statusPembiayaan, prodiId } = useParams();
  const [residen, setResiden] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [term, setTerm] = useState("");

  const getData = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/laporan-residen/${statusPembiayaan}/${prodiId}`,
        {
          params: {
            page: pageNumber,
            per_page: perPage,
            search: term,
          },
        }
      );
      setResiden(res.data.data);
      setTotal(res.data.total);
      setPage(res.data.current_page);
      setPerPage(res.data.per_page);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [statusPembiayaan, prodiId]);

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
            Laporan Residen {statusPembiayaan} {prodiId != "semua" && prodiId}
          </h1>
          <Link to="/report-residen" className="btn btn-primary">
            Kembali
          </Link>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4>Daftar Residen</h4>
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
                          <th>Nama</th>
                          <th>Username</th>
                          <th>Prodi</th>
                          <th>Provinsi</th>
                          <th>Kabupaten</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : residen.length > 0 ? (
                          residen.map((item, index) => (
                            <tr key={item.id}>
                              <td>{(page - 1) * perPage + index + 1}</td>
                              <td>{item.name}</td>
                              <td>{item.username}</td>
                              <td>{item.prodi}</td>
                              <td>{item.provinsi || "-"}</td>
                              <td>{item.kabupaten || "-"}</td>
                              <td>
                                <Link
                                  to={`/report-provinsi/${item.provinsi || "unknown"}/residen/${item.id}`}
                                  className="btn btn-info btn-sm"
                                >
                                  Detail
                                </Link>
                              </td>
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
}
