import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "./bagan.css";

const structureData = [
  {
    jabatan: "Rektor",
    nama: "Prof. Dr. Ir. Jamaluddin Jompa, M.Sc",
    foto: "pemimpin.jpeg",
    children: [
      {
        jabatan: "Dekan",
        nama: "Prof. Dr. dr. Haerani Rasyid, M.Kes., Sp.PD-KGH., Sp.GK",
        foto: "dekan.jpg",
        children: [
          {
            jabatan: "KEPALA PUSAT PROGRAM PENDIDIKAN DOKTER SPESIALIS",
            nama: "Dr. dr. Andi Muh. Takdir Musba, Sp.An-KMN",
            foto: "tahir.jpeg",
          },
          {
            jabatan: "WAKIL DEKAN BIDANG AKADEMIK DAN KEMAHASISWAAN",
            nama: "dr. Agussalim Bukhari, M.Clin.Med, Ph.D,Sp.GK(K)",
            foto: "agus.jpg",
          },
          {
            jabatan: "WAKIL DEKAN BIDANG PERENCANAAN, SUMBER DAYA, DAN ALUMNI",
            nama: "dr. Firdaus Hamid, Ph.D, Sp.MK",
            foto: "firdaus.jpg",
          },
          {
            jabatan: "WAKIL DEKAN BIDANG KEMTIRAAN, RISET, DAN INOVASI",
            nama: "Dr. dr. Andi Alfian Zainuddin, M.KM",
            foto: "dr. alfian.jpg",
          },
          {
            jabatan: "WAKIL DEKAN BIDANG PUBLIKASI PENGABDIAN MASYARAKAT DAN URUSAN INTERNATIONAL",
            nama: "Dr. dr. Rina Masadah, SpPA(K), M. Phil",
            foto: "dr. rina masadah.jpg",
          },
          {
            jabatan: "GUGUS PENJAMINAN MUTU DAN PENINGKATAN REPUTASI",
            nama: "Dr. dr. Tenri Esa, M.Si, Sp.PK",
            foto: "asd.jpeg",
          },
        ],
      },
    ],
  },
];

const NodeContent = ({ item, handleShow }) => (
  <span
    onClick={(e) => handleShow(e, item.jabatan, item.nama, item.foto)}
    style={{ cursor: "pointer", lineHeight: "1.2" }}
  >
    <div className="d-flex flex-column align-items-center p-2">
      <strong className="mb-2 text-uppercase text-dark">{item.jabatan}</strong>
      <span className="text-dark">{item.nama}</span>
    </div>
  </span>
);

const TreeNode = ({ item, handleShow }) => (
  <li>
    <NodeContent item={item} handleShow={handleShow} />
    {item.children && item.children.length > 0 && (
      <ul>
        {item.children.map((child, index) => (
          <TreeNode key={index} item={child} handleShow={handleShow} />
        ))}
      </ul>
    )}
  </li>
);

export default function Bagan() {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState({
    nama: "",
    jabatan: "",
    foto: "",
  });

  const handleClose = () => setShow(false);

  const handleShow = (e, jabatan, nama, foto) => {
    e.preventDefault();
    setModalData({ jabatan, nama, foto });
    setShow(true);
  };

  return (
    <div className="main-content">
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-weight-bold w-100 text-center">
            {modalData.jabatan}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pt-0">
          <h5 className="mb-3">{modalData.nama}</h5>
          {modalData.foto ? (
            <img
              src={`/foto/${modalData.foto}`}
              className="img-fluid rounded shadow-sm"
              alt={modalData.nama}
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
          ) : (
            <p className="text-muted">Belum ada foto</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <button className="btn btn-secondary px-4" onClick={handleClose}>
            Tutup
          </button>
        </Modal.Footer>
      </Modal>

      <section className="section">
        <div className="section-header">
          <h1>Struktur Organisasi</h1>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body overflow-auto">
                  <div className="bagan-container">
                    <ul className="tree">
                      {structureData.map((item, index) => (
                        <TreeNode
                          key={index}
                          item={item}
                          handleShow={handleShow}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
