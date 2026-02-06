import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import baseurl from "../../../api/baseurl";

export default function EditInformasi() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [informasi, setInformasi] = useState({
    topik: "",
    deskripsi: "",
    file: "",
  });

  const [prevFile, setPrevFile] = useState({});
  const getData = async () => {
    const res = await axios.get("/api/residen/layanan-informasi/" + id);
    console.log(res);
    setInformasi({
      topik: res.data.topik,
      deskripsi: res.data.deskripsi,
      file: "",
    });
    setPrevFile(res.data?.file ? `${baseurl}/informasi/${res.data.file}` : {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("topik", informasi.topik);
      formData.append("deskripsi", informasi.deskripsi);
      informasi.file && formData.append("file", informasi.file);
      const res = await axios.post(
        `/api/residen/layanan-informasi/${id}/update`,
        informasi
      );
      toast.success("Berhasil tambah informasi");
    } catch (e) {
      console.log(e);
    }

    navigate("/residen-informasi");
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

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Edit informasi</h1>
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
                    Topik
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="topik"
                    placeholder="Masukkan topik..."
                    value={informasi.topik}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="" className="form-label">
                    Deskripsi
                  </label>
                  <textarea
                    required
                    type="text"
                    className="form-control h-100"
                    rows={3}
                    name="deskripsi"
                    placeholder="Masukkan deskripsi..."
                    value={informasi.deskripsi}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="" className="form-label">
                    File
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    name="file"
                    onChange={handleChange}
                  />

                  {prevFile.length > 0 && (
                    <a target="_blank" href={prevFile}>
                      Lihat File
                    </a>
                  )}
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary" type="submit">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
