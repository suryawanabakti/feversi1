"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import axios from "../../../api/axios"
import baseurl from "../../../api/baseurl"
import useAuthContext from "../../../context/AuthContext"
import { Spinner, Tooltip, OverlayTrigger } from "react-bootstrap"
import "./biodata-style.css"
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
      formData.append("rekomendasiAsal", rekomendasiAsal)
      asalFk && formData.append("asalFk", asalFk)
      akreditasi && formData.append("akreditasi", akreditasi)
      tempatKerjaSebelumnya && formData.append("tempatKerjaSebelumnya", tempatKerjaSebelumnya)
      statusPembiayaan && formData.append("statusPembiayaan", statusPembiayaan)
      beasiswa && formData.append("beasiswa", beasiswa)
      beasiswaDll && formData.append("beasiswaDll", beasiswaDll)
      provinsi && formData.append("provinsiId", provinsi)
      kabupaten && formData.append("kabupatenId", kabupaten)

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
              <a href="/dashboard">Dashboard</a>
            </div>
            <div className="breadcrumb-item active">Biodata</div>
          </div>
        </div>

        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h4 className="card-title mb-0">
                    <i className="fas fa-user-circle mr-2"></i>
                    Formulir Biodata
                  </h4>
                </div>
                <div className="card-body">
                  {formLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2">Memuat data biodata...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSave}>
                      <div className="row">
                        <div className="col-md-12 mb-4">
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle mr-2"></i>
                            Silakan lengkapi biodata Anda dengan teliti. Kolom bertanda{" "}
                            <span className="text-danger">*</span> wajib diisi.
                          </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="col-md-12 mb-4">
                          <h5 className="section-title">
                            <i className="fas fa-user mr-2"></i>
                            Informasi Pribadi
                          </h5>
                          <hr />
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="name" className="form-label">
                              Nama Lengkap <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              id="name"
                              placeholder="Masukkan Nama Lengkap..."
                              onChange={(e) => setName(e.target.value)}
                              className={`form-control ${errors.name ? "is-invalid" : ""}`}
                              value={name}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="nim" className="form-label">
                              NIM <span className="text-danger">*</span>
                            </label>
                            <input type="text" id="nim" className="form-control" readOnly value={user.username} />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="prodi" className="form-label">
                              Program Studi <span className="text-danger">*</span>
                            </label>
                            <input type="text" id="prodi" className="form-control" value={placeholderProdi} readOnly />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Jenis Kelamin <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex">
                              <div className="custom-control custom-radio mr-4">
                                <input
                                  type="radio"
                                  id="laki-laki"
                                  name="jenisKelamin"
                                  className="custom-control-input"
                                  onClick={() => setJenisKelamin("laki-laki")}
                                  checked={jenisKelamin === "laki-laki"}
                                  onChange={() => { }}
                                />
                                <label className="custom-control-label" htmlFor="laki-laki">
                                  Laki-laki
                                </label>
                              </div>
                              <div className="custom-control custom-radio">
                                <input
                                  type="radio"
                                  id="perempuan"
                                  name="jenisKelamin"
                                  className="custom-control-input"
                                  onClick={() => setJenisKelamin("perempuan")}
                                  checked={jenisKelamin === "perempuan"}
                                  onChange={() => { }}
                                />
                                <label className="custom-control-label" htmlFor="perempuan">
                                  Perempuan
                                </label>
                              </div>
                            </div>
                            {errors.jenisKelamin && (
                              <div className="text-danger small mt-1">{errors.jenisKelamin[0]}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="tahunMasuk" className="form-label">
                              Tahun Masuk <span className="text-danger">*</span>
                            </label>
                            <select
                              id="tahunMasuk"
                              className={`form-control custom-select ${errors.tahunMasuk ? "is-invalid" : ""}`}
                              onChange={(e) => setTahunMasuk(e.target.value)}
                              value={tahunMasuk}
                            >
                              <option value="">Pilih Tahun...</option>
                              {tahunAjaran.map((data) => (
                                <option key={data.id} value={data.tahun_ajaran}>
                                  {data.tahun_ajaran}
                                </option>
                              ))}
                            </select>
                            {errors.tahunMasuk && <div className="invalid-feedback">{errors.tahunMasuk[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="semester" className="form-label">
                              Semester <span className="text-danger">*</span>
                            </label>
                            <select
                              id="semester"
                              className={`form-control custom-select ${errors.semester ? "is-invalid" : ""}`}
                              onChange={(e) => setSemester(e.target.value)}
                              value={semester}
                            >
                              <option value="">Pilih Semester...</option>
                              <option value="Awal / Juli - Desember">Awal / Juli - Desember</option>
                              <option value="Akhir / Januari - Juni">Akhir / Januari - Juni</option>
                            </select>
                            {errors.semester && <div className="invalid-feedback">{errors.semester[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="tanggalLahir" className="form-label">
                              Tanggal Lahir <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              id="tanggalLahir"
                              className={`form-control ${errors.tanggalLahir ? "is-invalid" : ""}`}
                              value={tanggalLahir}
                              onChange={(e) => setTanggalLahir(e.target.value)}
                            />
                            {errors.tanggalLahir && <div className="invalid-feedback">{errors.tanggalLahir[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="nomorHp" className="form-label">
                              Nomor HP <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              id="nomorHp"
                              placeholder="Masukkan Nomor HP..."
                              className={`form-control ${errors.noHp ? "is-invalid" : ""}`}
                              value={nomorHp}
                              onChange={(e) => setNomorHp(e.target.value)}
                            />
                            {errors.noHp && <div className="invalid-feedback">{errors.noHp[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="email" className="form-label">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              placeholder="Masukkan Email..."
                              className={`form-control ${errors.email ? "is-invalid" : ""}`}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="nik" className="form-label">
                              NIK <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              id="nik"
                              placeholder="Masukkan NIK..."
                              className={`form-control ${errors.nik ? "is-invalid" : ""}`}
                              value={nik}
                              onChange={(e) => setNik(e.target.value)}
                            />
                            {errors.nik && <div className="invalid-feedback">{errors.nik[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="npwp" className="form-label">
                              NPWP
                            </label>
                            <input
                              type="text"
                              id="npwp"
                              className={`form-control ${errors.npwp ? "is-invalid" : ""}`}
                              value={npwp}
                              placeholder="Masukkan NPWP..."
                              onChange={(e) => setNpwp(e.target.value)}
                            />
                            {errors.npwp && <div className="invalid-feedback">{errors.npwp[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="nomorRekening" className="form-label">
                              Nomor Rekening
                            </label>
                            <input
                              type="text"
                              id="nomorRekening"
                              placeholder="Masukkan Nomor Rekening..."
                              className={`form-control ${errors.noRekening ? "is-invalid" : ""}`}
                              value={nomorRekening}
                              onChange={(e) => setNomorRekening(e.target.value)}
                            />
                            {errors.noRekening && <div className="invalid-feedback">{errors.noRekening[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="alamat" className="form-label">
                              Alamat <span className="text-danger">*</span>
                            </label>
                            <textarea
                              id="alamat"
                              onChange={(e) => setAlamat(e.target.value)}
                              placeholder="Masukkan Alamat..."
                              value={alamat}
                              rows="4"
                              className={`form-control ${errors.alamat ? "is-invalid" : ""}`}
                            ></textarea>
                            {errors.alamat && <div className="invalid-feedback">{errors.alamat[0]}</div>}
                          </div>
                        </div>

                        {/* Education Information Section */}
                        <div className="col-md-12 mb-4 mt-4">
                          <h5 className="section-title">
                            <i className="fas fa-graduation-cap mr-2"></i>
                            Informasi Pendidikan
                          </h5>
                          <hr />
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="asalFk" className="form-label">
                              Asal Fakultas Kedokteran <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              id="asalFk"
                              className={`form-control ${errors.asalFk ? "is-invalid" : ""}`}
                              value={asalFk}
                              placeholder="Masukkan Asal FK..."
                              onChange={(e) => setAsalFk(e.target.value)}
                            />
                            {errors.asalFk && <div className="invalid-feedback">{errors.asalFk[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="akreditasi" className="form-label">
                              Akreditasi <span className="text-danger">*</span>
                            </label>
                            <select
                              id="akreditasi"
                              className={`form-control custom-select ${errors.akreditasi ? "is-invalid" : ""}`}
                              onChange={(e) => setAkreditasi(e.target.value)}
                              value={akreditasi}
                            >
                              <option value="">Pilih Akreditasi</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                            {errors.akreditasi && <div className="invalid-feedback">{errors.akreditasi[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="ipk" className="form-label">
                              IPK <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              id="ipk"
                              className={`form-control ${errors.ipk ? "is-invalid" : ""}`}
                              value={ipk}
                              placeholder="0.00"
                              onChange={(e) => setIpk(e.target.value)}
                            />
                            {errors.ipk && <div className="invalid-feedback">{errors.ipk[0]}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="tempatKerjaSebelumnya" className="form-label">
                              Tempat Kerja Sebelumnya
                            </label>
                            <input
                              type="text"
                              id="tempatKerjaSebelumnya"
                              className={`form-control ${errors.tempatKerjaSebelumnya ? "is-invalid" : ""}`}
                              value={tempatKerjaSebelumnya}
                              placeholder="Masukkan tempat kerja sebelumnya..."
                              onChange={(e) => setTempatKerjaSebelumnya(e.target.value)}
                            />
                            {errors.tempatKerjaSebelumnya && (
                              <div className="invalid-feedback">{errors.tempatKerjaSebelumnya[0]}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="form-label">
                              Rekomendasi Asal <span className="text-danger">*</span>
                            </label>
                            <div className="row">
                              <div className="col-md-6">
                                <select
                                  name="provinsi"
                                  id="provinsi"
                                  className={`form-control custom-select mb-2 ${errors.provinsiId ? "is-invalid" : ""}`}
                                  onChange={(e) => handleChangeProvinsi(e.target.value)}
                                  value={provinsi || ""}
                                >
                                  <option value="">{namaPropinsi ? namaPropinsi : "Pilih Provinsi"}</option>
                                  {dataProvinsi.map((data) => (
                                    <option value={data.id} key={data.id}>
                                      {data.nama}
                                    </option>
                                  ))}
                                </select>
                                {errors.provinsiId && <div className="invalid-feedback">{errors.provinsiId[0]}</div>}
                              </div>
                              <div className="col-md-6">
                                <select
                                  name="kabupaten"
                                  id="kabupaten"
                                  className={`form-control custom-select ${errors.kabupatenId ? "is-invalid" : ""}`}
                                  onChange={(e) => handleChangeKabupaten(e.target.value)}
                                  value={kabupaten || ""}
                                >
                                  <option id="kabupatenUbah" value="">
                                    {namaKabupaten ? namaKabupaten : "Pilih Kabupaten"}
                                  </option>
                                  {dataKabupaten.map((data) => (
                                    <option value={data.id} key={data.id}>
                                      {data.nama}
                                    </option>
                                  ))}
                                </select>
                                {errors.kabupatenId && <div className="invalid-feedback">{errors.kabupatenId[0]}</div>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financing Information Section */}
                        <div className="col-md-12 mb-4 mt-4">
                          <h5 className="section-title">
                            <i className="fas fa-money-bill-wave mr-2"></i>
                            Informasi Pembiayaan
                          </h5>
                          <hr />
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="statusPembiayaan" className="form-label">
                              Status Pembiayaan <span className="text-danger">*</span>
                            </label>
                            <select
                              id="statusPembiayaan"
                              className={`form-control custom-select ${errors.statusPembiayaan ? "is-invalid" : ""}`}
                              value={statusPembiayaan}
                              onChange={handleStatusPembiayaan}
                            >
                              <option value="">Pilih Status Pembiayaan</option>
                              <option value="mandiri">Mandiri</option>
                              <option value="beasiswa">Beasiswa</option>
                              <option value="swasta">Swasta</option>
                            </select>
                            {errors.statusPembiayaan && (
                              <div className="invalid-feedback">{errors.statusPembiayaan[0]}</div>
                            )}
                          </div>
                        </div>

                        {inputBeasiswa && (
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="beasiswa" className="form-label">
                                Beasiswa <span className="text-danger">*</span>
                              </label>
                              <select
                                id="beasiswa"
                                className={`form-control custom-select ${errors.beasiswa ? "is-invalid" : ""}`}
                                value={beasiswa}
                                onChange={(e) => setBeasiswa(e.target.value)}
                              >
                                <option value="Kemkes">Kemkes</option>
                                <option value="LPDP">LPDP</option>
                                <option value="Pemda">Pemda</option>
                                <option value="TNI">TNI</option>
                                <option value="POLRI">POLRI</option>
                                <option value="Dan Lain-lain">Dan Lain-lain</option>
                              </select>
                              {errors.beasiswa && <div className="invalid-feedback">{errors.beasiswa[0]}</div>}
                            </div>
                          </div>
                        )}

                        {beasiswa === "Dan Lain-lain" && (
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="beasiswaDll" className="form-label">
                                Beasiswa Lain-lain
                              </label>
                              <input
                                type="text"
                                id="beasiswaDll"
                                className="form-control"
                                value={beasiswaDll}
                                onChange={(e) => setBeasiswaDll(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {/* Document Upload Section */}
                        <div className="col-md-12 mb-4 mt-4">
                          <h5 className="section-title">
                            <i className="fas fa-file-upload mr-2"></i>
                            Dokumen
                          </h5>
                          <hr />
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="ktp" className="form-label">
                              <DocumentPreview label="KTP" filePath="ktp" fileUrl={ktpPrev2} required={true} />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.ktp ? "is-invalid" : ""}`}
                                id="ktp"
                                onChange={(e) => handleKtp(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="ktp">
                                {ktp ? ktp.name : "Pilih file..."}
                              </label>
                              {errors.ktp && <div className="invalid-feedback">{errors.ktp[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="akte" className="form-label">
                              <DocumentPreview label="Akte Lahir" filePath="akte" fileUrl={aktePrev} />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.akte ? "is-invalid" : ""}`}
                                id="akte"
                                onChange={(e) => handleakte(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="akte">
                                {akte ? akte.name : "Pilih file..."}
                              </label>
                              {errors.akte && <div className="invalid-feedback">{errors.akte[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="kartuKeluarga" className="form-label">
                              <DocumentPreview
                                label="Kartu Keluarga"
                                filePath="kartu_keluarga"
                                fileUrl={kartuKeluargaPrev}
                              />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.kartuKeluarga ? "is-invalid" : ""}`}
                                id="kartuKeluarga"
                                onChange={(e) => handleKartuKeluarga(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="kartuKeluarga">
                                {kartuKeluarga ? kartuKeluarga.name : "Pilih file..."}
                              </label>
                              {errors.kartuKeluarga && (
                                <div className="invalid-feedback">{errors.kartuKeluarga[0]}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="buktiLulus" className="form-label">
                              <DocumentPreview
                                label="Bukti Lulus"
                                filePath="bukti_lulus"
                                fileUrl={buktiLulusPrev}
                                required={true}
                              />
                              <OverlayTrigger
                                placement="right"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltip}
                              >
                                <i className="fas fa-info-circle text-info ml-1"></i>
                              </OverlayTrigger>
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.buktiLulus ? "is-invalid" : ""}`}
                                id="buktiLulus"
                                onChange={(e) => handleBuktiLulus(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="buktiLulus">
                                {buktiLulus ? buktiLulus.name : "Pilih file..."}
                              </label>
                              {errors.buktiLulus && <div className="invalid-feedback">{errors.buktiLulus[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="ijazahTerakhir" className="form-label">
                              <DocumentPreview
                                label="Ijazah Terakhir"
                                filePath="ijazah_terakhir"
                                fileUrl={ijazahTerakhirPrev}
                                required={true}
                              />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.ijazahTerakhir ? "is-invalid" : ""}`}
                                id="ijazahTerakhir"
                                onChange={(e) => handleIjazahTerakhir(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="ijazahTerakhir">
                                {ijazahTerakhir ? ijazahTerakhir.name : "Pilih file..."}
                              </label>
                              {errors.ijazahTerakhir && (
                                <div className="invalid-feedback">{errors.ijazahTerakhir[0]}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="skpns" className="form-label">
                              <DocumentPreview label="SK PNS" filePath="sk_pns" fileUrl={skpnsPrev} />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.skPns ? "is-invalid" : ""}`}
                                id="skpns"
                                onChange={(e) => handleSkpns(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="skpns">
                                {skpns ? skpns.name : "Pilih file..."}
                              </label>
                              {errors.skPns && <div className="invalid-feedback">{errors.skPns[0]}</div>}
                            </div>
                          </div>
                        </div>

                        {statusPembiayaan === "beasiswa" && (
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="skPenerimaBeasiswa" className="form-label">
                                <DocumentPreview
                                  label="SK Penerima Beasiswa"
                                  filePath="sk_penerima_beasiswa"
                                  fileUrl={skPenerimaBeassiwaPrev}
                                />
                              </label>
                              <div className="custom-file">
                                <input
                                  type="file"
                                  className={`custom-file-input ${errors.skPenerimaBeassiwa ? "is-invalid" : ""}`}
                                  id="skPenerimaBeasiswa"
                                  onChange={(e) => handleChangeSkPenerimaBeasiswa(e.target.files[0])}
                                  accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                  disabled={loadingUpload}
                                />
                                <label className="custom-file-label" htmlFor="skPenerimaBeasiswa">
                                  {skPenerimaBeassiwa ? skPenerimaBeassiwa.name : "Pilih file..."}
                                </label>
                                {errors.skPenerimaBeassiwa && (
                                  <div className="invalid-feedback">{errors.skPenerimaBeassiwa[0]}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="buktiRekomendasiAsal" className="form-label">
                              <DocumentPreview
                                label="Bukti Rekomendasi Asal"
                                filePath="bukti_rekomendasi_asal"
                                fileUrl={buktiRekomendasiAsalPrev}
                              />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.buktiRekomendasiAsal ? "is-invalid" : ""}`}
                                id="buktiRekomendasiAsal"
                                onChange={(e) => handleChangeBuktiRekomendasiAsal(e.target.files[0])}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="buktiRekomendasiAsal">
                                {buktiRekomendasiAsal ? buktiRekomendasiAsal.name : "Pilih file..."}
                              </label>
                              {errors.buktiRekomendasiAsal && (
                                <div className="invalid-feedback">{errors.buktiRekomendasiAsal[0]}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="str" className="form-label">
                              <DocumentPreview label="STR" filePath="str" fileUrl={strPrev} required={true} />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.str ? "is-invalid" : ""}`}
                                id="str"
                                onChange={(e) => handlestr(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="str">
                                {str ? str.name : "Pilih file..."}
                              </label>
                              {errors.str && <div className="invalid-feedback">{errors.str[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="sip" className="form-label">
                              <DocumentPreview label="SIP" filePath="sip" fileUrl={sipPrev} required={true} />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.sip ? "is-invalid" : ""}`}
                                id="sip"
                                onChange={(e) => handlesip(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="sip">
                                {sip ? sip.name : "Pilih file..."}
                              </label>
                              {errors.sip && <div className="invalid-feedback">{errors.sip[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="bpjs" className="form-label">
                              <DocumentPreview label="BPJS" filePath="bpjs" fileUrl={bpjsPrev} required={true} />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.bpjs ? "is-invalid" : ""}`}
                                id="bpjs"
                                onChange={(e) => handlebpjs(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="bpjs">
                                {bpjs ? bpjs.name : "Pilih file..."}
                              </label>
                              {errors.bpjs && <div className="invalid-feedback">{errors.bpjs[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="pasFoto" className="form-label">
                              <DocumentPreview
                                label="Pas Foto"
                                filePath="pas_foto"
                                fileUrl={pasFotoPrev}
                                required={true}
                              />
                              <i className="fas fa-info-circle text-info ml-1" title="Foto dengan Jas Dokter"></i>
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.pasFoto ? "is-invalid" : ""}`}
                                id="pasFoto"
                                onChange={(e) => handlePasFoto(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="pasFoto">
                                {pasFoto ? pasFoto.name : "Pilih file..."}
                              </label>
                              {errors.pasFoto && <div className="invalid-feedback">{errors.pasFoto[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="nilaiToefl" className="form-label">
                              <DocumentPreview
                                label="Nilai TOEFL/EPT"
                                filePath="nilai_toefl"
                                fileUrl={nilaiToeflPrev}
                                required={true}
                              />
                            </label>
                            <div className="custom-file">
                              <input
                                type="file"
                                className={`custom-file-input ${errors.nilaiToefl ? "is-invalid" : ""}`}
                                id="nilaiToefl"
                                onChange={(e) => handleNilaiToefl(e)}
                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                disabled={loadingUpload}
                              />
                              <label className="custom-file-label" htmlFor="nilaiToefl">
                                {nilaiToefl ? nilaiToefl.name : "Pilih file..."}
                              </label>
                              {errors.nilaiToefl && <div className="invalid-feedback">{errors.nilaiToefl[0]}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12 mt-4">
                          <div className="form-actions">
                            <button
                              className="btn btn-primary btn-lg"
                              type="submit"
                              onClick={handleSave}
                              disabled={loading || loadingUpload}
                            >
                              {loading ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="mr-2"
                                  />
                                  Menyimpan...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-save mr-2"></i>
                                  Simpan Perubahan
                                </>
                              )}
                            </button>
                            <a href="/dashboard" className="btn btn-light btn-lg ml-2">
                              <i className="fas fa-times mr-2"></i>
                              Batal
                            </a>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Biodata
