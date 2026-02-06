import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../../../context/AuthContext";

const CreateDosen = () => {
  const refNomorDosen = useRef();

  const refNip = useRef();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tempatKerjaLainnya, setTempatKerjaLainnya] = useState("");
  const [namaBank, setNamaBank] = useState("");

  const [alamat, setAlamat] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [nik, setNik] = useState("");
  const [nip, setNip] = useState("");
  const [golongan, setGolongan] = useState("");
  const [jabatanFungsional, setJabatanFungsional] = useState("");
  const [nomor, setNomor] = useState("");
  const [typeNomor, setTypeNomor] = useState("");
  const [npwp, setNpwp] = useState("");
  const [email, setEmail] = useState("");
  const [rumahSakit, setRumahsakit] = useState("");
  const [tempatKerja, setTempatKerja] = useState([]);
  const [skjabatan, setSkJabatan] = useState([]);
  const [tempat, setTempat] = useState("");
  const [ktp, setKtp] = useState();
  const [skpns, setSkpns] = useState();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [selectProdi, setSelectProdi] = useState([]);
  const handleClick = (e) => {
    e.preventDefault();
    setNip("-");
  };
  const handleChangeStatusDosen = (value) => {
    setTypeNomor(value);
    if (value == "dll") {
      setNomor("-");
      refNomorDosen.current.readOnly = true;
    } else {
      setNomor("");
      refNomorDosen.current.readOnly = false;
    }
  };

  const getRumahSakit = async () => {
    const res = await axios.get("/api/stase/get-rumahsakit");
    setRumahsakit(res.data.data);
  };

  const addTempatKerja = (rumah) => {
    setTempatKerja([...tempatKerja, rumah]);
  };

  const handleAddTempatKerjaLainnya = async (e) => {
    e.preventDefault();
    setTempatKerjaLainnya("");
    addTempatKerja({
      name: tempatKerjaLainnya,
    });
  };

  const handleAddTempatKerja = async (e) => {
    e.preventDefault();

    const kondisi = tempatKerja.filter((data) => data.id === tempat);

    if (kondisi.length > 0) {
      toast.error("Rumah sakit ini sudah di tambahkan");
      return false;
    }
    try {
      const res = await axios.get("/api/get-rumahsakit-by-id/" + tempat);
      addTempatKerja({
        id: res.data.id,
        name: res.data.name,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteTempatKerja = (ids) => {
    setTempatKerja((current) => current.filter((fruit) => fruit.id !== ids));
  };

  const handleSave = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("alamat", alamat);
    formData.append("nomorHp", nomorHp);
    tempatKerjaLainnya &&
      formData.append("tempatKerjaLainnya", JSON.stringify(tempatKerjaLainnya));
    formData.append("nomorRekening", nomorRekening);
    formData.append("namaBank", namaBank);
    formData.append("tanggalLahir", tanggalLahir);
    formData.append("nik", nik);
    formData.append("nip", nip);
    formData.append("golongan", golongan);
    formData.append("jabatanFungsional", jabatanFungsional);
    formData.append("nomor", nomor);
    formData.append("typeNomor", typeNomor);
    formData.append("npwp", npwp);
    formData.append("email", email);
    tempatKerja && formData.append("tempatKerja", JSON.stringify(tempatKerja));
    ktp && formData.append("ktp", ktp);
    skpns && formData.append("skpns", skpns);
    try {
      const res = await axios({
        method: "post",
        url: "/api/dosen",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Berhasil Menambah Dosen : " + name);
      setErrors([]);
      console.log(res);
      navigate("/dosen");
    } catch (err) {
      toast.error("Gagal Menambah Dosen");
      console.log(err);
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal menambah Dosen , koneksi bermasalah");
        alert("error akhir sesi berrakhir, segera reload browser");
        location.reload();
      }
      if (err.response) {
        if (err.response.status == 422) {
          toast.error(err.response.data.message);
          setErrors(err.response.data.errors);
        } else {
          alert("error akhir sesi berrakhir, segera reload browser");
          location.reload();
        }
      } else {
        alert("error akhir sesi berrakhir, segera reload browser");
        location.reload();
      }
    }
    setLoading(false);
  };

  const getProdi = async () => {
    const res = await axios.get("/api/biodata/get-prodi");
    setSelectProdi(res.data.data);
    console.warn(res);
  };

  useEffect(() => {
    getRumahSakit();
    getProdi();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Dosen</h1>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h4>Form Dosen</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSave}>
                    <div className="form-group">
                      <label htmlFor="">
                        Nama Lengkap <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setName(e.target.value)}
                      />
                      {errors.name && (
                        <div className="text-danger">{errors.name[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Prodi <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={user.prodi.name}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Alamat <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setAlamat(e.target.value)}
                      />
                      {errors.alamat && (
                        <div className="text-danger">{errors.alamat[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Nomor HP <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        onChange={(e) => setNomorHp(e.target.value)}
                      />
                      {errors.nomorHp && (
                        <div className="text-danger">{errors.nomorHp[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Nama Bank <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setNamaBank(e.target.value)}
                      />
                      {errors.namaBank && (
                        <div className="text-danger">{errors.namaBank[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Nomor Rekening <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        onChange={(e) => setNomorRekening(e.target.value)}
                      />
                      {errors.nomorRekening && (
                        <div className="text-danger">
                          {errors.nomorRekening[0]}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Jenis Kelamin <span className="text-danger">*</span>{" "}
                      </label>
                      <br />
                      <div className="selectgroup w-80">
                        <label className="selectgroup-item">
                          <input
                            type="radio"
                            name="value"
                            className="selectgroup-input"
                            onClick={(e) => setJenisKelamin("perempuan")}
                            defaultChecked
                            checked={jenisKelamin == "perempuan"}
                          />
                          <span className="selectgroup-button">Perempuan</span>
                        </label>
                        <label className="selectgroup-item">
                          <input
                            type="radio"
                            name="value"
                            onClick={(e) => setJenisKelamin("laki-laki")}
                            className="selectgroup-input"
                            checked={jenisKelamin === "laki-laki"}
                          />
                          <span className="selectgroup-button">
                            Laki - Laki
                          </span>
                        </label>
                      </div>
                      {errors.jenisKelamin && (
                        <div className="text-danger">
                          {errors.jenisKelamin[0]}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="">
                        Tanggal Lahir <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        onChange={(e) => setTanggalLahir(e.target.value)}
                      />
                      {errors.tanggalLahir && (
                        <div className="text-danger">
                          {errors.tanggalLahir[0]}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        NIK <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                     
                        onChange={(e) => setNik(e.target.value)}
                      />
                      {errors.nik && (
                        <div className="text-danger">{errors.nik[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        NIP <span className="text-danger">*</span>{" "}
                        <small className="">
                          jika belum memiliki nip beri{" "}
                          <a onClick={handleClick} href="#">
                            tanda ini (-)
                          </a>
                        </small>{" "}
                      </label>
                      <input
                        type="text"
                        ref={refNip}
                        className="form-control"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                      {errors.nip && (
                        <div className="text-danger">{errors.nip[0]}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="">
                        Golongan <span className="text-danger">*</span>{" "}
                      </label>
                      <select
                        name=""
                        className="form-control"
                        onChange={(e) => setGolongan(e.target.value)}
                        id=""
                      >
                        <option value="">PILIH GOLONGAN</option>
                        <option value="-">-</option>
                        <option value="IVe">Pembina Utama /IVe</option>
                        <option value="IVd">Pembina Utama Madya /IVd</option>
                        <option value="IVc">Pembina Utama Muda /IVc</option>
                        <option value="IVb">Pembina Tingkat I /IVb</option>
                        <option value="IVa">Pembina /IVa</option>
                        <option value="IIId">Penata Tingkat I / IIId </option>
                        <option value="IIIc">Penata / IIIc </option>
                        <option value="IIIb">
                          Penata Muda Tingkat I / IIIb{" "}
                        </option>
                        <option value="IIIa">Penata Muda / IIIa </option>
                      </select>

                      {errors.golongan && (
                        <div className="text-danger">{errors.golongan[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Jabatan Fungsional{" "}
                        <span className="text-danger">*</span>{" "}
                      </label>
                      <select
                        className="form-control"
                        onChange={(e) => setJabatanFungsional(e.target.value)}
                      >
                        <option value="">PILIH JABATAN FUNGSIONAL</option>
                        <option value="Asisten Ahli">Asisten Ahli</option>
                        <option value="Lektor">Lektor</option>
                        <option value="Lektor Kepala">Lektor Kepala</option>
                        <option value="Guru Besar">Guru Besar</option>
                        <option value="-">-</option>
                      </select>
                      {errors.jabatanFungsional && (
                        <div className="text-danger">
                          {errors.jabatanFungsional[0]}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="">
                        Status Dosen <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        onChange={(e) =>
                          handleChangeStatusDosen(e.target.value)
                        }
                      >
                        <option value="">Pilih Status Dosen</option>
                        <option value="nidn">NIDN</option>
                        <option value="nidk">NIDK</option>
                        <option value="nup">NUP</option>
                        <option value="dll">-</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Nomor Dosen <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control "
                        ref={refNomorDosen}
                        value={nomor}
                        onChange={(e) => setNomor(e.target.value)}
                      />
                      {errors.nomor && (
                        <div className="text-danger">{errors.nomor[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        NPWP <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control "
                        onChange={(e) => setNpwp(e.target.value)}
                      />
                      {errors.npwp && (
                        <div className="text-danger">{errors.npwp[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">
                        Email <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="email"
                        className="form-control "
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {errors.email && (
                        <div className="text-danger">{errors.email[0]}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="">KTP</label>
                      <input
                        type="file"
                        className="form-control "
                        onChange={(e) => setKtp(e.target.files[0])}
                      />
                      {errors.ktp && (
                        <div className="text-danger">{errors.ktp[0]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="">SK CPNS/PNS</label>
                      <input
                        type="file"
                        className="form-control "
                        onChange={(e) => setSkpns(e.target.files[0])}
                      />
                      {errors.skpns && (
                        <div className="text-danger">{errors.skpns[0]}</div>
                      )}
                    </div>

                    <div className="row"></div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="">
                            Tempat Kerja (Dari Data PPPDS)
                          </label>
                          <Select
                            className="mb-3"
                            options={rumahSakit}
                            onChange={({ value }) => setTempat(value)}
                          />
                        </div>

                        <button
                          className="btn btn-sm btn-primary mb-3"
                          type="button"
                          onClick={handleAddTempatKerja}
                        >
                          <i className="fas fa-plus"></i> Tambah Tempat Kerja
                        </button>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="">
                            Tempat Kerja Lainnya (Manual Input)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={tempatKerjaLainnya}
                            onChange={(e) =>
                              setTempatKerjaLainnya(e.target.value)
                            }
                          />
                        </div>

                        <button
                          className="btn btn-sm btn-primary mb-3"
                          type="button"
                          onClick={handleAddTempatKerjaLainnya}
                        >
                          <i className="fas fa-plus"></i> Tambah Tempat Kerja
                        </button>
                      </div>
                    </div>
                    <table className="table table-hover ">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama Tempat Kerja</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tempatKerja.map((data, index) => {
                          return (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{data.name}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteTempatKerja(data.id)
                                  }
                                  className="btn btn-danger"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {errors.tempatKerja && (
                      <div className="text-danger">{errors.tempatKerja[0]}</div>
                    )}

                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          {" "}
                          <Spinner
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />{" "}
                          Loading...
                        </>
                      ) : (
                        "Simpan"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateDosen;
