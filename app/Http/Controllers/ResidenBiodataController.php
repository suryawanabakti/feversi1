<?php

namespace App\Http\Controllers;

use App\Http\Resources\SelectProdiResource;
use App\Models\Prodi;
use App\Models\ResidenBiodata;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidenBiodataController extends Controller
{
    //
    public function index()
    {
        return ResidenBiodata::with('prodi')->where('user_id', auth()->id())->first();
    }

    public function getProdi()
    {
        return SelectProdiResource::collection(Prodi::all());
    }


    public function uploadKtp(Request $request)
    {
        return $this->uploadDokumen($request, 'ktp', 'ktp', 'ktp');
    }

    public function uploadBuktiLulus(Request $request)
    {
        return $this->uploadDokumen($request, 'buktiLulus', 'buktilulus', 'bukti_lulus');
    }

    public function uploadIjazahTerakhir(Request $request)
    {
        return $this->uploadDokumen($request, 'ijazahTerakhir', 'ijazahterakhir', 'ijazah_terakhir');
    }

    public function uploadAkte(Request $request)
    {
        return $this->uploadDokumen($request, 'akte', 'akte', 'akte');
    }

    public function uploadSkpns(Request $request)
    {
        return $this->uploadDokumen($request, 'skPns', 'skpns', 'sk_pns');
    }

    public function uploadSkPenerimaBeasiswa(Request $request)
    {
        return $this->uploadDokumen($request, 'skPenerimaBeassiwa', 'skpenerimabeasiswa', 'sk_penerima_beasiswa');
    }

    public function uploadStr(Request $request)
    {
        return $this->uploadDokumen($request, 'str', 'str', 'str');
    }

    public function uploadSip(Request $request)
    {
        return $this->uploadDokumen($request, 'sip', 'sip', 'sip');
    }

    public function uploadBpjs(Request $request)
    {
        return $this->uploadDokumen($request, 'bpjs', 'bpjs', 'bpjs');
    }

    public function uploadPasFoto(Request $request)
    {
        return $this->uploadDokumen($request, 'pasFoto', 'pasfoto', 'pas_foto');
    }

    public function uploadNilaiToefl(Request $request)
    {
        return $this->uploadDokumen($request, 'nilaiToefl', 'nilaitoefl', 'nilai_toefl');
    }

    public function uploadKartuKeluarga(Request $request)
    {
        return $this->uploadDokumen($request, 'kartuKeluarga', 'kartukeluarga', 'kartu_keluarga');
    }

    public function uploadBuktiRekomendasiAsal(Request $request)
    {
        return $this->uploadDokumen($request, 'buktiRekomendasiAsal', 'buktirekomendasiasal', 'bukti_rekomendasi_asal');
    }



    private function uploadDokumen(Request $request, string $fieldName, string $folder, string $dbField)
    {
        $residen = ResidenBiodata::where('user_id', auth()->id())->firstOrFail();

        $request->validate([
            $fieldName => 'required|mimes:pdf,jpg,jpeg,png|max:5000',
        ]);

        if ($request->hasFile($fieldName)) {
            $file = $request->file($fieldName);
            $fileName = time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs("$folder", $fileName); // simpan ke storage/app/...

            // Hapus file lama jika ada
            if ($residen->$dbField && Storage::exists("$folder/" . $residen->$dbField)) {
                Storage::delete("$folder/" . $residen->$dbField);
            }

            // Update database
            $residen->update([
                $dbField => $fileName
            ]);

            return response()->json([
                'message' => "Upload $fieldName berhasil",
                'data' => $residen
            ], 200);
        }

        return response()->json([
            'message' => 'File tidak ditemukan'
        ], 400);
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255|string',
            'prodiId' => 'required|numeric',
            'alamat' => 'required',
            'ipk' => 'required|numeric|max:4.00',
            "jenisKelamin" => 'required',
            "nik" => 'required|max:255',
            "tahunMasuk" => 'required|max:255',
            "semester" => 'required|max:255',
            "noHp" => 'required|numeric',
            "tanggalLahir" => 'required|date_format:Y-m-d|max:255',
            "noRekening" => 'max:255',
            "npwp" => 'max:255',
            "email" => 'max:255',
            "rekomendasiAsal" => 'required|max:255',
            "asalFk" => 'required|max:255',
            "akreditasi" => 'required|max:2',
            "tempatKerjaSebelumnya" => 'max:255',
            "statusPembiayaan" => 'required|max:255',
            'provinsiId' => 'required',
            'kabupatenId' => 'required',
            'ktp' => 'required',
            'buktiLulus' => 'required',
            'ijazahTerakhir' => 'required',
            'str' => 'required',
            'str' => 'required',
            'sip' => 'required',
            'bpjs' => 'required',
            'pasFoto' => 'required',
            'nilaiToefl' => 'required',
        ]);


        User::find(auth()->id())->update([
            'name' => $request->name
        ]);

        $insert = [
            "alamat" => $request->alamat,
            "prodi_id" => $request->prodiId,
            "alamat" => $request->alamat,
            "jenis_kelamin" => $request->jenisKelamin,
            "nik" => $request->nik,
            "tahunmasuk" => $request->tahunMasuk,
            "semester" => $request->semester,
            "no_hp" => $request->noHp,
            "tanggal_lahir" => $request->tanggalLahir,
            "no_rekening" => $request->noRekening,
            "npwp" => $request->npwp,
            "email" => $request->email,
            "asal_fk" => $request->asalFk,
            "akreditasi" => $request->akreditasi,
            "tempat_kerja_sebelumnya" => $request->tempatKerjaSebelumnya,
            "status_pembiyaan" => $request->statusPembiayaan,
            "provinsi_id" => $request->provinsiId,
            "kabupaten_id" => $request->kabupatenId,
            "kecamatan_id" => $request->kecamatanId ?? null,
            "ipk" => $request->ipk,

        ];


        if ($request->statusPembiayaan == 'beasiswa') {
            $request->validate([
                'beasiswa' => 'required'
            ]);
            $insert['beasiswa'] = $request->beasiswa;

            $insert['beasiswa_dll'] = $request->beasiswaDll ?? '-';
        }

        ResidenBiodata::where('user_id', auth()->id())->update($insert);

        return ResidenBiodata::where('user_id', auth()->id())->first();
    }
}
