import React, { useState } from "react";

export default function InformasiPengaduan() {
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
            Layanan Saran / Aduan merupakan wadah resmi yang disediakan oleh
            Pusat PPDS bagi mahasiswa PPDS dan Subspesialis yang ingin
            melaporkan permasalahan yang muncul selama mengikuti proses
            pendidikan di FK UNHAS. Ini adalah sarana yang sangat penting untuk
            mengumpulkan masukan demi meningkatkan kualitas proses pendidikan.
            Kami sangat menghargai informasi yang Anda sampaikan tanpa
            menimbulkan kerugian pada pihak terkait. Setiap laporan yang
            memenuhi syarat akan mendapatkan tindak lanjut sesuai dengan sifat
            masalah yang dihadapi.
          </p>

          <p>
            Proses penanganan aduan akan lebih efisien apabila laporan tersebut
            mencakup informasi terkait:
            <ol>
              <li>Lokasi Kejadian Masalah</li>
              <li>Waktu Kejadian Masalah</li>
              <li> Pihak yang terlibat.</li>                                               
              <li>Deskripsi lengkap mengenai kronologi terjadinya masalah.</li>
            </ol>
          </p> <br />
                 <a href="/code_conduct.pdf" target="_blank">Klik disini untuk lihat Code Of Conduct PPDS</a>
        </div>
      </div>
    </div>
  );
}
