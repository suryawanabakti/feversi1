import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
export default function CreateInformasi() {
  const navigate = useNavigate();
  const [informasi, setInformasi] = useState({
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
      formData.append("topik", informasi.topik);
      formData.append("deskripsi", informasi.deskripsi);
      informasi.file && formData.append("file", informasi.file);
      const res = await axios.post("/api/residen/layanan-informasi", formData);
      navigate("/residen-informasi");
    } catch (e) {
      setErrors(e.response.data.errors);
    }
    setProcessing(false);
    toast.success("Berhasil tambah informasi");
    toast.dismiss();
  };

  const handleChange = (e) => {
    let name = e.target.name;
    if (name === "file") {
      setInformasi({
        ...informasi, // Copy the old fields
        file: e.target.files[0], // But override this one
      });
    } else if (name == "topik") {
      setInformasi({
        ...informasi, // Copy the old fields
        topik: e.target.value, // But override this one
      });
    } else if (name === "deskripsi") {
      setInformasi({
        ...informasi, // Copy the old fields
        deskripsi: e.target.value, // But override this one
      });
    }
  };
  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Tambah informasi</h1>
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
                  <label htmlFor="topik" className="form-label">
                    Topik <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="topik"
                    placeholder="Masukkan topik..."
                    value={informasi.topik}
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
                    value={informasi.deskripsi}
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
              </div>
              <div className="card-footer d-flex justify-content-between">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={processing}
                >
                  Simpan
                </button>
                <Link to={"/residen-informasi"} className="btn btn-secondary">
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
