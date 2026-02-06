import React from "react"

const KepalaDashboard = () => {
    return (
        <div className="row mt-3">
            {/* Card Pengaduan */}
            <div className="col-md-6 mb-3">
                <a href="/admin-pengaduan" className="text-decoration-none">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title text-dark">Pengaduan</h5>
                            <p className="card-text text-muted">Kelola data pengaduan dari pengguna.</p>
                        </div>
                    </div>
                </a>
            </div>

            {/* Card Konseling */}
            <div className="col-md-6 mb-3">
                <a href="/admin-konseling" className="text-decoration-none">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title text-dark">Konseling</h5>
                            <p className="card-text text-muted">Kelola data konseling dan jadwal.</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    )
}

export default KepalaDashboard
