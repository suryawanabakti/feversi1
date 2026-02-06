import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Button, Modal } from "react-bootstrap";
export default function Index() {
  const [kabupaten, setKabupaten] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const columns = [
    { field: "nama", headerName: "Nama Kabupaten", width: 400 },
    { field: "latitude", headerName: "Latitude", width: 150 },
    { field: "longitude", headerName: "Longitude", width: 150 },
    {
      field: "id",
      headerName: "Aksi",
      width: 200,
      renderCell: (cellValues) => {
        return (
          <Button
            variant="primary"
            title="Ubah"
            onClick={(e) => handleShowEdt(cellValues.row.id)}
          >
            <i className="fas fa-pen"></i>
          </Button>
        );
      },
    },
  ];

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [idKabupaten, setIdKabupaten] = useState("");

  const handleShowEdt = async (id) => {
    setIdKabupaten("");
    try {
      const res = await axios.get("/api/ref/get-kabupaten-by-id/" + id);
      setLatitude(res.data.latitude);
      setLongitude(res.data.longitude);
      setIdKabupaten(res.data.id);
    } catch (err) {
      toast.error("gagal ambil data kabupaten");
    }

    handleShow();
  };

  const handleUpdate = async (id) => {
    try {
      const res = await axios.post("/api/kabupaten-update/" + id, {
        latitude,
        longitude,
      });
      getKabupaten();
    } catch (err) {
      toast.error("gagal simpan data kabupaten");
      console.log(err);
    }
    setShow(false);
  };

  const getKabupaten = async () => {
    try {
      const res = await axios.get("/api/ref/kabupaten");
      setKabupaten(res.data);
    } catch (err) {
      toast.error("gagal ambil data kabupaten");
    }
  };

  useEffect(() => {
    getKabupaten();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Kabupaten</h1>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-md-12">
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={kabupaten}
                  columns={columns}
                  pageSize={5}
                  disableSelectionOnClick
                  rowsPerPageOptions={[5]}
                  checkboxSelection
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="">Latitude</label>
            <input
              type="text"
              className="form-control"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="">Longitude</label>
            <input
              type="text"
              className="form-control"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleUpdate(idKabupaten)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
