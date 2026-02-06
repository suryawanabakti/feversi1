import React from "react"
import { Bar } from "react-chartjs-2"
import StatCard from "./StatCard"

const StaserDashboard = ({
    totalResiden,
    totalProdi,
    totalRumahSakit,
    totalDosen,
    lastSeen,
    showOnlineUser,
    datas,
    stasePerRs,
    options,
}) => {
    return (
        <>
            <StatCard icon="fa-user-graduate" title="Total Residen" value={totalResiden} />
            <StatCard icon="fa-university" title="Total Prodi" value={totalProdi} />
            <StatCard icon="fa-hospital" title="Total Rumah Sakit" value={totalRumahSakit} />
            <StatCard icon="fa-chalkboard-teacher" title="Total Dosen" value={totalDosen} />

            <div className="col-md-12">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <ul className="nav nav-tabs nav-tabs-danger" id="myTab" role="tablist">
                            <li className="nav-item">
                                <a
                                    className="nav-link active show font-weight-bold"
                                    id="dailylogin-tab"
                                    data-toggle="tab"
                                    href="#dailylogin"
                                    role="tab"
                                    aria-controls="dailylogin"
                                    aria-selected="false"
                                >
                                    <i className="fas fa-users mr-2"></i>
                                    Daily User Login Activity
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link font-weight-bold"
                                    id="home-tab"
                                    data-toggle="tab"
                                    href="#home"
                                    role="tab"
                                    aria-controls="home"
                                    aria-selected="false"
                                >
                                    <i className="fas fa-chart-bar mr-2"></i>
                                    Jumlah Stase Per Prodi
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link font-weight-bold"
                                    id="profile-tab"
                                    data-toggle="tab"
                                    href="#profile"
                                    role="tab"
                                    aria-controls="profile"
                                    aria-selected="true"
                                >
                                    <i className="fas fa-hospital mr-2"></i>
                                    Jumlah Stase Per Rumah Sakit
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content p-3" id="myTabContent">
                            <div
                                className="tab-pane fade active show"
                                id="dailylogin"
                                role="tabpanel"
                                aria-labelledby="dailylogin-tab"
                            >
                                <div className="d-flex justify-content-between mb-3">
                                    <select
                                        name=""
                                        id=""
                                        className="form-control col-md-3 custom-select"
                                        onChange={(e) => showOnlineUser(e.target.value)}
                                    >
                                        <option value="5">Show 5 Last Seen</option>
                                        <option value="20">Show 20 Last Seen</option>
                                        <option value="1000">Show All Last Seen</option>
                                    </select>
                                </div>

                                {lastSeen.length === 0 ? (
                                    <div className="alert alert-info text-center mt-3">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Belum ada yang login hari ini
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-striped">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Nama</th>
                                                    <th>Terakhir terlihat</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lastSeen.map((data) => (
                                                    <tr key={data.id}>
                                                        <td className="font-weight-bold">{data.name}</td>
                                                        <td>{data.lastSeen}</td>
                                                        <td>
                                                            {data.isOnline ? (
                                                                <span className="badge badge-success badge-pill">
                                                                    <i className="fas fa-circle mr-1 small"></i>
                                                                    online
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-danger badge-pill">
                                                                    <i className="fas fa-circle mr-1 small"></i>
                                                                    offline
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="tab-pane fade" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <div className="chart-container" style={{ height: "400px" }}>
                                    <Bar data={datas} options={options} />
                                </div>
                            </div>
                            <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                <div className="chart-container" style={{ height: "400px" }}>
                                    <Bar data={stasePerRs} options={options} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StaserDashboard
