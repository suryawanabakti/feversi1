import { useState, useEffect } from "react"
import axios from "../../../api/axios"
import useAuthContext from "../../../context/AuthContext"
import { toast } from "react-hot-toast"
import "./dashboard-style.css"

// Import role-specific components
import ResidenDashboard from "./components/ResidenDashboard"
import AdminDashboard from "./components/AdminDashboard"
import ProdiDashboard from "./components/ProdiDashboard"
import StaserDashboard from "./components/StaserDashboard"
import KepalaDashboard from "./components/KepalaDashboard"

const Dashboard = () => {
  const { user } = useAuthContext()

  // Redirect staser if needed (keeping original logic)
  if (user?.roles[0]?.name === "staser") {
    // Note: This logic seems specific to the original implementation
    // but the original code had this check at the very top.
    // location.href = "/report-stase" 
  }

  // State management for dashboard data
  const [totalResiden, setTotalResiden] = useState("")
  const [totalAlumni, setTotalAlumni] = useState("")
  const [totalProdi, setTotalProdi] = useState("")
  const [totalRumahSakit, setTotalRumahSakit] = useState("")
  const [totalDosen, setTotalDosen] = useState("")
  const [totalStase, setTotalStase] = useState("")
  const [totalStaseRs, setTotalStaseRs] = useState("")
  const [totalPrestasi, setTotalPrestasi] = useState("")
  const [totalKhs, setTotalKhs] = useState("")
  const [totalKrs, setTotalKrs] = useState("")
  const [totalSpp, setTotalSpp] = useState("")
  const [totalBeritaAcaraUjian, setTotalBeritaAcaraUjian] = useState("")
  const [totalAbstrak, setTotalAbstrak] = useState("")
  const [lastSeen, setLastSeen] = useState([])
  const [residenbiodata, setResidenBiodata] = useState([])

  // Chart options
  const [options] = useState({
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
        text: "Chart.js Horizontal Bar Chart",
      },
    },
  })

  // Chart data states
  const [datas, setDatas] = useState({
    labels: [],
    datasets: [
      {
        id: 1,
        label: "Jumlah Stase",
        data: [],
        backgroundColor: "rgba(220, 53, 69, 0.7)",
        borderColor: "rgba(220, 53, 69, 1)",
      },
    ],
  })

  const [stasePerRs, setStasePerRs] = useState({
    labels: [],
    datasets: [
      {
        id: 1,
        label: "Jumlah Stase",
        data: [],
        backgroundColor: "rgba(220, 53, 69, 0.7)",
        borderColor: "rgba(220, 53, 69, 1)",
      },
    ],
  })

  const [residenPerRs, setResidenPerRs] = useState({
    labels: [],
    datasets: [
      {
        id: 1,
        label: "Jumlah Residen",
        data: [],
        backgroundColor: "rgba(220, 53, 69, 0.7)",
        borderColor: "rgba(220, 53, 69, 1)",
      },
    ],
  })

  // Fetch dashboard data
  const getDataDashboard = async () => {
    const toastId = toast.loading("Mohon tunggu sebentar...")
    try {
      const res = await axios.get("/api/dashboard")
      const data = res.data

      setResidenBiodata(data.residenBiodata)
      setLastSeen(data.lastSeen || [])
      setTotalResiden(data.totalResiden)
      setTotalAlumni(data.totalAlumni)
      setTotalProdi(data.totalProdi)
      setTotalRumahSakit(data.totalRumahSakit)
      setTotalDosen(data.totalDosen)
      setTotalStase(data.totalStase)
      setTotalKhs(data.totalKhs)
      setTotalKrs(data.totalKrs)
      setTotalStaseRs(data.totalStaseRs)
      setTotalAbstrak(data.totalAbstrak)
      setTotalSpp(data.totalSpp)
      setTotalPrestasi(data.totalPrestasi)
      setTotalBeritaAcaraUjian(data.totalBeritaAcara)

      if (user?.roles[0]?.name === "admin" && data.totalStasePerProdi) {
        setDatas({
          labels: data.totalStasePerProdi.map((dutu) => dutu.prodi?.name || "N/A"),
          datasets: [
            {
              label: "Jumlah Stase",
              data: data.totalStasePerProdi.map((dutu) => dutu.total),
              backgroundColor: "rgba(220, 53, 69, 0.7)",
              borderColor: "rgba(220, 53, 69, 1)",
            },
          ],
        })
      }

      if (data.totalStasePerRS) {
        setStasePerRs({
          labels: data.totalStasePerRS.map((diti) => diti.rumahsakit?.name || "N/A"),
          datasets: [
            {
              label: "Jumlah Stase",
              data: data.totalStasePerRS.map((diti) => diti.total),
              backgroundColor: "rgba(220, 53, 69, 0.7)",
              borderColor: "rgba(220, 53, 69, 1)",
            },
          ],
        })
      }

      if (data.rumahsakitResiden) {
        setResidenPerRs({
          labels: data.rumahsakitResiden.map((diti) => diti.name),
          datasets: [
            {
              label: "Residen",
              data: data.rumahsakitResiden.map((diti) => diti.staseresiden_count),
              backgroundColor: "rgba(220, 53, 69, 0.7)",
              borderColor: "rgba(220, 53, 69, 1)",
            },
          ],
        })
      }

      toast.dismiss(toastId)
    } catch (error) {
      console.error("Dashboard error:", error)
      toast.dismiss(toastId)
    }
  }

  const showOnlineUser = async (value) => {
    const toastId = toast.loading("Mohon Tunggu Sebentar...")
    try {
      const res = await axios.post("/api/dashboard", { showLastSeen: value })
      setLastSeen(res.data.lastSeen || [])
      toast.dismiss(toastId)
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data")
      toast.dismiss(toastId)
    }
  }

  useEffect(() => {
    getDataDashboard()
  }, [])

  const renderRoleDashboard = () => {
    const role = user?.roles[0]?.name

    switch (role) {
      case "residen":
        return (
          <ResidenDashboard
            residenbiodata={residenbiodata}
            totalKhs={totalKhs}
            totalKrs={totalKrs}
            totalBeritaAcaraUjian={totalBeritaAcaraUjian}
            totalPrestasi={totalPrestasi}
          />
        )
      case "prodi":
        return (
          <ProdiDashboard
            totalResiden={totalResiden}
            totalAlumni={totalAlumni}
            totalStase={totalStase}
            totalStaseRs={totalStaseRs}
            totalDosen={totalDosen}
            residenPerRs={residenPerRs}
            options={options}
          />
        )
      case "admin":
        return (
          <AdminDashboard
            totalResiden={totalResiden}
            totalAlumni={totalAlumni}
            totalProdi={totalProdi}
            totalDosen={totalDosen}
            lastSeen={lastSeen}
            showOnlineUser={showOnlineUser}
            datas={datas}
            stasePerRs={stasePerRs}
            options={options}
          />
        )
      case "staser":
        return (
          <StaserDashboard
            totalResiden={totalResiden}
            totalProdi={totalProdi}
            totalRumahSakit={totalRumahSakit}
            totalDosen={totalDosen}
            lastSeen={lastSeen}
            showOnlineUser={showOnlineUser}
            datas={datas}
            stasePerRs={stasePerRs}
            options={options}
          />
        )
      case "kepala":
        return <KepalaDashboard />
      default:
        return null
    }
  }

  return (
    <>
      <div className="main-content">
        <section className="section">
          <div className="section-header bg-white shadow-sm rounded">
            <h1 className="font-weight-bold">Dashboard</h1>
          </div>
          <div className="section-body">
            <div className="row">{renderRoleDashboard()}</div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Dashboard
