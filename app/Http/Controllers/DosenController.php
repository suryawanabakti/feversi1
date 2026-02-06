<?php

namespace App\Http\Controllers;

use App\Exports\DosenExport;
use App\Models\Dosen;
use App\Models\DosenSkJabatan;
use App\Models\DosenTempatKerja;
use App\Models\RumahSakit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class DosenController extends Controller
{
    public function export(Request $request)
    {
        $prodiId = $request->get('prodi_id');

        return Excel::download(
            new DosenExport($prodiId),
            'dosen-'.now()->format('Y-m-d').'.xlsx'
        );
    }

    public function deleteSkJabatan($id)
    {
        DosenSkJabatan::destroy($id);
    }

    public function addSkjabatan(Request $request, $id)
    {

        $request->validate([
            'jabatanStruktural' => 'required',
            'file' => 'required|max:5000',
        ]);

        if ($request->file) {
            $imageName = time().'.'.$request->file->extension();
            $request->file->move(public_path('dosen/skjabatan'), $imageName);
        }

        DosenSkJabatan::create([
            'dosen_id' => $id,
            'jabatan_struktural' => $request->jabatanStruktural,
            'file' => $imageName,
        ]);

        return $request;
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|max:255',
            'jenisKelamin' => 'required|max:255',
            'alamat' => 'required|max:255',
            'nomorHp' => 'required|numeric',
            'tanggalLahir' => 'required|max:255',
            'nomorRekening' => 'required|numeric',
            'namaBank' => 'required|max:255',
            'nik' => 'required|numeric|min_digits:16',
            'nip' => 'required|max:255',
            'golongan' => 'required|max:255',
            'jabatanFungsional' => 'required|max:255',
            'npwp' => 'required|max:255',
            'email' => 'required|max:255|email',
            'tempatKerja' => 'required',
            'tempatKerjaLainnya' => 'max:255',
            'typeNomor' => 'required',
            'nomor' => 'required',
        ]);

        $dosen = Dosen::find($id);

        if ($request->ktp) {
            $imageName = time().'.'.$request->ktp->extension();
            $request->ktp->move(public_path('dosen/ktp'), $imageName);
            $filePath = public_path('dosen/ktp');
            $currentImage = $dosen->ktp;
            if (file_exists($filePath.$currentImage)) {
                @unlink($filePath.$currentImage);
            }
        }

        if ($request->skpns) {
            $skpnsName = time().'.'.$request->skpns->extension();
            $request->skpns->move(public_path('dosen/skpns'), $skpnsName);
            $filePath = public_path('dosen/skpns');
            $currentImage = $dosen->sk_pns;
            if (file_exists($filePath.$currentImage)) {
                @unlink($filePath.$currentImage);
            }
        }

        Dosen::where('id', $id)->update([
            'name' => $request->name,
            'nama_bank' => $request->namaBank ?? 'BNI',
            'jenis_kelamin' => $request->jenisKelamin,
            'prodi_id' => auth()->user()->prodi->id,
            'alamat' => $request->alamat,
            'no_hp' => $request->nomorHp,
            'no_rekening' => $request->nomorRekening,
            'tanggal_lahir' => $request->tanggalLahir,
            'nik' => $request->nik,
            'nip' => $request->nip,
            'golongan' => $request->golongan,
            'jabatan_fungsional' => $request->jabatanFungsional,
            'jabatan_struktural' => $request->jabatanStruktural ?? null,
            'type_nomor' => $request->typeNomor,
            'nomor' => $request->nomor,
            'npwp' => $request->npwp,
            'email' => $request->email,
            'ktp' => $imageName ?? $dosen->ktp,
            'sk_pns' => $skpnsName ?? $dosen->sk_pns,
        ]);

        DosenTempatKerja::where('dosen_id', $id)->delete();
        $tempatKerjas = json_decode($request->tempatKerja);

        foreach ($tempatKerjas as $tempatKerja) {
            DosenTempatKerja::create([
                'dosen_id' => $dosen->id,
                'name' => $tempatKerja->name,
            ]);
        }

        return Dosen::find($id);
    }

    public function index($prodi)
    {
        if ($prodi == 'semua') {
            if (auth()->user()->roles[0]->name === 'admin') {
                return Dosen::orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC')->paginate(10);
            } else {
                return Dosen::where('prodi_id', auth()->user()->prodi->id)->orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC')->paginate(10);
            }
        } else {
            if (auth()->user()->roles[0]->name === 'admin') {
                return Dosen::where('prodi_id', $prodi)->orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC')->paginate(10);
            } else {
                return Dosen::where('prodi_id', $prodi)->where('prodi_id', auth()->user()->prodi->id)->orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC')->paginate(10);
            }
        }
    }

    public function index2($prodi, Request $request)
    {
        if ($request->page) {
            $request['page'] = $request->page;
        }

        if ($prodi == 'semua') {
            if (auth()->user()->roles[0]->name === 'admin') {
                $dosen = Dosen::orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC');
                if ($request->term) {
                    $dosen->where('name', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('nomor', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('type_nomor', 'LIKE', '%'.$request->term.'%');
                }
            } else {
                $dosen = Dosen::where('prodi_id', auth()->user()->prodi->id)->orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC');
                if ($request->term) {
                    $dosen->where('name', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('nomor', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('type_nomor', 'LIKE', '%'.$request->term.'%');
                }
            }
        } else {
            if (auth()->user()->roles[0]->name === 'admin') {
                $dosen = Dosen::where('prodi_id', $prodi)->orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC');
                if ($request->term) {
                    $dosen->where('name', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('nomor', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('type_nomor', 'LIKE', '%'.$request->term.'%');
                }
            } else {
                $dosen = Dosen::where('prodi_id', $prodi)->where('prodi_id', auth()->user()->prodi->id)->orderBy('type_nomor', 'ASC')->orderBy('name', 'ASC');
                if ($request->term) {
                    $dosen->where('name', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('nomor', 'LIKE', '%'.$request->term.'%')
                        ->orWhere('type_nomor', 'LIKE', '%'.$request->term.'%');
                }
            }
        }

        return $dosen->paginate(10);
    }

    public function show($id)
    {
        $dosen = Dosen::with('tempatkerja', 'prodi', 'skjabatan')->where('id', $id)->first();
        if (auth()->user()->roles[0]->name === 'prodi') {
            if ($dosen->prodi->id !== auth()->user()->prodi->id) {
                return 'error';
            }
        }

        return $dosen;
    }

    public function getRumahSakitById($id)
    {
        return RumahSakit::find($id);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',
            'jenisKelamin' => 'required|max:255',
            'alamat' => 'required|max:255',
            'nomorHp' => 'required|numeric',
            'tanggalLahir' => 'required|date',
            'nomorRekening' => 'required|numeric',
            'namaBank' => 'required|max:255',
            'nik' => 'required|digits:16',
            'nip' => 'required|max:255',
            'golongan' => 'required|max:255',
            'jabatanFungsional' => 'required|max:255',
            'npwp' => 'required|max:255',
            'email' => 'required|email|max:255',
            'tempatKerja' => 'required|json',
            'tempatKerjaLainnya' => 'nullable|max:255',
            'typeNomor' => 'required',
            'nomor' => 'required',

            'ktp' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5000',
            'skpns' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5000',
        ]);

        // Simpan file KTP dan SK PNS
        $ktpPath = $request->file('ktp')?->storeAs('dosen/ktp', 'ktp_'.time().'_'.Str::random(4).'.'.$request->file('ktp')->extension());
        $skpnsPath = $request->file('skpns')?->storeAs('dosen/skpns', 'skpns_'.time().'_'.Str::random(4).'.'.$request->file('skpns')->extension());

        $dosen = Dosen::create([
            'name' => $request->name,
            'jenis_kelamin' => $request->jenisKelamin,
            'prodi_id' => auth()->user()->prodi->id,
            'alamat' => $request->alamat,
            'no_hp' => $request->nomorHp,
            'tanggal_lahir' => $request->tanggalLahir,
            'no_rekening' => $request->nomorRekening,
            'nama_bank' => $request->namaBank ?? 'BNI',
            'nik' => $request->nik,
            'nip' => $request->nip,
            'golongan' => $request->golongan,
            'jabatan_fungsional' => $request->jabatanFungsional,
            'jabatan_struktural' => $request->jabatanStruktural ?? null,
            'type_nomor' => $request->typeNomor,
            'nomor' => $request->nomor,
            'npwp' => $request->npwp,
            'email' => $request->email,
            'ktp' => $ktpPath,
            'sk_pns' => $skpnsPath,
        ]);

        // Simpan tempat kerja (dari JSON)
        $tempatKerjas = json_decode($request->tempatKerja);
        foreach ($tempatKerjas as $tk) {
            DosenTempatKerja::create([
                'dosen_id' => $dosen->id,
                'name' => $tk->name,
            ]);
        }

        return $dosen;
    }

    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pilihan) {
            Dosen::destroy($pilihan);
        }
    }
}
