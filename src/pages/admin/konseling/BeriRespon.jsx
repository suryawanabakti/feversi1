import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "../../../api/axios";
import toast from "react-hot-toast";

export default function BeriRespon(props) {
  const [respon, setRespon] = useState(props.detailData.respon);
  const [processing, setProcessing] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    const tid = toast.loading("Mohon tunggu sebentar ....");
    try {
      await axios.put("/api/admin/layanan-pengaduan/" + props.detailData.id, {
        respon,
      });

      toast.success("berhasil memberi respon");
      const res = await axios.get(
        "/api/admin/layanan-konseling?page=" +
          props.konseling.activePage +
          "&term=" +
          props.term
      );
      props.setKonseling({
        total: res.data.total,
        data: res.data.data,
        activePage: res.data.current_page,
      });
      setRespon("");
      props.setShow(false);
    } catch (error) {
      console.log(error);
    }
    toast.dismiss(tid);
    setProcessing(false);
  };

  const handleClose = (e) => {
    props.setShow(false);
  };

  useEffect(() => {
    // setRespon(props.detailData.respon);
  }, [props.detailData.respon, props.show]);

  return (
    <Modal show={props.show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {props.detailData.nim} - {props.detailData.name}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-12">
              <h5>{props.detailData.topik}</h5>
              <small>{props.detailData.createdAt}</small>
              <p>{props.detailData.deskripsi}</p>
              {props.detailData.respon && (
                <>
                  <h6>Respon : </h6>
                  <p>{props.detailData.respon}</p>
                </>
              )}
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label htmlFor="">Respon</label>
                <textarea
                  onChange={(e) => setRespon(e.target.value)}
                  className="form-control h-100"
                  rows={3}
                  value={respon}
                  required
                ></textarea>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={processing}>
            Beri Respon
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
