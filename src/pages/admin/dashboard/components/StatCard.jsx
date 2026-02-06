import React from "react"

const StatCard = ({ icon, title, value }) => (
    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
        <div className="card card-statistic-1 shadow-sm hover-shadow">
            <div className="card-icon bg-danger pulse">
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="card-wrap">
                <div className="card-header">
                    <h4 className="text-capitalize">{title}</h4>
                </div>
                <div className="card-body font-weight-bold">{value}</div>
            </div>
        </div>
    </div>
)

export default StatCard
