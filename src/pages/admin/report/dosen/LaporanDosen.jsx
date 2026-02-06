import React, { useState } from "react";
import axios from "../../../../api/axios";
import { useEffect } from "react";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function LaporanDosen() {
  const [dosens, setDosens] = useState([]);
  const [labels] = useState(["NIDK", "NIDN", "NUP", "DLL"]);

  const [series, setSeries] = useState([]);
  const [options] = useState({
    chart: {
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        export: {
          csv: {
            filename: undefined,
            columnDelimiter: ",",
            headerCategory: "Sertifikat",
            headerValue: "Value",
            dateFormatter(timestamp) {
              return new Date(timestamp).toDateString();
            },
          },
          svg: {
            filename: undefined,
          },
          png: {
            filename: undefined,
          },
        },
        autoSelected: "zoom",
      },
    },
    colors: ["#CD5C5C", "#FFC0CB", "#DC143C", "#8B0000"],
    labels: labels,
  });

  const [series2, setSeries2] = useState([]);
  const [options2, setOptions2] = useState({
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text: "Jumlah Dosen",
      align: "center",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: ["NIDK", "NIDN", "NUP", "DLL"],
    },
  });

  const getData = async () => {
    const tid = toast.loading("Tunggu sebentar...");
    try {
      const res = await axios.get("/api/laporan-dosen");
      setDosens(res.data);
      setSeries([
        res.data.countDosenNidk,
        res.data.countDosenNidn,
        res.data.countDosenNup,
        res.data.countDosenDll,
      ]);
      setSeries2([
        {
          name: "Dosen",
          data: [
            res.data.countDosenNidk,
            res.data.countDosenNidn,
            res.data.countDosenNup,
            res.data.countDosenDll,
          ],
        },
      ]);
      console.log("res", res.data);
    } catch (e) {
      console.error(e);
    }
    toast.remove(tid);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="main-content">
      {" "}
      <section className="section">
        <div className="section-header d-flex justify-content-between">
          <h1>Laporan Dosen</h1>
          <b>Total : {dosens.countDosen}</b>
        </div>
        <div className="section-body">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-dosen/nidk"}>
                {" "}
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">DOSEN NIDK</h4>
                    </div>
                    <div className="card-body">{dosens.countDosenNidk}</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-dosen/nidn"}>
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">DOSEN NIDN</h4>
                    </div>
                    <div className="card-body">{dosens.countDosenNidn}</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-dosen/nup"}>
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">DOSEN NUP</h4>
                    </div>
                    <div className="card-body">{dosens.countDosenNup}</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-dosen/dll"}>
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">DOSEN DLL</h4>
                    </div>
                    <div className="card-body">{dosens.countDosenDll}</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <Chart
                    options={options}
                    series={series}
                    type="pie"
                    labels={labels}
                    width={360}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <Chart
                    options={options2}
                    series={series2}
                    type="line"
                    width={360}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
