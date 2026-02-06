import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../../../api/axios";
import { CustomPagination } from "../../../../components/custom-pagination";

export default function ShowLaporanDosen() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [dosens, setDosens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [term, setTerm] = useState("");

  const getData = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/laporan-dosen/${type}`, {
        params: {
          page: pageNumber,
          per_page: perPage,
          search: term,
        },
      });
      setDosens(res.data.data);
      setTotal(res.data.meta.total);
      setPage(res.data.meta.current_page);
      setPerPage(res.data.meta.per_page);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [type]);

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
          <h1 className="text-capitalize">Dosen {type}</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4>Daftar Dosen</h4>
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
                          <th>Nomor</th>
                          <th>Nama Dosen</th>
                          <th>Jenis Kelamin</th>
                          <th>Jabatan Fungsional</th>
                          <th>Golongan</th>
                          <th>Prodi</th>
                          <th>Nomor HP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : dosens.length > 0 ? (
                          dosens.map((item, index) => (
                            <tr key={item.id}>
                              <td>{(page - 1) * perPage + index + 1}</td>
                              <td>
                                <Link
                                  to={`/dosen/show/${item.id}`}
                                  className="text-decoration-none"
                                >
                                  {item.name}
                                </Link>
                              </td>
                              <td>{item.jenis_kelamin}</td>
                              <td>{item.jabatan_fungsional}</td>
                              <td>{item.golongan}</td>
                              <td>{item.prodi?.name}</td>
                              <td>{item.no_hp}</td>
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
