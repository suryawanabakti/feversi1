import React, { useEffect } from "react";
import { useState } from "react";
import baseurl from "../../../api/baseurl";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import BeriRespon from "./BeriRespon";
import { Dropdown } from "react-bootstrap";

import { CustomPagination } from "../../../components/custom-pagination";
import InformasiKonseling from "../../../components/InformasiKonseling";

export default function Konseling() {
  const [show, setShow] = useState(false);
  const [term, setTerm] = useState("");
  const [detailData, setDetailData] = useState({
    id: "",
    file: "",
    status: "",
    topik: "",
    deskripsi: "",
    respon: "",
    name: "",
    nim: "",
    createdAt: "",
  });

  const handleClose = () => setShow(false);
  const handleShow = async (data) => {
    setDetailData({
      id: data.id,
      file: data.file,
      status: data.status,
      topik: data.topik,
      deskripsi: data.deskripsi,
      respon: data.respon,
      name: data.user.name,
      nim: data.user.username,
      createdAt: data.created_at,
    });
    console.log("res", data);

    setShow(true);
  };

  const [konseling, setKonseling] = useState({
    total: 0,
    activePage: 1,
    data: [],
  });
  const handlePageChange = async (pageNumber) => {
   await getData(pageNumber);
  };
  const getData = async (pageNumber = 1) => {
    toast.loading("Tunggu sebentar...");
    try {
      const res = await axios.get("/api/admin/layanan-konseling?page=" + pageNumber || "");
      setKonseling({
        total: res.data.total,
        data: res.data.data,
        activePage: res.data.current_page,
      });
    } catch (err) {
      console.log("err", err);
    }
    toast.dismiss();
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah anda yakin menghapus ?")) {
      toast.loading("Mohon tunggu sebentar");
      await axios.delete("/api/admin/layanan-konseling/" + id);
      toast.success("Berhasil hapus ");
      toast.dismiss();
      getData();
    }
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Layanan konseling</h1>
          <b>Total: {konseling.total}</b>
        </div>
        <div className="section-body">
          <InformasiKonseling />
          <div className="card">
            <div className="card-header">
              <h4>
                <select
                  className="form-select"
                  onChange={async (e) => {
                    toast.loading("Mohon tunggu...");
                    try {
                      const res = await axios.get(
                        "/api/admin/layanan-konseling?visible=" + e.target.value
                      );
                      setTerm("");
                      setKonseling({
                        total: res.data.total,
                        data: res.data.data,
                        activePage: res.data.current_page,
                      });
                    } catch (e) {
                      console.log(e);
                    }
                    toast.dismiss();
                  }}
                >
                  <option value="semua">Tampilkan Semua</option>
                  <option value="sudah">Sudah di respon</option>
                  <option value="belum">Belum di respon</option>
                </select>
              </h4>

              <div className="card-header-form">
                <form>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={(e) => setTerm(e.target.value)}
                    />
                    <div className="input-group-btn">
                      <button
                        className="btn btn-danger"
                        onClick={async (e) => {
                          e.preventDefault();
                          toast.loading("Mohon tunggu...");
                          try {
                            const res = await axios.get(
                              "/api/admin/layanan-konseling?page=" +
                                konseling.activePage +
                                "&term=" +
                                term
                            );
                            setKonseling({
                              total: res.data.total,
                              data: res.data.data,
                              activePage: res.data.current_page,
                            });
                          } catch (e) {
                            console.log(e);
                          }
                          toast.dismiss();
                        }}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-border table-striped">
                  <thead>
                    <tr>
                      <th>Residen</th>
                      <th>Topik</th>
                      <th>Deskripsi</th>
                      <th>Respon</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {konseling.data.map((data) => {
                      return (
                        <tr key={data.id}>
                          <td className="text-nowrap">
                            <table>
                              <tbody>
                                <tr>
                                  <td>
                                    {data.user.biodata?.pas_foto && (
                                      <img
                                        alt="image"
                                        src={`${baseurl}/pasfoto/${data.user?.biodata?.pas_foto}`}
                                        className="ml-2 "
                                        width="40px"
                                        style={{
                                          aspectRatio: "",
                                          objectFit: "cover",
                                        }}
                                        data-toggle="tooltip"
                                        title=""
                                        data-original-title="Wildan Ahdian"
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {data.user.name} <br />
                                    {data.user.username} <br />
                                    {data.user.biodata?.prodi?.name}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td className="text-nowrap">
                            {data.topik} <br />
                            {data.file && (
                              <a
                                href={`${baseurl}/konseling/${data.file}`}
                                target="_blank"
                              >
                                <small>Lihat file pendukung</small>
                              </a>
                            )}
                          </td>
                          <td className="text-wrap">{data.deskripsi}</td>
                          <td>{data.respon ? data.respon : "-"}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle
                                size="sm"
                                className="btn-icon"
                                variant="danger"
                              ></Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item
                                  href="#/action-1"
                                  onClick={() => handleShow(data)}
                                >
                                  Beri Respon
                                </Dropdown.Item>
                                <Dropdown.Item
                                  href="#/action-2"
                                  onClick={() => handleDelete(data.id)}
                                >
                                  Hapus
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="d-flex justify-content-center mt-4">
                            <CustomPagination
                                                                activePage={konseling.activePage}
                                                                itemsCountPerPage={10} // Assuming 10 items per page based on typical pagination
                                                                totalItemsCount={konseling.total}
                                                                pageRangeDisplayed={5}
                                                                onChange={handlePageChange}
                                                              />
                      </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BeriRespon
        show={show}
        setShow={setShow}
        handleClose={handleClose}
        detailData={detailData}
        setKonseling={setKonseling}
        konseling={konseling}
        term={term}
        getData={getData}
      />
    </div>
  );
}
