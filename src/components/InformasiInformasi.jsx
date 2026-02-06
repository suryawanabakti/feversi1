import React, { useState } from "react";

export default function InformasiInformasi() {
  const [showInformation, setShowInformation] = useState(true);
  return (
    <div className="card">
      <div className="card-header">
        <h4>Penjelasan</h4>
        <div className="card-header-action">
          <button
            onClick={(e) => setShowInformation(!showInformation)}
            type="button"
            className="btn btn-icon btn-primary"
          >
            {showInformation ? (
              <i className="fas fa-minus" />
            ) : (
              <i className="fas fa-plus" />
            )}
          </button>
        </div>
      </div>
      <div
        className={`collapse ${showInformation ? "show" : ""}`}
        id="mycard-collapse"
        style={{}}
      >
        <div className="card-body">
          <p>
            {" "}
            Layanan Informasi merupakan wadah yang menyediakan informasi yang
            ingin ditanyakan oleh mahasiswa mengenai proses pendidikan Pusat
            Program Pendidikan Dokter Spesialis Fakultas Kedokteran Unhas.
            Setiap informasi yang dibutuhkan akan direspon sesuai dengan
            kebutuhan masing-masing.
          </p>
          <br />
          <a href="/code_conduct.pdf" target="_blank">Klik disini untuk lihat Code Of Conduct PPDS</a>
        </div>
      </div>
    </div>
  );
}
