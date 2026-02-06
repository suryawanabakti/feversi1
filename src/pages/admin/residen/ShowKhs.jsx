import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import baseurl from "../../../api/baseurl";
import { useNavigate, useParams } from "react-router-dom";

const ShowKhs = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [khs, setKhs] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const [formloading, setloadingform] = useState(true);

  const columns = [
    { field: "tahun", headerName: "Tahun", width: 200 },
    { field: "semester", headerName: "Semester", width: 200 },
    {
      field: "created_at",
      headerName: "Tanggal Upload",
      width: 200,
      renderCell: (cellValues) => {
        return new Date(cellValues.row.created_at).toLocaleDateString(
          undefined,
          options
        );
      },
    },
    {
      field: "id",
      headerName: "Aksi",
      width: 150,
      renderCell: (cellValues) => {
        const onClick = (e) => {
          e.stopPropagation();
        };
        return (
          <>
            <a
              href={`${baseurl}/storage/khs/${cellValues.row.khs}`}
              className="btn btn-primary"
              target="_blank"
            >
              <i className="fas fa-download"></i>
            </a>
          </>
        );
      },
    },
  ];

  const getKhs = async () => {
    try {
      const res = await axios.get("/api/residen/khs/" + id);
      setKhs(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal Mengambil Data Khs, harap refresh browser");
    }

    setloadingform(false);
  };

  const handleDeleteAll = async () => {
    const selectedIDs = new Set(pilihan);
    setLoading(true);
    try {
      await axios.post("/api/khs/delete-all", { pilihan });
      toast.success("Berhasil hapus khs yang dipilih");
      setKhs((r) => r.filter((x) => !selectedIDs.has(x.id)));
    } catch (err) {
      console.log(err);
      toast.error("Gagal hapus khs, khs sudah digunakan");
    }
    setLoading(false);
  };

  useEffect(() => {
    getKhs();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex  justify-content-between">
          <h1>Kartu Hasil Studi</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          {formloading ? (
            <>Loading ... </>
          ) : khs.length !== 0 ? (
            <div className="card">
              <div className="card-header">
                <h4>Data KHS : {khs[0] ? khs[0].user.name : ""}</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div style={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={khs}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-danger">
              Residen ini belum pernah mengupload KHS
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowKhs;
