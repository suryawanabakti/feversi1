import React from "react"
import { Link } from "react-router-dom"
import StatCard from "./StatCard"

const ResidenDashboard = ({ residenbiodata, totalKhs, totalKrs, totalBeritaAcaraUjian, totalPrestasi }) => {
    return (
        <>
            {residenbiodata && !residenbiodata.alamat && (
                <div className="col-md-12 text-center">
                    <div className="card shadow-sm border-left-danger">
                        <div className="card-body">
                            <h3>
                                Anda Belum Melengkapi{" "}
                                <Link className="h3 font-weight-bold text-danger" to="/biodata">
                                    BIODATA
                                </Link>{" "}
                                Harap Segera Isi{" "}
                                <Link className="h3 font-weight-bold text-danger" to="/biodata">
                                    BIODATA
                                </Link>{" "}
                                Anda!
                            </h3>
                            <h3>
                                Jangan lupa mengganti password anda{" "}
                                <Link className="h3 font-weight-bold text-danger" to="/change-password">
                                    Klik disini.
                                </Link>{" "}
                            </h3>
                        </div>
                    </div>
                </div>
            )}
            <StatCard icon="fa-file-pdf" title="Total KHS" value={totalKhs} />
            <StatCard icon="fa-file-pdf" title="Total KRS" value={totalKrs} />
            <StatCard icon="fa-file-pdf" title="Total Ujian" value={totalBeritaAcaraUjian} />
            <StatCard icon="fa-trophy" title="Total Prestasi" value={totalPrestasi} />
        </>
    )
}

export default ResidenDashboard
