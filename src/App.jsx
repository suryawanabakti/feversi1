import Login from "./pages/auth/Login";
import { Routes, Route } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayouts";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import Residen from "./pages/admin/residen/Residen";
import Prodi from "./pages/admin/prodi/Prodi";
import Biodata from "./pages/residen/biodata/Biodata";
import Proposal from "./pages/residen/proposal/Proposal";
import CreateStase from "./pages/prodi/stase/Create";
import Stase from "./pages/prodi/stase/Stase";
import RumahSakit from "./pages/admin/rumahsakit/RumahSakit";
import Krs from "./pages/residen/krs/Krs";
import Khs from "./pages/residen/khs/Khs";
import Spp from "./pages/residen/spp/Spp";
import BeritaAcaraUjian from "./pages/residen/berita-acara-ujian/BeritaAcaraUjian";
import ResidenBiodata from "./pages/admin/residen/ResidenBiodata";

import Abstrak from "./pages/residen/abstrak/Abstrak";
import ShowStase from "./pages/prodi/stase/Show";
import ShowKhs from "./pages/admin/residen/ShowKhs";
import ShowKrs from "./pages/admin/residen/ShowKrs";
import ShowSpp from "./pages/admin/residen/ShowSpp";
import ShowBau from "./pages/admin/residen/ShowUjian";

import ChangePassword from "./pages/settings/ChangePassword";
import Alumni from "./pages/admin/alumni/Alumni";
import AlumniBiodata from "./pages/admin/alumni/AlumniBiodata";
import Dosen from "./pages/prodi/dosen/Dosen";
import CreateDosen from "./pages/prodi/dosen/Create";
import Prestasi from "./pages/residen/prestasi/Prestasi";
import ShowDosen from "./pages/prodi/dosen/Show";
import LaporanProvinsi from "./pages/admin/report/provinsi/LaporanProvinsi";
import ShowLaporanProvinsi from "./pages/admin/report/provinsi/ShowLaporanProvinsi";

import LaporanKabupaten from "./pages/admin/report/kabupaten/LaporanKabupaten";
import ShowLaporanKabupaten from "./pages/admin/report/kabupaten/ShowLaporanKabupaten";

import TracerAlumniLaporanKabupaten from "./pages/admin/report/tracer-alumni/TracerAlumniLaporanKabupaten";
import TracerAlumniShowLaporanKabupaten from "./pages/admin/report/tracer-alumni/TracerAlumniShowLaporanKabupaten";

import Maps from "./pages/settings/Maps";
import Index from "./pages/admin/kabupaten/Index";
import LaporanStase from "./pages/admin/report/stase/LaporanStase";
import ShowPrestasi from "./pages/admin/residen/ShowPrestasi";
import ShowAbstrak from "./pages/admin/residen/ShowAbstrak";
import UsersIndex from "./pages/admin/users/Index";
import Bagan from "./pages/admin/bagan/Bagan";
import LaporanProdi from "./pages/admin/report/prodi/LaporanProdi";
import Format from "./pages/residen/format/Format";
import SkJabatan from "./pages/prodi/dosen/SkJabatan";
import ShowSerkom from "./pages/admin/residen/ShowSerkom";
import EditStase from "./pages/prodi/stase/Edit";
import Tahun from "./pages/admin/tahun/Tahun";
import Serkom from "./pages/residen/serkom/Serkom";
import AdminPrestasi from "./pages/admin/prestasi/Prestasi";
import StrSip from "./pages/admin/strsip/StrSip";
import LaporanDosen from "./pages/admin/report/dosen/LaporanDosen";
import ShowLaporanDosen from "./pages/admin/report/dosen/ShowLaporanDosen";
import LaporanResiden from "./pages/admin/report/residen/LaporanResiden";
import ShowLaporanResiden from "./pages/admin/report/residen/ShowLaporanResiden";
import Pengaduan from "./pages/admin/pengaduan/Pengaduan";
import ShowPengaduan from "./pages/admin/pengaduan/ShowPengaduan";
import ResidenPengaduan from "./pages/residen/pengaduan/ResidenPengaduan";
import CreatePengaduan from "./pages/residen/pengaduan/CreatePengaduan";
import EditPengaduan from "./pages/residen/pengaduan/EditPengaduan";
import Konseling from "./pages/admin/konseling/Konseling";
import ShowKonseling from "./pages/admin/konseling/ShowKonseling";
import ResidenKonseling from "./pages/residen/konseling/ResidenKonseling";
import EditKonseling from "./pages/residen/konseling/EditKonseling";
import CreateKonseling from "./pages/residen/konseling/CreateKonseling";

