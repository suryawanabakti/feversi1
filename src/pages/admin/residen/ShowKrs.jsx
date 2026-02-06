import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import { useNavigate, useParams } from "react-router-dom";

const ShowKrs = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [krs, setKrs] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const [loadingData, setLoadingData] = useState(true);

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
              href={`${baseurl}/storage/krs/${cellValues.row.krs}`}
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

  const getKrs = async () => {
    try {
      const res = await axios.get("/api/residen/krs/" + id);
      setKrs(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal Mengambil Data Krs");
    }
    setLoadingData(false);
  };

  const handleDeleteAll = async () => {
    const selectedIDs = new Set(pilihan);
    setLoading(true);
    try {
      await axios.post("/api/krs/delete-all", { pilihan });
      toast.success("Berhasil hapus krs yang dipilih");
      setKrs((r) => r.filter((x) => !selectedIDs.has(x.id)));
    } catch (err) {
      console.log(err);
      toast.error("Gagal hapus krs, krs sudah digunakan");
    }
    setLoading(false);
  };

  useEffect(() => {
    getKrs();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Kartu Rencana Studi</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          {loadingData ? (
            <>Loading...</>
          ) : krs.length !== 0 ? (
            <div className="card">
              <div className="card-header">
                <h4>Data KRS : {krs[0] ? krs[0].user.name : ""}</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div style={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={krs}
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
              Residen ini belum mengupload krs
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowKrs;
