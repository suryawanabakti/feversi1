"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import axios from "../../../api/axios"
import baseurl from "../../../api/baseurl"
import useAuthContext from "../../../context/AuthContext"
import { Spinner, Tooltip, OverlayTrigger, Row, Col, Card, Form, Tabs, Tab } from "react-bootstrap"
import "./biodata-style.css"
import { Link } from "react-router-dom"
const Biodata = () => {
  // Context and state
  const { user, getUser } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [formLoading, setFormLoading] = useState(true)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const beasiswaRef = useRef()

  // Form data states
  const [tahunAjaran, setTahunAjaran] = useState([])
  const [selectProdi, setSelectProdi] = useState([])
  const [dataProvinsi, setDataProvinsi] = useState([])
  const [dataKabupaten, setDataKabupaten] = useState([])
  const [dataKecamatan, setDataKecamatan] = useState([])
  const [inputBeasiswa, setInputBeasiswa] = useState(false)
  const [namaPropinsi, setNamaPropinsi] = useState("")
  const [namaKabupaten, setNamaKabupaten] = useState("")
  const [namaKecamatan, setNamaKecamatan] = useState("")

  // Personal information states
  const [name, setName] = useState(user.name)
  const [prodiId, setProdiId] = useState()
  const [placeholderProdi, setPlaceholderProdi] = useState("")
  const [alamat, setAlamat] = useState("")
  const [ipk, setIpk] = useState("")
  const [jenisKelamin, setJenisKelamin] = useState("laki-laki")
  const [tahunMasuk, setTahunMasuk] = useState("")
  const [semester, setSemester] = useState("")
  const [tanggalLahir, setTanggalLahir] = useState("")
  const [nomorHp, setNomorHp] = useState("")
  const [nomorRekening, setNomorRekening] = useState("")
  const [nik, setNik] = useState("")
  const [npwp, setNpwp] = useState("")
  const [email, setEmail] = useState("")
  const [rekomendasiAsal, setRekomendasiAsal] = useState("")
  const [asalFk, setAsalFk] = useState("")
  const [akreditasi, setAkreditasi] = useState("")
  const [tempatKerjaSebelumnya, setTempatKerjaSebelumnya] = useState("")
  const [statusPembiayaan, setStatusPembiayaan] = useState("")
  const [beasiswaDll, setBeasiswaDll] = useState("")
  const [beasiswa, setBeasiswa] = useState("")
  const [provinsi, setProvinsi] = useState("")
  const [kabupaten, setKabupaten] = useState("")
  const [kecamatan, setKecamatan] = useState("")

  // Document states
  const [ktp, setKtp] = useState()
  const [ktpPrev, setKtpPrev] = useState()
  const [ktpPrev2, setKtpPrev2] = useState()
  const [akte, setAkte] = useState()
  const [aktePrev, setAktePrev] = useState()
  const [kartuKeluarga, setKartuKeluarga] = useState()
  const [kartuKeluargaPrev, setKartuKeluargaPrev] = useState()
  const [buktiLulus, setBuktiLulus] = useState()
  const [buktiLulusPrev, setBuktiLulusPrev] = useState()
  const [ijazahTerakhir, setIjazahTerakhir] = useState()
  const [ijazahTerakhirPrev, setIjazahTerakhirPrev] = useState()
  const [skpns, setSkpns] = useState()
  const [skpnsPrev, setSkpnsPrev] = useState()
  const [skPenerimaBeassiwa, setSkPenerimaBeasiswa] = useState()
  const [skPenerimaBeassiwaPrev, setSkPenerimaBeasiswaPrev] = useState()
  const [buktiRekomendasiAsal, setBuktiRekomendasiAsal] = useState()
  const [buktiRekomendasiAsalPrev, setBuktiRekomendasiAsalPrev] = useState()
  const [str, setStr] = useState()
  const [strPrev, setStrPrev] = useState()
  const [sip, setSip] = useState()
  const [sipPrev, setSipPrev] = useState()
  const [bpjs, setBpjs] = useState()
  const [bpjsPrev, setBpjsPrev] = useState()
  const [pasFoto, setPasFoto] = useState()
  const [pasFotoPrev, setPasFotoPrev] = useState()
  const [nilaiToefl, setNilaiToefl] = useState()
  const [nilaiToeflPrev, setNilaiToeflPrev] = useState()

  // Tooltip for info icons
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Dari akun masing-masing https://regpmb.unhas.ac.id
    </Tooltip>
  )

  // Get academic years
  const getTahunAjaran = async () => {
    try {
      const res = await axios.get("/api/tahun-ajaran")
      setTahunAjaran(res.data)
    } catch (err) {
      toast.error("Gagal mengambil data tahun ajaran")
    }
  }

  // Get program data
  const getProdi = async () => {
    try {
      const res = await axios.get("/api/biodata/get-prodi")
      setSelectProdi(res.data.data)
    } catch (err) {
      toast.error("Gagal mengambil data prodi")
    }
  }

  // Get province data
  const getPropinsi = async () => {
    try {
      const res = await axios.get("/api/ref/get-provinsi")
      setDataProvinsi(res.data.provinsi)
    } catch (err) {
      toast.error("Gagal mengambil data provinsi")
    }
  }

  // Get district data by province
  const getDataKabupaten = async (idprov) => {
    try {
      const res = await axios.get("/api/ref/get-kabupaten/" + idprov)
      setProvinsi(idprov)
      setDataKabupaten(res.data.kota_kabupaten)
    } catch (err) {
      toast.error("Gagal mengambil data kabupaten")
    }
  }

  // Handle province change
  const handleChangeProvinsi = async (idprov) => {
    try {
      const res = await axios.get("/api/ref/get-kabupaten/" + idprov)
      setProvinsi(idprov)
      setDataKabupaten(res.data.kota_kabupaten)

      if (kabupaten) {
        document.getElementById("kabupatenUbah").innerHTML = "PILIH KABUPATEN"
        setKabupaten("")
      }
    } catch (err) {
      toast.error("Gagal mengambil data kabupaten")
    }
  }

  // Handle district change
  const handleChangeKabupaten = async (idkabupaten) => {
    setKabupaten(idkabupaten)
  }

  // Handle financing status change
  const handleStatusPembiayaan = (e) => {
    setStatusPembiayaan(e.target.value)
    if (e.target.value === "beasiswa") {
      setInputBeasiswa(true)
    } else {
      setInputBeasiswa(false)
    }
    setBeasiswa("")
  }

  // Get province name by ID
  const getNamaProvinsi = async (id) => {
    try {
      const res = await axios.get("/api/ref/get-provinsi/" + id)
      setNamaPropinsi(res.data.nama)
    } catch (err) {
      toast.error("Gagal mengambil data provinsi")
    }
  }

  // Get district name by ID
  const getNamaKabupaten = async (id) => {
    try {
      const res = await axios.get("/api/ref/get-kabupaten-by-id/" + id)
      setNamaKabupaten(res.data.nama)
    } catch (err) {
      toast.error("Gagal mengambil data kabupaten")
    }
  }

  // Get biodata
  const getBiodata = async () => {
    try {
      const res = await axios.get("/api/biodata")
      await getPropinsi()

      // Set document previews
      setAktePrev(res.data.akte)
      setKartuKeluargaPrev(res.data.kartu_keluarga)
      setBuktiLulusPrev(res.data.bukti_lulus)
      setIjazahTerakhirPrev(res.data.ijazah_terakhir)
      setSkpnsPrev(res.data.sk_pns)
      setSkPenerimaBeasiswaPrev(res.data.sk_penerima_beasiswa)
      setStrPrev(res.data.str)
      setSipPrev(res.data.sip)
      setBpjsPrev(res.data.bpjs)
      setPasFotoPrev(res.data.pas_foto)
      setNilaiToeflPrev(res.data.nilai_toefl)
      setBuktiRekomendasiAsalPrev(res.data.bukti_rekomendasi_asal)

      // Set form data
      setBeasiswaDll(res.data.beasiswa_dll)
      setBeasiswa(res.data.beasiswa)
      setJenisKelamin(res.data.jenis_kelamin)
      setProdiId(res.data.prodi_id)
      setPlaceholderProdi(res.data.prodi.name)
      setAlamat(res.data.alamat)
      setKtpPrev2(res.data.ktp)
      setTahunMasuk(res.data.tahunmasuk)
      setSemester(res.data.semester)
      setTanggalLahir(res.data.tanggal_lahir)
      setNomorHp(res.data.no_hp)
      setNomorRekening(res.data.no_rekening)
      setNik(res.data.nik)
      setNpwp(res.data.npwp)
      setEmail(res.data.email)
      setRekomendasiAsal(res.data.rekomendasi_asal)
      setAsalFk(res.data.asal_fk)
      setAkreditasi(res.data.akreditasi)
      setTempatKerjaSebelumnya(res.data.tempat_kerja_sebelumnya)
      setStatusPembiayaan(res.data.status_pembiyaan)
      setIpk(res.data.ipk)
      setKtp(res.data.ktp)
      setBuktiLulus(res.data.bukti_lulus)
      setIjazahTerakhir(res.data.ijazah_terakhir)
      setStr(res.data.str)
      setSip(res.data.sip)
      setBpjs(res.data.bpjs)
      setNilaiToefl(res.data.nilai_toefl)
      setPasFoto(res.data.pas_foto)

      // Set conditional states
      if (res.data.status_pembiyaan === "beasiswa") {
        setInputBeasiswa(true)
      } else {
        setInputBeasiswa(false)
      }

      // Load location data
      await getDataKabupaten(res.data.provinsi_id)
      setProvinsi(res.data.provinsi_id)
      res.data.provinsi_id && (await getNamaProvinsi(res.data.provinsi_id))
      res.data.kabupaten_id && (await getNamaKabupaten(res.data.kabupaten_id))
      await handleChangeKabupaten(res.data.kabupaten_id)
      setKabupaten(res.data.kabupaten_id)
      setKecamatan(res.data.kecamatan_id)
    } catch (err) {
      toast.error("Gagal mengambil data biodata")
      console.log(err)
    }

    setFormLoading(false)
  }

  // File upload handlers
  const handleKtp = async (e) => {
    setKtp(e.target.files[0])
    setKtpPrev(URL.createObjectURL(e.target.files[0]))
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload KTP...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("ktp", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-ktp",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload KTP")
      setKtpPrev2(response.data.data.ktp)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleakte = async (e) => {
    setAkte(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload Akte Lahir...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("akte", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-akte",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log("AKTE", response)
      toast.success("Berhasil Upload Akte Lahir")
      setAktePrev(response.data.data.akte)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleKartuKeluarga = async (e) => {
    setKartuKeluarga(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload Kartu Keluarga...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("kartuKeluarga", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-kartukeluarga",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload Kartu Keluarga")
      setKartuKeluargaPrev(response.data.data.kartu_keluarga)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleBuktiLulus = async (e) => {
    setBuktiLulus(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload Bukti Lulus...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("buktiLulus", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-buktilulus",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload Bukti Lulus")
      setBuktiLulusPrev(response.data.data.bukti_lulus)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleIjazahTerakhir = async (e) => {
    setIjazahTerakhir(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload Ijazah Terakhir...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("ijazahTerakhir", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-ijazahterakhir",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload Ijazah Terakhir")
      setIjazahTerakhirPrev(response.data.data.ijazah_terakhir)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleSkpns = async (e) => {
    setSkpns(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload SK PNS...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("skPns", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-skpns",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload SK PNS")
      setSkpnsPrev(response.data.data.sk_pns)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleChangeSkPenerimaBeasiswa = async (value) => {
    setSkPenerimaBeasiswa(value)
    const toastId = toast.loading("Sedang Mengupload SK Penerima Beasiswa...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("skPenerimaBeassiwa", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-skpenerimabeasiswa",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload SK Penerima Beasiswa")
      setSkPenerimaBeasiswaPrev(response.data.data.sk_penerima_beasiswa)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleChangeBuktiRekomendasiAsal = async (value) => {
    setBuktiRekomendasiAsal(value)
    const toastId = toast.loading("Sedang Mengupload Bukti Rekomendasi Asal...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("buktiRekomendasiAsal", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-buktirekomendasiasal",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload Bukti Rekomendasi Asal")
      setBuktiRekomendasiAsalPrev(response.data.data.bukti_rekomendasi_asal)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handlestr = async (e) => {
    setStr(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload STR...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("str", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-str",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload STR")
      setStrPrev(response.data.data.str)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handlesip = async (e) => {
    setSip(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload SIP...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("sip", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-sip",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload SIP")
      setSipPrev(response.data.data.sip)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handlebpjs = async (e) => {
    setBpjs(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload BPJS...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("bpjs", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-bpjs",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload BPJS")
      setBpjsPrev(response.data.data.bpjs)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handlePasFoto = async (e) => {
    setPasFoto(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload Pas Foto...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("pasFoto", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-pasfoto",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload Pas Foto")
      setPasFotoPrev(response.data.data.pas_foto)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  const handleNilaiToefl = async (e) => {
    setNilaiToefl(e.target.files[0])
    var value = e.target.files[0]
    const toastId = toast.loading("Sedang Mengupload Nilai TOEFL...")
    setLoadingUpload(true)
    try {
      const formData = new FormData()
      formData.append("nilaiToefl", value)
      const response = await axios({
        method: "post",
        url: "/api/biodata-upload-nilaitoefl",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Berhasil Upload Nilai TOEFL")
      setNilaiToeflPrev(response.data.data.nilai_toefl)
      setErrors([])
    } catch (err) {
      handleUploadError(err)
    }
    setLoadingUpload(false)
    toast.dismiss(toastId)
  }

  // Error handler for uploads
  const handleUploadError = (err) => {
    if (err.code === "ERR_NETWORK") {
      toast.error("Gagal upload, jaringan bermasalah")
    } else if (err.response?.status === 422) {
      toast.error(err.response.data.message)
      setErrors(err.response.data.errors)
    } else {
      toast.error("Terjadi kesalahan saat upload")
    }
  }

  // Save all biodata
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Menyimpan data biodata...")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("prodiId", prodiId)
      alamat && formData.append("alamat", alamat)
      jenisKelamin && formData.append("jenisKelamin", jenisKelamin)
      nik && formData.append("nik", nik)
      tahunMasuk && formData.append("tahunMasuk", tahunMasuk)
      semester && formData.append("semester", semester)
      nomorHp && formData.append("noHp", nomorHp)
      ipk && formData.append("ipk", ipk)
      tanggalLahir && formData.append("tanggalLahir", tanggalLahir)
      nomorRekening && formData.append("noRekening", nomorRekening)
      npwp && formData.append("npwp", npwp)
      email && formData.append("email", email)
      formData.append("rekomendasiAsal", rekomendasiAsal || "-")
      asalFk && formData.append("asalFk", asalFk)
      akreditasi && formData.append("akreditasi", akreditasi)
      tempatKerjaSebelumnya && formData.append("tempatKerjaSebelumnya", tempatKerjaSebelumnya)
      statusPembiayaan && formData.append("statusPembiayaan", statusPembiayaan)

      // Scholarship data (send even if empty strings to satisfy backend keys)
      if (statusPembiayaan === "beasiswa") {
        formData.append("beasiswa", beasiswa || "-")
        formData.append("beasiswaDll", beasiswaDll || "-")
      }

      provinsi && formData.append("provinsiId", provinsi)
      kabupaten && formData.append("kabupatenId", kabupaten)
      kecamatan && formData.append("kecamatanId", kecamatan)

      // Document files
      ktp && formData.append("ktp", ktp)
      bpjs && formData.append("bpjs", bpjs)
      akte && formData.append("akte", akte)
      kartuKeluarga && formData.append("kartuKeluarga", kartuKeluarga)
      buktiLulus && formData.append("buktiLulus", buktiLulus)
      buktiRekomendasiAsal && formData.append("buktiRekomendasiAsal", buktiRekomendasiAsal)
      ijazahTerakhir && formData.append("ijazahTerakhir", ijazahTerakhir)
      skpns && formData.append("skPns", skpns)
      skPenerimaBeassiwa && formData.append("skPenerimaBeassiwa", skPenerimaBeassiwa)
      str && formData.append("str", str)
      sip && formData.append("sip", sip)
      pasFoto && formData.append("pasFoto", pasFoto)
      nilaiToefl && formData.append("nilaiToefl", nilaiToefl)

      const response = await axios({
        method: "post",
        url: "/api/biodata",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Berhasil menyimpan biodata")
      setErrors([])
      setBpjsPrev(response.data.data.bpjs)
      getUser()
    } catch (err) {
      console.log(err)
      if (err.code === "ERR_NETWORK") {
        toast.error("Gagal simpan, jaringan bermasalah")
      } else if (err.response?.status === 422) {
        toast.error(err.response.data.message)
        setErrors(err.response.data.errors)
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data")
      }
    }

    setLoading(false)
    toast.dismiss(toastId)
  }

  // Load initial data
  useEffect(() => {
    getTahunAjaran()
    getBiodata()
    getProdi()
  }, [])

  // Document preview component
  const DocumentPreview = ({ label, filePath, fileUrl, required = false }) => {
    const handleViewDocument = async (e) => {
      e.preventDefault()
      const toastId = toast.loading("Membuka dokumen...")
      console.log(fileUrl)
      try {
        const response = await axios.get(`/api/documents/${filePath}/${fileUrl}`, {
          responseType: "blob",
        })
        console.log(response)
        // Create blob url
        const file = new Blob([response.data], { type: response.headers["content-type"] })
        const fileURL = URL.createObjectURL(file)

        // Open in new tab
        window.open(fileURL, "_blank")
        toast.dismiss(toastId)
      } catch (error) {
        console.error(error)
        toast.dismiss(toastId)
        toast.error("Gagal membuka dokumen. Anda mungkin tidak memiliki akses.")
      }
    }

    return (
      <>
        {label}{" "}
        {required && (
          <span title="Harus diisi" className="text-danger">
            *
          </span>
        )}{" "}
        {fileUrl && (
          <a
            href="#"
            onClick={handleViewDocument}
            className="badge badge-info"
          >
            <i className="fas fa-eye mr-1"></i>
            Lihat
          </a>
        )}
      </>
    )
  }

  return (
    <div className="main-content">
      <section className="section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h1 className="font-weight-bold">Biodata</h1>
          <div className="section-header-breadcrumb">
            <div className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="breadcrumb-item active">Biodata</div>
          </div>
        </div>

        <div className="section-body">
          {formLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Memuat data biodata...</p>
            </div>
          ) : (
            <Form onSubmit={handleSave}>
              <div className="row">
                {/* Informasi Pribadi Section */}
                <Row className="mb-5 align-items-start">
                  <Col lg={4} className="mb-4">
                    <h5 className="font-weight-bold text-dark" style={{ fontSize: '1.25rem' }}>
                      <i className="fas fa-user mr-2 text-primary opacity-50"></i>
                      Informasi Pribadi
                    </h5>
                    <p className="text-muted small">Detail identitas diri Anda yang terdaftar pada sistem.</p>
                  </Col>
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                      <Card.Body className="p-4">
                        <Row className="g-4">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                Nama Lengkap <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Masukkan Nama Lengkap..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isInvalid={!!errors.name}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.name?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">NIM</Form.Label>
                              <Form.Control
                                type="text"
                                readOnly
                                value={user.username}
                                style={{ borderRadius: '10px', height: '48px', backgroundColor: '#f8fafc' }}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Program Studi</Form.Label>
                              <Form.Control
                                type="text"
                                readOnly
                                value={placeholderProdi}
                                style={{ borderRadius: '10px', height: '48px', backgroundColor: '#f8fafc' }}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Jenis Kelamin <span className="text-danger">*</span></Form.Label>
                              <div className="d-flex mt-2">
                                <Form.Check
                                  type="radio"
                                  label="Laki-laki"
                                  name="jenisKelamin"
                                  id="laki-laki"
                                  className="mr-4"
                                  checked={jenisKelamin === "laki-laki"}
                                  onChange={() => setJenisKelamin("laki-laki")}
                                />
                                <Form.Check
                                  type="radio"
                                  label="Perempuan"
                                  name="jenisKelamin"
                                  id="perempuan"
                                  checked={jenisKelamin === "perempuan"}
                                  onChange={() => setJenisKelamin("perempuan")}
                                />
                              </div>
                              {errors.jenisKelamin && <div className="text-danger small mt-2">{errors.jenisKelamin[0]}</div>}
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Tahun Masuk <span className="text-danger">*</span></Form.Label>
                              <Form.Select
                                value={tahunMasuk}
                                onChange={(e) => setTahunMasuk(e.target.value)}
                                isInvalid={!!errors.tahunMasuk}
                                style={{ borderRadius: '10px', height: '48px' }}
                              >
                                <option value="">Pilih Tahun...</option>
                                {tahunAjaran.map((data) => (
                                  <option key={data.id} value={data.tahun_ajaran}>{data.tahun_ajaran}</option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">{errors.tahunMasuk?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Semester <span className="text-danger">*</span></Form.Label>
                              <Form.Select
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                isInvalid={!!errors.semester}
                                style={{ borderRadius: '10px', height: '48px' }}
                              >
                                <option value="">Pilih Semester...</option>
                                <option value="Awal / Juli - Desember">Awal / Juli - Desember</option>
                                <option value="Akhir / Januari - Juni">Akhir / Januari - Juni</option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">{errors.semester?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Tanggal Lahir <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="date"
                                value={tanggalLahir}
                                onChange={(e) => setTanggalLahir(e.target.value)}
                                isInvalid={!!errors.tanggalLahir}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.tanggalLahir?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Nomor HP <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="number"
                                placeholder="08..."
                                value={nomorHp}
                                onChange={(e) => setNomorHp(e.target.value)}
                                isInvalid={!!errors.noHp}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.noHp?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Email</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isInvalid={!!errors.email}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.email?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">NIK <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="number"
                                placeholder="Masukkan NIK..."
                                value={nik}
                                onChange={(e) => setNik(e.target.value)}
                                isInvalid={!!errors.nik}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.nik?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">NPWP</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="XX.XXX.XXX.X-XXX.XXX"
                                value={npwp}
                                onChange={(e) => setNpwp(e.target.value)}
                                isInvalid={!!errors.npwp}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.npwp?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Nomor Rekening</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Masukkan Nomor Rekening..."
                                value={nomorRekening}
                                onChange={(e) => setNomorRekening(e.target.value)}
                                isInvalid={!!errors.noRekening}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.noRekening?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">Alamat <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Alamat domisili lengkap..."
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                isInvalid={!!errors.alamat}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.alamat?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Informasi Pendidikan Section */}
                <Row className="mb-5 align-items-start">
                  <Col lg={4} className="mb-4">
                    <h5 className="font-weight-bold text-dark" style={{ fontSize: '1.25rem' }}>
                      <i className="fas fa-graduation-cap mr-2 text-primary opacity-50"></i>
                      Informasi Pendidikan
                    </h5>
                    <p className="text-muted small">Riwayat latar belakang pendidikan dan rekomendasi daerah.</p>
                  </Col>
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                      <Card.Body className="p-4">
                        <Row className="g-4">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                Asal Fakultas Kedokteran <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Masukkan Asal FK..."
                                value={asalFk}
                                onChange={(e) => setAsalFk(e.target.value)}
                                isInvalid={!!errors.asalFk}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.asalFk?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                Akreditasi <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                value={akreditasi}
                                onChange={(e) => setAkreditasi(e.target.value)}
                                isInvalid={!!errors.akreditasi}
                                style={{ borderRadius: '10px', height: '48px' }}
                              >
                                <option value="">Pilih Akreditasi</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">{errors.akreditasi?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                IPK <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="0.00"
                                value={ipk}
                                onChange={(e) => setIpk(e.target.value)}
                                isInvalid={!!errors.ipk}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.ipk?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                Tempat Kerja Sebelumnya
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Masukkan tempat kerja sebelumnya..."
                                value={tempatKerjaSebelumnya}
                                onChange={(e) => setTempatKerjaSebelumnya(e.target.value)}
                                isInvalid={!!errors.tempatKerjaSebelumnya}
                                style={{ borderRadius: '10px', height: '48px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.tempatKerjaSebelumnya?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                Rekomendasi Asal <span className="text-danger">*</span>
                              </Form.Label>
                              <Row className="g-3">
                                <Col md={6}>
                                  <Form.Select
                                    className="mb-2"
                                    onChange={(e) => handleChangeProvinsi(e.target.value)}
                                    value={provinsi || ""}
                                    isInvalid={!!errors.provinsiId}
                                    style={{ borderRadius: '10px', height: '48px' }}
                                  >
                                    <option value="">{namaPropinsi ? namaPropinsi : "Pilih Provinsi"}</option>
                                    {dataProvinsi.map((data) => (
                                      <option value={data.id} key={data.id}>{data.nama}</option>
                                    ))}
                                  </Form.Select>
                                  <Form.Control.Feedback type="invalid">{errors.provinsiId?.[0]}</Form.Control.Feedback>
                                </Col>
                                <Col md={6}>
                                  <Form.Select
                                    onChange={(e) => handleChangeKabupaten(e.target.value)}
                                    value={kabupaten || ""}
                                    isInvalid={!!errors.kabupatenId}
                                    style={{ borderRadius: '10px', height: '48px' }}
                                  >
                                    <option value="" id="kabupatenUbah">{namaKabupaten ? namaKabupaten : "Pilih Kabupaten"}</option>
                                    {dataKabupaten.map((data) => (
                                      <option value={data.id} key={data.id}>{data.nama}</option>
                                    ))}
                                  </Form.Select>
                                  <Form.Control.Feedback type="invalid">{errors.kabupatenId?.[0]}</Form.Control.Feedback>
                                </Col>
                              </Row>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Informasi Pembiayaan Section */}
                <Row className="mb-5 align-items-start">
                  <Col lg={4} className="mb-4">
                    <h5 className="font-weight-bold text-dark" style={{ fontSize: '1.25rem' }}>
                      <i className="fas fa-money-bill-wave mr-2 text-primary opacity-50"></i>
                      Informasi Pembiayaan
                    </h5>
                    <p className="text-muted small">Detail mengenai status pembiayaan dan beasiswa (jika ada).</p>
                  </Col>
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                      <Card.Body className="p-4">
                        <Row className="g-4">
                          <Col md={inputBeasiswa ? 6 : 12}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                Status Pembiayaan <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                value={statusPembiayaan}
                                onChange={handleStatusPembiayaan}
                                isInvalid={!!errors.statusPembiayaan}
                                style={{ borderRadius: '10px', height: '48px' }}
                              >
                                <option value="">Pilih Status Pembiayaan</option>
                                <option value="mandiri">Mandiri</option>
                                <option value="beasiswa">Beasiswa</option>
                                <option value="swasta">Swasta</option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">{errors.statusPembiayaan?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          {inputBeasiswa && (
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                  Beasiswa <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                  value={beasiswa}
                                  onChange={(e) => setBeasiswa(e.target.value)}
                                  isInvalid={!!errors.beasiswa}
                                  style={{ borderRadius: '10px', height: '48px' }}
                                >
                                  <option value="">Pilih Beasiswa...</option>
                                  <option value="Kemkes">Kemkes</option>
                                  <option value="LPDP">LPDP</option>
                                  <option value="Pemda">Pemda</option>
                                  <option value="TNI">TNI</option>
                                  <option value="POLRI">POLRI</option>
                                  <option value="Dan Lain-lain">Dan Lain-lain</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.beasiswa?.[0]}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          )}

                          {beasiswa === "Dan Lain-lain" && (
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                  Beasiswa Lain-lain
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Sebutkan Beasiswa Lainnya..."
                                  value={beasiswaDll}
                                  onChange={(e) => setBeasiswaDll(e.target.value)}
                                  style={{ borderRadius: '10px', height: '48px' }}
                                />
                              </Form.Group>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Dokumen Section */}
                <Row className="mb-5 align-items-start">
                  <Col lg={4} className="mb-4">
                    <h5 className="font-weight-bold text-dark" style={{ fontSize: '1.25rem' }}>
                      <i className="fas fa-file-upload mr-2 text-primary opacity-50"></i>
                      Dokumen Lampiran
                    </h5>
                    <p className="text-muted small">Unggah dokumen pendukung dalam format PDF atau Gambar (maks. 2MB).</p>
                  </Col>
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                      <Card.Body className="p-4">
                        <Row className="g-4">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="KTP" filePath="ktp" fileUrl={ktpPrev2} required={true} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleKtp(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.ktp}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.ktp?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Akte Lahir" filePath="akte" fileUrl={aktePrev} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleakte(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.akte}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.akte?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Kartu Keluarga" filePath="kartu_keluarga" fileUrl={kartuKeluargaPrev} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleKartuKeluarga(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.kartuKeluarga}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.kartuKeluarga?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Bukti Lulus" filePath="bukti_lulus" fileUrl={buktiLulusPrev} required={true} />
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                  <i className="fas fa-info-circle text-primary ml-1 opacity-50"></i>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleBuktiLulus(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.buktiLulus}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.buktiLulus?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Ijazah Terakhir" filePath="ijazah_terakhir" fileUrl={ijazahTerakhirPrev} required={true} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleIjazahTerakhir(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.ijazahTerakhir}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.ijazahTerakhir?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="SK PNS" filePath="sk_pns" fileUrl={skpnsPrev} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleSkpns(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.skPns}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.skPns?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          {statusPembiayaan === "beasiswa" && (
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                  <DocumentPreview label="SK Penerima Beasiswa" filePath="sk_penerima_beasiswa" fileUrl={skPenerimaBeassiwaPrev} />
                                </Form.Label>
                                <Form.Control
                                  type="file"
                                  onChange={(e) => handleChangeSkPenerimaBeasiswa(e.target.files[0])}
                                  accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                  isInvalid={!!errors.skPenerimaBeassiwa}
                                  style={{ borderRadius: '10px' }}
                                />
                                <Form.Control.Feedback type="invalid">{errors.skPenerimaBeassiwa?.[0]}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          )}

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Bukti Rekomendasi Asal" filePath="bukti_rekomendasi_asal" fileUrl={buktiRekomendasiAsalPrev} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleChangeBuktiRekomendasiAsal(e.target.files[0])}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.buktiRekomendasiAsal}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.buktiRekomendasiAsal?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="STR" filePath="str" fileUrl={strPrev} required={true} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handlestr(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.str}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.str?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="SIP" filePath="sip" fileUrl={sipPrev} required={true} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handlesip(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.sip}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.sip?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="BPJS" filePath="bpjs" fileUrl={bpjsPrev} required={true} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handlebpjs(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.bpjs}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.bpjs?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Pas Foto" filePath="pas_foto" fileUrl={pasFotoPrev} required={true} />
                                <OverlayTrigger placement="top" overlay={<Tooltip>Gunakan foto terbaru dengan jas dokter.</Tooltip>}>
                                  <i className="fas fa-info-circle text-primary ml-1 opacity-50"></i>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handlePasFoto(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.pasFoto}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.pasFoto?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group>
                              <Form.Label className="small font-weight-bold text-muted text-uppercase mb-2">
                                <DocumentPreview label="Nilai TOEFL/EPT" filePath="nilai_toefl" fileUrl={nilaiToeflPrev} required={true} />
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) => handleNilaiToefl(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                isInvalid={!!errors.nilaiToefl}
                                style={{ borderRadius: '10px' }}
                              />
                              <Form.Control.Feedback type="invalid">{errors.nilaiToefl?.[0]}</Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Form Actions Section */}
                <Row className="">
                  <Col lg={{ span: 8, offset: 4 }}>
                    <div className="d-flex gap-3 align-items-center">
                      <button
                        className="btn btn-primary d-flex align-items-center justify-content-center shadow-lg border-0"
                        style={{ borderRadius: '12px', padding: '14px 40px', fontWeight: '600', transition: 'all 0.3s' }}
                        type="submit"
                        disabled={loading || loadingUpload}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mr-2" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                      <a
                        href="/dashboard"
                        className="btn btn-link text-muted font-weight-bold text-decoration-none"
                        style={{ fontSize: '0.95rem' }}
                      >
                        Batal
                      </a>
                    </div>
                  </Col>
                </Row>
              </div>
            </Form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Biodata;
