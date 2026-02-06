import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function LaporanProdi() {
  const [data, setData] = useState({
    totalResiden: [],
    residenBiodata: [],
    totalDosen: [],
  });

  const chartOptions = {
    indexAxis: "y",
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: false,
        text: "Diagram Batang Jumlah Residen Prodi",
      },
    },
  };

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/laporan-prodi");
        const { totalresiden, residenbiodata, totaldosen } = res.data;

        setData({
          totalResiden: totalresiden,
          residenBiodata: residenbiodata,
          totalDosen: totaldosen,
        });

        setChartData({
          labels: totalresiden.map((item) => item.name),
          datasets: [
            {
              id: 1,
              label: "Jumlah Residen",
              data: totalresiden.map((item) => item.totalResiden),
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching prodi report:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1 className="font-weight-bold">Laporan Per Program Studi</h1>
          <div className="section-header-breadcrumb">
            <div className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="breadcrumb-item active">Laporan Prodi</div>
          </div>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h4>Diagram Batang Jumlah Residen Prodi</h4>
                </div>
                <div className="card-body">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Table: Total Residen */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h4>Table Laporan Total Residen Prodi</h4>
                </div>
                <div className="card-body">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Nama Prodi</th>
                        <th>Jumlah Residen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.totalResiden.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>
                            <Link to={`/residen?prodi=${item.id}`}>
                              {item.name}
                            </Link>
                          </td>
                          <td>{item.totalResiden}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Table: Residen Biodata Filled */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h4>Residen Yang Sudah Mengisi Biodata</h4>
                </div>
                <div className="card-body">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Nama Prodi</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.residenBiodata.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{item.name}</td>
                          <td>{item.totalResiden}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Table: Total Dosen */}
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h4>Table Laporan Total Dosen Prodi</h4>
                </div>
                <div className="card-body">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Nama Prodi</th>
                        <th>Jumlah Dosen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.totalDosen.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{item.name}</td>
                          <td>{item.totalDosen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
