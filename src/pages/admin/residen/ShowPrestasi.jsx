import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import { useNavigate, useParams } from "react-router-dom";

const ShowPrestasi = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [prestasi, setPrestasi] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const options = { year: "numeric", month: "long", day: "numeric" };

  const columns = [
    { field: "type", headerName: "Tipe", width: 200 },
    { field: "name", headerName: "Nama", width: 200 },
    { field: "tahun", headerName: "Tahun", width: 200 },
    {
      field: "created_at",
      headerName: "Tanggal Upload",
      width: 180,
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
              href={`${baseurl}/prestasi/${cellValues.row.prestasi}`}
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

  const getPrestasi = async () => {
    try {
      const res = await axios.get("/api/residen/prestasi/" + id);
      setPrestasi(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal Mengambil Data Prestasi");
    }
    setLoadingData(false);
  };

  useEffect(() => {
    getPrestasi();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Prestasi</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          {loadingData ? (
            <>Loading...</>
          ) : prestasi.length !== 0 ? (
            <div className="card">
              <div className="card-header">
                <h4>
                  Data Prestasi : {prestasi[0] ? prestasi[0].user.name : ""}
                </h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div style={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={prestasi}
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
              Residen ini belum pernah mengupload Prestasi
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowPrestasi;
