import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import baseurl from "../../../api/baseurl";

export default function ShowInformasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [informasi, setInformasi] = useState({
    topik: "",
    deskripsi: "",
    nama: "",
    nim: "",
    file: "",
  });
  const [respon, setRespon] = useState();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    await axios.put("/api/admin/layanan-informasi/" + id, {
      respon: respon,
    });
    setProcessing(false);
    toast.success("Berhasil update respon");
  };
  const getData = async () => {
    toast.loading("Mohon tunggu...");
    const res = await axios.get("/api/admin/layanan-informasi/" + id);
    setRespon(res.data.respon);
    console.log("res", res);
    setInformasi({
      topik: res.data.topik,
      deskripsi: res.data.deskripsi,
      name: res.data.user?.name,
      nim: res.data.user?.username,
      file: res.data.file,
    });
    toast.dismiss();
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Detail informasi</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Kembali
          </button>
        </div>
        <div className="section-body">
          <div className="card">
            <div className="card-body">
              <b>Nama : </b>
              <p>{informasi.name}</p>
              <b>Nim : </b>
              <p>{informasi.nim}</p>
              <b>Topik :</b>
              <p>{informasi.topik}</p>

              <b>Deskripsi</b>
              <p>{informasi.deskripsi}</p>

              <b>File Pendukung</b>
              {informasi.file && (
                <p>
                  <a
                    href={`${baseurl}/informasi/${informasi.file}`}
                    target="_blank"
                  >
                    <small>Lihat file pendukung</small>
                  </a>
                </p>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="" className="form-label">
                    Respon <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows="3"
                    value={respon ? respon : ""}
                    className="form-control h-100"
                    onChange={(e) => setRespon(e.target.value)}
                  ></textarea>
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={processing}
                >
                  Update Respon
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
