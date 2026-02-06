import React, { useState } from "react";

const Proposal = () => {
  const [selectedImage, setSelectedImage] = useState();

  const imageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage();
  };

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header">
          <h1>Proposal</h1>
        </div>
        <div className="section-body">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="">Tanggal </label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="">Judul</label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="">Proposal</label>
                  <input type="file" className="form-control" />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="">Bukti Pembayaran</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={imageChange}
                  />
                  {selectedImage && (
                    <div>
                      <img
                        width={100}
                        src={URL.createObjectURL(selectedImage)}
                        alt="Thumb"
                      />
                      <button onClick={removeSelectedImage}>
                        Remove This Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button className="btn btn-warning">Batal</button>
              <button className="btn btn-primary float-right">Simpan</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Proposal;
