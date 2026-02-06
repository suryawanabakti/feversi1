<?php

namespace App\Http\Controllers;

use App\Http\Resources\SelectRumahSakitResource;
use App\Http\Resources\StaseResource;
use App\Http\Resources\UserResidenResource;
use App\Models\ResidenBiodata;
use App\Models\RumahSakit;
use App\Models\Stase;
use App\Models\StaseResiden;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProdiStaseController extends Controller
{
    //
    public function index(Request $request)
    {
        if ($request->tahun && $request->bulan && $request->rsid) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('tahun', $request->tahun)->where('bulan', $request->bulan)->where('rumah_sakit_id', $request->rsid)->get();
        }

        if ($request->tahun && $request->rsid) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('tahun', $request->tahun)->where('rumah_sakit_id', $request->rsid)->get();
        }

        if ($request->bulan && $request->rsid) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('bulan', $request->bulan)->where('rumah_sakit_id', $request->rsid)->get();
        }

        if ($request->tahun && $request->bulan) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('tahun', $request->tahun)->where('bulan', $request->bulan)->get();
        }

        if ($request->tahun) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('tahun', $request->tahun)->get();
        }

        if ($request->bulan) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('bulan', $request->bulan)->get();
        }

        if ($request->rsid) {
            return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->where('rumah_sakit_id', $request->rsid)->get();
        }

        return Stase::with('prodi', 'rumahsakit', 'staseresiden')->where('prodi_id', auth()->user()->prodi->id)->orderBy('created_at', 'desc')->get();
    }

    public function getStaseRs()
    {
        return Stase::with('rumahsakit')->select('rumah_sakit_id')->groupBy('rumah_sakit_id')->where('prodi_id', auth()->user()->prodi->id)->get();
    }

    public function getResiden(Request $request)
    {

        if ($request->pageNumber) {
            $request['page'] = $request->pageNumber;
        }
        $user = ResidenBiodata::with(['user'])
            ->where('prodi_id', auth()->user()->prodi->id)
            ->whereDoesntHave('user.ujian', function ($query) {
                $query->whereIn('semester', ['akhir', 'nasional']);
            })
            ->orderBy('id', 'desc');

        if ($request->term) {
            $user->whereHas('user', function ($query) use ($request) {
                $query->where('username', 'LIKE', "%$request->term%")->orWhere('name', 'LIKE', "%$request->term%");
            });
        }


        $user = UserResidenResource::collection($user->paginate($request->tampilkanData ?? 15));


        return $user;
    }


    public function getRumahSakit()
    {
        return SelectRumahSakitResource::collection(RumahSakit::where('is_active', 1)->get());
    }

    public function update(Request $request, Stase $stase)
    {
        $request->validate([
            'bulan' => 'required',
            'tahun' => 'required',
            'idRumahsakit' => 'required',
            'pilihan' => 'required',
        ]);


        $bulan = 0;

        if ($request->bulan === 'Januari') {
            $bulan = "01";
        }

        if ($request->bulan === 'Februari') {
            $bulan = "02";
        }

        if ($request->bulan === 'Maret') {
            $bulan = "01";
        }

        if ($request->bulan === 'April') {
            $bulan = "04";
        }

        if ($request->bulan === 'Mei') {
            $bulan = "05";
        }

        if ($request->bulan === 'Juni') {
            $bulan = "06";
        }

        if ($request->bulan === 'July') {
            $bulan = "07";
        }

        if ($request->bulan === 'Agustus') {
            $bulan = "08";
        }

        if ($request->bulan === 'September') {
            $bulan = "09";
        }

        if ($request->bulan === 'Oktober') {
            $bulan = "10";
        }

        if ($request->bulan === 'November') {
            $bulan = "11";
        }

        if ($request->bulan === 'Desember') {
            $bulan = "12";
        }

        $date = "$request->tahun-$bulan-01";
        $data = [
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
            'tanggal' => $date,
            'prodi_id' => auth()->user()->prodi->id,
            'rumah_sakit_id' => $request->idRumahsakit,
            'tahap' => $request->tahap,
        ];

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('stase-files', 'public');
        }

        $stase->update($data);

        StaseResiden::where('stase_id', $stase->id)->delete();

        // Persiapkan array untuk batch insert
        $insertData = [];
        $pilihan = json_decode($request->pilihan, true); // true agar hasilnya array asosiatif

        foreach ($pilihan as $pil) {
            $insertData[] = [
                'stase_id' => $stase->id,
                'user_id' => $pil['id'],
                'rumah_sakit_id' => $request->idRumahsakit,
                'bulan' => $request->bulan,
                'tahun' => $request->tahun,
                'tanggal' => $date,
                'tahap' => $pil['tahap'],
                'jam_kerja' => $pil['jam_kerja'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Gunakan insert untuk menambah semua data sekaligus
        StaseResiden::insert($insertData);

        return $request;
    }

    public function store(Request $request)
    {
        $request->validate([
            'bulan' => 'required',
            'tahun' => 'required',
            'idRumahsakit' => 'required',
            'pilihan' => 'required',
        ]);

        $pilihan = json_decode($request->pilihan, true); // true agar hasilnya array asosiatif

        $bulan = 0;

        if ($request->bulan === 'Januari') {
            $bulan = "01";
        }

        if ($request->bulan === 'Februari') {
            $bulan = "02";
        }

        if ($request->bulan === 'Maret') {
            $bulan = "01";
        }

        if ($request->bulan === 'April') {
            $bulan = "04";
        }

        if ($request->bulan === 'Mei') {
            $bulan = "05";
        }

        if ($request->bulan === 'Juni') {
            $bulan = "06";
        }

        if ($request->bulan === 'July') {
            $bulan = "07";
        }

        if ($request->bulan === 'Agustus') {
            $bulan = "08";
        }

        if ($request->bulan === 'September') {
            $bulan = "09";
        }

        if ($request->bulan === 'Oktober') {
            $bulan = "10";
        }

        if ($request->bulan === 'November') {
            $bulan = "11";
        }

        if ($request->bulan === 'Desember') {
            $bulan = "12";
        }

        $date = "$request->tahun-$bulan-01";
        // Handle file upload
        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('stase-files', 'public');
        }

        $stase = Stase::create([
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
            'tanggal' => $date,
            'prodi_id' => auth()->user()->prodi->id,
            'rumah_sakit_id' => $request->idRumahsakit,
            'tahap' => $request->tahap,
            'file' => $filePath,
        ]);


        // Persiapkan array untuk batch insert
        $insertData = [];

        foreach ($pilihan as $pil) {

            $insertData[] = [
                'stase_id' => $stase->id,
                'user_id' => $pil['id'],
                'rumah_sakit_id' => $request->idRumahsakit,
                'bulan' => $request->bulan,
                'tahun' => $request->tahun,
                'tanggal' => $date,
                'tahap' => $pil['tahap'],
                'jam_kerja' => $pil['jam_kerja'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        StaseResiden::insert($insertData);

        return $request;
    }

    public function show($id)
    {
        $stase =  Stase::with('staseresiden', 'staseresiden.user', 'rumahsakit')->where('id', $id)->first();

        return new StaseResource($stase);
    }

    public function export($id)
    {
        $stase = Stase::with('staseresiden', 'staseresiden.user', 'rumahsakit')->where('id', $id)->first();

        $pdf = Pdf::loadView('export.stase', compact('stase'));
        return $pdf->download('stase.pdf');
    }

    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pil) {
            Stase::destroy($pil);
        }
    }
}
