import React, { useState, useEffect } from "react";
import axios from "../../../../api/axios";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { toast } from "react-hot-toast";
import useAuthContext from "../../../../context/AuthContext";

const TracerAlumniLaporanKabupaten = () => {
  const { user } = useAuthContext();

  const [prodi, setProdi] = useState([]);
  const [datas, setDatas] = useState([]);
  const [prodiId, setProdiId] = useState("");
  const [status, setStatus] = useState("");

  // Fetch data program studi
  const fetchProdi = async () => {
    try {
      const response = await axios.get("/api/prodi");
      setProdi(response.data.data || []);
    } catch (error) {
      console.error("Error fetching prodi:", error);
    }
  };

  // Fetch data laporan kabupaten
  const fetchLaporanKabupaten = async (prodiIdParam = "", statusParam = "") => {
    const toastId = toast.loading("Mohon tunggu, sedang memuat data...");

    try {
      const params = new URLSearchParams();
      if (prodiIdParam) params.append("prodiId", prodiIdParam);
      if (statusParam) params.append("status", statusParam);

      const queryString = params.toString();
      const url = `/api/tracer-alumni/laporan-kabupaten${queryString ? `?${queryString}` : ""
        }`;

      const response = await axios.get(url);
      setDatas(response.data);
    } catch (error) {
      console.error("Error fetching laporan kabupaten:", error);
      toast.error("Gagal memuat data");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Handle perubahan prodi
  const handleProdiChange = (id) => {
    setProdiId(id);
    fetchLaporanKabupaten(id, status);
  };

  // Handle perubahan status
  const handleStatusChange = (value) => {
    setStatus(value);
    fetchLaporanKabupaten(prodiId, value);
  };

  // Columns untuk DataGrid
  const columns = [
    {
      field: "nama",
      headerName: "Nama Kabupaten / Kota",
      width: 400,
      renderCell: (params) => (
        <Link to={`/report-tracer-alumni/${params.row.id}?prodiId=${prodiId}`}>
          {params.row.nama}
        </Link>
      ),
    },
    {
      field: "totalResiden",
      headerName: "Total Alumni",
      width: 400,
    },
  ];

  // Inisialisasi data
  useEffect(() => {
    fetchProdi();
    fetchLaporanKabupaten();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1>Tracer Alumni</h1>
          <p>Alumni yang sudah menginput Tempat Bertugas</p>
        </div>
        <div className="section-body">
          {/* Filter untuk admin */}
          {user?.roles?.[0]?.name === "admin" && (
            <div className="row mb-3">
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={prodiId}
                  onChange={(e) => handleProdiChange(e.target.value)}
                >
                  <option value="">Semua Prodi</option>
                  {prodi.map((item) => (
                    <option key={item.prodi.id} value={item.prodi.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Peta */}
          <div className="row mb-4">
            <div className="col-md-12">
              <MapContainer
                center={[-0.789275, 113.921327]}
                zoom={5}
                scrollWheelZoom={false}
                attributionControl={false}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {datas.map((data) => (
                  <Marker
                    key={data.id}
                    position={[data.latitude, data.longitude]}
                  >
                    <Popup>
                      <b>
                        <Link
                          to={`/report-tracer-alumni/${data.id}?prodiId=${prodiId}&status=${status}`}
                        >
                          {data.nama}
                        </Link>
                      </b>
                      <br />
                      Total Alumni: {data.totalResiden}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Tabel Data */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                      rows={datas}
                      columns={columns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      disableSelectionOnClick
                      disableColumnFilter
                      disableColumnSelector
                      disableDensitySelector
                      components={{ Toolbar: GridToolbar }}
                      componentsProps={{
                        toolbar: {
                          showQuickFilter: true,
                          quickFilterProps: { debounceMs: 500 },
                        },
                      }}
                    />
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

export default TracerAlumniLaporanKabupaten;
