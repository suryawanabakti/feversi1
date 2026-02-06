import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
export default function CreatePengaduan() {
  const navigate = useNavigate();
  const [pengaduan, setPengaduan] = useState({
    topik: "",
    deskripsi: "",
    file: "",
  });
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);
  const handleSubmit = async (e) => {
    setProcessing(true);
    toast.loading("Tunggu sebentar");
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("topik", pengaduan.topik);
      formData.append("deskripsi", pengaduan.deskripsi);
      pengaduan.file && formData.append("file", pengaduan.file);
      const res = await axios.post("/api/residen/layanan-pengaduan", formData);
      navigate("/residen-pengaduan");
    } catch (e) {
      setErrors(e.response.data.errors);
    }
    setProcessing(false);
    toast.success("Berhasil tambah pengaduan");
    toast.dismiss();
  };

  const handleChange = (e) => {
    let name = e.target.name;
    if (name === "file") {
      setPengaduan({
        ...pengaduan, // Copy the old fields
        file: e.target.files[0], // But override this one
      });
    } else if (name == "topik") {
      setPengaduan({
        ...pengaduan, // Copy the old fields
        topik: e.target.value, // But override this one
      });
    } else if (name === "deskripsi") {
      setPengaduan({
        ...pengaduan, // Copy the old fields
        deskripsi: e.target.value, // But override this one
      });
    }
  };
  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Tambah Pengaduan</h1>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>
        </div>
        <div className="section-body">
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="" className="form-label">
                    Topik <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="topik"
                    placeholder="Masukkan topik..."
                    value={pengaduan.topik}
                    onChange={handleChange}
                    required
                  />
                  {errors?.topik && (
                    <small className="text-danger">{errors?.topik}</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="deskripsi" className="form-label">
                    Deskripsi <span className="text-danger">*</span>
                  </label>
                  <br />
                  <textarea
                    id="deskripsi"
                    rows="3"
                    className="form-control h-100"
                    name="deskripsi"
                    placeholder="Masukkan deskripsi..."
                    value={pengaduan.deskripsi}
                    onChange={handleChange}
                  ></textarea>

                  {errors?.deskripsi && (
                    <small className="text-danger">{errors?.deskripsi}</small>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="" className="form-label">
                    File Pendukung
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    name="file"
                    onChange={handleChange}
                  />
                  {errors?.file && (
                    <small className="text-danger">{errors?.file}</small>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="checkbox"
                    id="pernyataan"
                    className="mr-1"
                    required
                  />
                  <label htmlFor="pernyataan">
                    Saya menyatakan bahwa pengaduan saya tulis benar adanya{" "}
                    <span className="text-danger">*</span>
                  </label>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-between">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={processing}
                >
                  Simpan
                </button>
                <Link to={"/residen-pengaduan"} className="btn btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
