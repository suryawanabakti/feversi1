import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import baseurl from "../../../api/baseurl";
import { useNavigate, useParams } from "react-router-dom";

const ShowAbstrak = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [abstrak, setAbstrak] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const options = { year: "numeric", month: "long", day: "numeric" };

  const columns = [
    { field: "semester", headerName: "Judul", width: 200 },
    { field: "jenis_publikasi", headerName: "Jenis", width: 200 },
    { field: "link", headerName: "Link", width: 200 },
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
              href={`${baseurl}/abstrak/${cellValues.row.abstrak}`}
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

  const getAbstrak = async () => {
    try {
      const res = await axios.get("/api/residen/abstrak/" + id);
      setAbstrak(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal Mengambil Data Abstrak");
    }
    setLoadingData(false);
  };

  useEffect(() => {
    getAbstrak();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Abstrak</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Kembali
          </button>
        </div>
        <div className="section-body">
          {loadingData ? (
            <>Loading...</>
          ) : abstrak.length !== 0 ? (
            <div className="card">
              <div className="card-header">
                <h4>Data Abstrak : {abstrak[0] ? abstrak[0].user.name : ""}</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div style={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={abstrak}
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
              Residen ini belum pernah mengupload Abstrak
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowAbstrak;
