import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import { useNavigate, useParams } from "react-router-dom";

const ShowSpp = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [spp, setSpp] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const options = { year: "numeric", month: "long", day: "numeric" };

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
              href={`${baseurl}/storage/spp/${cellValues.row.spp}`}
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

  const getSpp = async () => {
    try {
      const res = await axios.get("/api/residen/spp/" + id);
      setSpp(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal Mengambil Data Spp");
    }
    setLoadingData(false);
  };

  const handleDeleteAll = async () => {
    const selectedIDs = new Set(pilihan);
    setLoading(true);
    try {
      await axios.post("/api/spp/delete-all", { pilihan });
      toast.success("Berhasil hapus spp yang dipilih");
      setSpp((r) => r.filter((x) => !selectedIDs.has(x.id)));
    } catch (err) {
      console.log(err);
      toast.error("Gagal hapus spp, spp sudah digunakan");
    }
    setLoading(false);
  };

  useEffect(() => {
    getSpp();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Spp</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          {loadingData ? (
            <>Loading...</>
          ) : spp.length !== 0 ? (
            <div className="card">
              <div className="card-header">
                <h4>Data SPP : {spp[0] ? spp[0].user.name : ""}</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div style={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={spp}
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
              Residen ini belum pernah mengupload SPP
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowSpp;
