import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../../api/axios";
import toast from "react-hot-toast";
import Chart from "react-apexcharts";

export default function LaporanResiden() {
  const [statusPembiayaan, setStatusPembiayaan] = useState({
    mandiri: 0,
    beasiswa: 0,
    swasta: 0,
    unknown: 0,
  });
  const [labels] = useState(["Mandiri", "Beasiswa", "Swasta", "Uknown"]);
  const [series, setSeries] = useState([]);
  const [series2, setSeries2] = useState([]);
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
      text: "",
      align: "center",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: ["Mandiri", "Beasiswa", "Swasta", "Uknown"],
    },
  });
  const [prodiId, setProdiId] = useState("semua");
  const getData = async (value = "") => {
    if (value != "") {
      setProdiId(value);
    } else {
      setProdiId("semua");
    }
    try {
      toast.loading("Tunggu sebentar");
      const res = await axios.get("/api/laporan-residen?prodi_id=" + value);
      console.log(res.data.statusPembiayaan.mandiri);
      setStatusPembiayaan(res.data.statusPembiayaan);
      setSeries([
        res.data.statusPembiayaan.mandiri,
        res.data.statusPembiayaan.beasiswa,
        res.data.statusPembiayaan.swasta,
        res.data.statusPembiayaan.unknown,
      ]);
      setSeries2([
        {
          name: "Status Pembiayaan",
          data: [
            res.data.statusPembiayaan.mandiri,
            res.data.statusPembiayaan.beasiswa,
            res.data.statusPembiayaan.swasta,
            res.data.statusPembiayaan.unknown,
          ],
        },
      ]);
    } catch (e) {
      console.error(e);
    }
    toast.dismiss();
  };
  const [prodi, setProdi] = useState([]);
  const getProdi = async () => {
    try {
      const res = await axios.get("/api/prodi");
      setProdi(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Gagal mengambil Data Residen");
    }
  };

  useEffect(() => {
    getData();
    getProdi();
  }, []);
  return (
    <div className="main-content">
      {" "}
      <section className="section">
        <div className="section-header">
          <h1>Laporan Residen Aktif</h1>
        </div>
        <div className="section-body">
          <select
            className="form-control col-md-4 mb-2"
            onChange={(e) => getData(e.target.value)}
          >
            <option value="">Semua Prodi</option>
            {prodi.map((data) => {
              return (
                <option value={data.prodi.id} key={data.id}>
                  {data.name}
                </option>
              );
            })}
          </select>
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-residen/mandiri/" + prodiId}>
                {" "}
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">Mandiri</h4>
                    </div>
                    <div className="card-body">{statusPembiayaan.mandiri}</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-residen/beasiswa/" + prodiId}>
                {" "}
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">beasiswa</h4>
                    </div>
                    <div className="card-body">{statusPembiayaan.beasiswa}</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-residen/swasta/" + prodiId}>
                {" "}
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">swasta</h4>
                    </div>
                    <div className="card-body">{statusPembiayaan.swasta}</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <Link to={"/report-residen/unknown/" + prodiId}>
                {" "}
                <div className="card card-statistic-1">
                  <div className="card-icon bg-danger">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="card-wrap">
                    <div className="card-header">
                      <h4 className="text-capitalize">unknown</h4>
                    </div>
                    <div className="card-body">{statusPembiayaan.unknown}</div>
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
