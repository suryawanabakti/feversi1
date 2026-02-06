import React from "react"
import { Bar } from "react-chartjs-2"
import StatCard from "./StatCard"

const ProdiDashboard = ({ totalResiden, totalAlumni, totalStase, totalStaseRs, totalDosen, residenPerRs, options }) => {
    return (
        <>
            <StatCard icon="fa-user-graduate" title="Total Residen" value={totalResiden} />
            <StatCard icon="fa-user-graduate" title="Total Alumni" value={totalAlumni} />
            <StatCard icon="fa-user-nurse" title="Total Stase" value={totalStase} />
            <StatCard icon="fa-hospital" title="Total Stase RS" value={totalStaseRs} />
            <StatCard icon="fa-chalkboard-teacher" title="Total Dosen" value={totalDosen} />

            <div className="col-md-12">
                <div className="card shadow-sm">
                    <div className="card-header bg-white">
                        <h4 className="font-weight-bold">Jumlah Residen Masuk tiap Rumah Sakit</h4>
                    </div>
                    <div className="card-body">
                        <Bar data={residenPerRs} options={options} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProdiDashboard
