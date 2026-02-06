import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../../api/axios";
import { Button, Modal, Spinner } from "react-bootstrap";
import useAuthContext from "../../context/AuthContext";

const ChangePassword = () => {
  const USERNAME_SSO = "adminsso";
  const SECRET_KEY_SSO = "Nrt796pr71";

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { user } = useAuthContext();
  const [newPassword, setNewPassword] = useState("");
  const [cofirmationPassword, setConfirmationPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [noWA, setNoWA] = useState(
    user.no_wa ? user.no_wa : user.biodata?.no_hp
  );

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      await axios.post("/api/change-password", {
        password: newPassword,
        password_confirmation: cofirmationPassword,
      });
      toast.success("berhasil ganti password");
      setNewPassword("");
      setConfirmationPassword("");
    } catch (err) {
      console.log(err);
      toast.error("gagal ganti password");
    }
    setLoading(false);
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch("/api/change-wa", {
        no_wa: noWA,
      });
      console.log(res);
      toast.success("Berhasil ganti no wa");
    } catch (e) {
      console.log(e);
    }
  };

  const [userSSO, setUserSSO] = useState([]);

  const getUserSSO = async () => {
    try {
      const res = await axios.get(
        "https://ssofk.surya-wanabakti.my.id/api/user-sso/" + user.username,
        {
          headers: {
            username: USERNAME_SSO,
            password: SECRET_KEY_SSO,
          },
        }
      );
      setUserSSO(res.data.data);
      console.log("res", res);
    } catch (e) {
      console.log("err", e);
    }
  };
  const [passwordSSO, setPasswordSSO] = useState("");
  const storeSSO = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://ssofk.surya-wanabakti.my.id/api/user-sso",
        {
          username: user.username,
          name: user.name,
          password: passwordSSO,
          headers: {
            username: USERNAME_SSO,
            password: SECRET_KEY_SSO,
          },
        }
      );
      alert("berhasil");
      console.log(res);
    } catch (err) {
      alert("gagal");
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUserSSO();
  }, []);
  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Setting</h1>
        </div>
        <div className="section-body">
          <div className="card">
            <div className="card-header">
              <h4>Ganti Password</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="">Password Baru</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="">Konfirmasi Password</label>
                      <input
                        type="password"
                        value={cofirmationPassword}
                        className="form-control"
                        onChange={(e) =>
                          setConfirmationPassword(e.target.value)
                        }
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          Loading...
                        </>
                      ) : (
                        "Ganti Password"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {user?.roles?.[0]?.name === "residen" && (
            <div className="card">
              <div className="card-header">
                <h4>NOMOR WA</h4>
              </div>
              <form onSubmit={handleSubmit2}>
                <div className="card-body">
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => setNoWA(e.target.value)}
                    value={noWA}
                  />
                </div>
                <div className="card-footer">
                  <button className="btn btn-primary" type="submit">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card" hidden>
            <div className="card-header">
              <h4>AKUN SSO</h4>
            </div>
            <div className="card-body">
              {userSSO.length === 0 ? (
                <div>
                  <>
                    Belum mempunyai akun sso <br />
                    <br />
                    <Button variant="primary" onClick={handleShow}>
                      Buat akun SSO
                    </Button>
                    <Modal show={show} onHide={handleClose}>
                      <Modal.Header closeButton>
                        <Modal.Title>Buat AKUN SSO</Modal.Title>
                      </Modal.Header>
                      <form action="">
                        <Modal.Body>
                          <div className="form-group">
                            <label htmlFor="">Username</label>
                            <input
                              type="text"
                              readOnly
                              value={user.username}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="">Password</label>
                            <input
                              type="text"
                              className="form-control"
                              onChange={(e) => setPasswordSSO(e.target.value)}
                            />
                          </div>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleClose}>
                            Close
                          </Button>
                          <Button
                            variant="primary"
                            type="button"
                            onClick={() => storeSSO()}
                          >
                            Save Changes
                          </Button>
                        </Modal.Footer>
                      </form>
                    </Modal>
                  </>
                </div>
              ) : (
                <>
                  <div>Nama: {userSSO.name}</div>
                  <div>Username: {userSSO.username}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChangePassword;
