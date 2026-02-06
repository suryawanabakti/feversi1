import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../../../context/AuthContext";
import { useParams } from "react-router-dom";
import baseurl from "../../../api/baseurl";

const ShowDosen = () => {
  const refNomorDosen = useRef();

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tempatKerjaLainnya, setTempatKerjaLainnya] = useState("");
  const [loading, setLoading] = useState(false);

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
      refNomorDosen.current.value = "";
      refNomorDosen.current.readOnly = false;
    }
  };
  const handleAddTempatKerjaLainnya = async (e) => {
    e.preventDefault();
    setTempatKerjaLainnya("");
    addTempatKerja({
      name: tempatKerjaLainnya,
    });
  };

  const [alamat, setAlamat] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [namaBank, setNamaBank] = useState("");
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
  const [tempat, setTempat] = useState("");
  const [ktp, setKtp] = useState();
  const [ktpPrev, setKtpPrev] = useState("");
  const [skpns, setSkpns] = useState();
  const [skpnsPrev, setSkpnsPrev] = useState("");

  const [prodi, setProdi] = useState("");

  const [errors, setErrors] = useState([]);
  const [selectProdi, setSelectProdi] = useState([]);

  const getRumahSakit = async () => {
    const res = await axios.get("/api/stase/get-rumahsakit");
    setRumahsakit(res.data.data);
  };

  const addTempatKerja = (rumah) => {
    setTempatKerja([...tempatKerja, rumah]);
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
    jabatanFungsional &&
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
        url: "/api/dosen-update/" + id,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Berhasil mengubah data Dosen : " + name);
      setErrors([]);
      console.log(res);
      setKtpPrev(res.data.ktp);
      setSkpnsPrev(res.data.sk_pns);
      // navigate("/dosen");
    } catch (err) {
      toast.error("Gagal mengubah data Dosen");
      console.log(err);
      if (err.code == "ERR_NETWORK") {
        toast.error("Gagal mengubah data Dosen , koneksi bermasalah");
      }
      if (err.response) {
        if (err.response.status == 422) {
          setErrors(err.response.data.errors);
        }
      }
    }
    setLoading(false);
  };

  const getProdi = async () => {
    const res = await axios.get("/api/biodata/get-prodi");
    setSelectProdi(res.data.data);
    console.warn(res);
  };
  const [idDosen, setIdDosen] = useState("");
  const getDosen = async () => {
    setLoading(true);
    const tid = toast.loading("Tunggu Sebentar ... ");
    try {
      const res = await axios.get("/api/dosen/" + id);
      console.log(res);
      console.log(res);
      const data = res.data.data;
      console.log(data);
      setIdDosen(data.id);
      setName(data.name);
      setAlamat(data.alamat);
      setNomorHp(data.no_hp);
      setNomorRekening(data.no_rekening);
      setNamaBank(data.nama_bank);
      setJenisKelamin(data.jenis_kelamin);
      setTanggalLahir(data.tanggal_lahir);
      setNik(data.nik);
      setNip(data.nip);
      setGolongan(data.golongan);
      setJabatanFungsional(data.jabatan_fungsional);
      setNomor(data.nomor);
      setTypeNomor(data.type_nomor);
      setNpwp(data.npwp);
      setEmail(data.email);
      setTempatKerja(data.tempat_kerja || []);
      setProdi(data.prodi?.name || "");
      data.ktp && setKtpPrev(data.ktp);
      data.sk_pns && setSkpnsPrev(data.sk_pns);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
    toast.remove(tid);
  };

  useEffect(() => {
    getRumahSakit();
    getProdi();
    getDosen();
  }, []);
  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Dosen</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-md-12">
              <Link
                to={`/dosen/sk-jabatan/${id}`}
                className="btn btn-primary mt-2 float-right mb-2"
              >
                Lihat SK Jabatan
              </Link>
            </div>
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h4>Form Dosen</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-md">
                      <tbody>
                        <tr>
                          <th width="200">Nama Lengkap</th>
                          <td>{name}</td>
                        </tr>
                        <tr>
                          <th>Prodi</th>
                          <td>{user.prodi ? user.prodi.name : prodi}</td>
                        </tr>
                        <tr>
                          <th>Alamat</th>
                          <td>{alamat || "-"}</td>
                        </tr>
                        <tr>
                          <th>Nomor HP</th>
                          <td>{nomorHp || "-"}</td>
                        </tr>
                        <tr>
                          <th>Nama Bank</th>
                          <td>{namaBank || "-"}</td>
                        </tr>
                        <tr>
                          <th>Nomor Rekening</th>
                          <td>{nomorRekening || "-"}</td>
                        </tr>
                        <tr>
                          <th>Jenis Kelamin</th>
                          <td>{jenisKelamin || "-"}</td>
                        </tr>
                        <tr>
                          <th>Tanggal Lahir</th>
                          <td>{tanggalLahir || "-"}</td>
                        </tr>
                        <tr>
                          <th>NIK</th>
                          <td>{nik || "-"}</td>
                        </tr>
                        <tr>
                          <th>NIP</th>
                          <td>{nip || "-"}</td>
                        </tr>
                        <tr>
                          <th>Golongan</th>
                          <td>{golongan || "-"}</td>
                        </tr>
                        <tr>
                          <th>Jabatan Fungsional</th>
                          <td>{jabatanFungsional || "-"}</td>
                        </tr>
                        <tr>
                          <th>Status Dosen</th>
                          <td>{typeNomor ? typeNomor.toUpperCase() : "-"}</td>
                        </tr>
                        <tr>
                          <th>Nomor Dosen</th>
                          <td>{nomor || "-"}</td>
                        </tr>
                        <tr>
                          <th>NPWP</th>
                          <td>{npwp || "-"}</td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>{email || "-"}</td>
                        </tr>
                        <tr>
                          <th>KTP</th>
                          <td>
                            {ktpPrev ? (
                              <a
                                target="_blank"
                                href={`${baseurl}/storage/${ktpPrev}`}
                                className="btn btn-sm btn-info"
                              >
                                <i className="fas fa-eye mr-1"></i> Lihat KTP
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>SK CPNS/PNS</th>
                          <td>
                            {skpnsPrev ? (
                              <a
                                target="_blank"
                                href={`${baseurl}/storage/${skpnsPrev}`}
                                className="btn btn-sm btn-info"
                              >
                                <i className="fas fa-eye mr-1"></i> Lihat SK
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>Tempat Kerja</th>
                          <td>
                            {tempatKerja.length > 0 ? (
                              <ul className="pl-3 mb-0">
                                {tempatKerja.map((tk, index) => (
                                  <li key={index}>{tk.name}</li>
                                ))}
                              </ul>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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

export default ShowDosen;
