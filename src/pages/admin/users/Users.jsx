import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import useAuthContext from "../../../context/AuthContext";
import axios from "../../../api/axios";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
export default function Users() {
  const { user } = useAuthContext();
  const options = { year: "numeric", month: "long", day: "numeric" };

  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/user-admin", {
        name,
        username,
        password,
      });
      console.log(res);
    } catch (err) {
      toast.error("gagal tambah");
      console.log(err);
    }
    getUserAdmin();
    handleClose();
  };

  const columns = [
    {
      field: "name",
      headerName: "Nama",
      width: 300,
    },
    {
      field: "username",
      headerName: "Username",
      width: 300,
    },
  ];

  const getUserAdmin = async () => {
    try {
      const res = await axios.get("/api/user-admin");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserAdmin();
  }, []);

  //   modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="main-content">
      {user.username == "surya@super" && (
        <section className="section">
          <div className="section-header">
            <h1>Admin</h1>
          </div>
          <div className="section-body">
            <Button variant="primary" onClick={handleShow}>
              Tambah Admin
            </Button>
            <Modal show={show} onHide={handleClose}>
              <form onSubmit={handleSave}>
                <Modal.Header closeButton>
                  <Modal.Title>Tambah Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="form-group">
                    <label htmlFor="">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Modal.Footer>
              </form>
            </Modal>

            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={data}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