import Informasi from "./pages/admin/informasi/Informasi";
import ShowInformasi from "./pages/admin/informasi/ShowInformasi";
import ResidenInformasi from "./pages/residen/informasi/ResidenInformasi";
import CreateInformasi from "./pages/residen/informasi/CreateInformasi";
import EditInformasi from "./pages/residen/informasi/EditInformasi";
import LewatMasaStudi from "./pages/admin/lewat-masa-studi/LewatMasaStudi";
import ReportBeritaAcaraUjian from "./pages/admin/berita-acara-ujian/ReportBeritaAcaraUjian";
import ResidenExit from "./pages/prodi/residen-exit/ResidenExit";
import LaporanResidenExit from "./pages/admin/report/residen-exit/LaporanResidenExit";
import PelanggaranManagement from "./pages/prodi/pelanggaran/PelanggaranManagement";
import PelanggaranResidenManagement from "./pages/prodi/pelanggaran-residen/PelanggaranResidenManagement";
import ResidenComparison from "./pages/admin/comparison/ResidenComparison";
import DosenComparison from "./pages/admin/comparison/DosenComparison";
import LaporanStaseProdi from "./pages/admin/report/stase/LaporanStaseProdi";

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Admin */}
        {/* Settings */}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/tahun" element={<Tahun />} />
        <Route path="/users" element={<UsersIndex />} />
        <Route path="/bagan" element={<Bagan />} />

        <Route path="/residen" element={<Residen />} />
        <Route path="/residen/serkom/:id" element={<ShowSerkom />} />
        <Route path="/residen/khs/:id" element={<ShowKhs />} />
        <Route path="/residen/krs/:id" element={<ShowKrs />} />
        <Route path="/residen/spp/:id" element={<ShowSpp />} />
        <Route path="/residen/ujian/:id" element={<ShowBau />} />
        <Route path="/residen/prestasi/:id" element={<ShowPrestasi />} />
        <Route path="/residen/abstrak/:id" element={<ShowAbstrak />} />
        <Route path="/residen/biodata/:id" element={<ResidenBiodata />} />
        <Route path="/prodi" element={<Prodi />} />
        <Route path="/rumahsakit" element={<RumahSakit />} />
        <Route path="/kabupaten" element={<Index />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/alumni/biodata/:id" element={<AlumniBiodata />} />
        <Route path="/admin-prestasi" element={<AdminPrestasi />} />

        <Route path="/admin-informasi" element={<Informasi />} />
        <Route path="/admin-informasi/:id" element={<ShowInformasi />} />

        <Route path="/admin-pengaduan" element={<Pengaduan />} />
        <Route path="/admin-pengaduan/:id" element={<ShowPengaduan />} />

        <Route path="/admin-konseling" element={<Konseling />} />
        <Route path="/admin-konseling/:id" element={<ShowKonseling />} />

        <Route path="/residen-informasi" element={<ResidenInformasi />} />
        <Route path="/residen-informasi/create" element={<CreateInformasi />} />
        <Route path="/residen-informasi/:id" element={<EditInformasi />} />

        <Route path="/residen-pengaduan" element={<ResidenPengaduan />} />
        <Route path="/residen-pengaduan/create" element={<CreatePengaduan />} />
        <Route path="/residen-pengaduan/:id" element={<EditPengaduan />} />

        <Route path="/residen-konseling" element={<ResidenKonseling />} />
        <Route path="/residen-konseling/create" element={<CreateKonseling />} />
        <Route path="/residen-konseling/:id" element={<EditKonseling />} />

        <Route path="/str-sip" element={<StrSip />} />
        <Route path="/lewat-masa-studi" element={<LewatMasaStudi />} />
        <Route
          path="/admin-berita-acara-ujian"
          element={<ReportBeritaAcaraUjian />}
        />

        {/* Report  */}
        <Route path="/report-residen" element={<LaporanResiden />} />
        <Route
          path="/report-residen/:statusPembiayaan/:prodiId"
          element={<ShowLaporanResiden />}
        />
        <Route path="/report-prodi" element={<LaporanProdi />} />
        <Route path="/report-stase" element={<LaporanStase />} />
        <Route path="/report-stase-prodi" element={<LaporanStaseProdi />} />
        <Route path="/report-dosen" element={<LaporanDosen />} />
        <Route path="/report-dosen/:type" element={<ShowLaporanDosen />} />

        <Route path="/report-provinsi" element={<LaporanProvinsi />} />
        <Route path="/report-provinsi/:id" element={<ShowLaporanProvinsi />} />

        <Route
          path="/report-provinsi/:provinsi/residen/:id"
          element={<ResidenBiodata />}
        />

        <Route path="/report-kabupaten" element={<LaporanKabupaten />} />
        <Route
          path="/report-kabupaten/:id"
          element={<ShowLaporanKabupaten />}
        />

        <Route
          path="/report-tracer-alumni"
          element={<TracerAlumniLaporanKabupaten />}
        />
        <Route
          path="/report-tracer-alumni/:id"
          element={<TracerAlumniShowLaporanKabupaten />}
        />

        <Route
          path="/report-kabupaten/:kabupaten/residen/:id"
          element={<ResidenBiodata />}
        />
        <Route path="/report-residen-exit" element={<LaporanResidenExit />} />

        {/* Residen */}
        <Route path="/format" element={<Format />} />
        <Route path="/biodata" element={<Biodata />} />
        <Route path="/krs" element={<Krs />} />
        <Route path="/khs" element={<Khs />} />
        <Route path="/spp" element={<Spp />} />
        <Route path="/proposal" element={<Proposal />} />
        <Route path="/abstrak" element={<Abstrak />} />
        <Route path="/berita-acara-ujian" element={<BeritaAcaraUjian />} />
        <Route path="/prestasi" element={<Prestasi />} />
        <Route path="/serkom" element={<Serkom />} />

        {/* Prodi */}
        <Route path="/stase" element={<Stase />} />
        <Route path="/stase/:id" element={<ShowStase />} />
        <Route path="/stase/edit/:id" element={<EditStase />} />
        <Route path="/stase-create" element={<CreateStase />} />
        <Route path="/dosen" element={<Dosen />} />
        <Route path="/dosen/create" element={<CreateDosen />} />
        <Route path="/dosen/show/:id" element={<ShowDosen />} />
        <Route path="/dosen/sk-jabatan/:id" element={<SkJabatan />} />

        <Route path="/residen-exit" element={<ResidenExit />} />
        <Route path="/pelanggaran" element={<PelanggaranManagement />} />
        <Route
          path="/pelanggaran-residen"
          element={<PelanggaranResidenManagement />}
        />
        <Route path="/report-pelanggaran" element={<PelanggaranManagement />} />
        <Route path="/residen-comparison" element={<ResidenComparison />} />

        <Route path="/dosen-comparison" element={<DosenComparison />} />
      </Route>

      <Route element={<GuestLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/map" element={<Maps />} />
    </Routes>
  );
}

export default App;
