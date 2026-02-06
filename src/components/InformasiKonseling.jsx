import React, { useState } from "react";

export default function InformasiKonseling() {
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
            MPPDS Careline adalah layanan konseling yang diselenggarakan oleh
            Pusat PPDS FK UNHAS sebagai upaya untuk meningkatkan kesejahteraan
            mental dan mendukung MPPDS dan Subspesialis dalam mencapai
            keseimbangan antara kehidupan pribadi dan akademis selama proses
            pendidikan di FK UNHAS. Layanan bersifat rahasia dan non-judgmental,
            menjadi tempat yang aman bagi mahasiswa untuk mencari dukungan
            konseling.
          </p>
        </div>
      </div>
    </div>
  );
}
