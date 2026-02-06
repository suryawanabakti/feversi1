<?php

namespace App\Http\Controllers;

use App\Models\ResidenBiodata;
use App\Http\Resources\LastSeenResource;
use App\Http\Resources\RumahSakitAndResidenResource;
use App\Models\AbstrakJurnal;
use App\Models\BeritaAcaraUjian;
use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\ResidenExit;
use App\Models\ResidenKhs;
use App\Models\ResidenKrs;
use App\Models\ResidenPrestasi;
use App\Models\RumahSakit;
use App\Models\Spp;
use App\Models\Stase;
use App\Models\StaseResiden;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    //
    public function index(Request $request)
    {
        $residenKeluar = 0;
        $totalResiden = 0;
        if (auth()->user()->roles[0]?->name === 'admin' || auth()->user()->roles[0]?->name === 'staser') {
            $totalResiden = User::whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->role('residen')->count();

            $totalAlumni = User::role('residen')->whereHas('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->count();

            $totalProdi = User::role('prodi')->count();
            $totalRumahSakit = RumahSakit::count();

            $residenKeluar = ResidenExit::count();

            $lastSeen = LastSeenResource::collection(User::role(['residen', 'prodi'])->whereNotNull('last_seen')->whereDate('last_seen', Carbon::now())->orderBy('last_seen', 'desc')->take(5)->get() ?? []);

            if ($request->showLastSeen) {
                $lastSeen = LastSeenResource::collection(User::role(['residen', 'prodi'])->whereNotNull('last_seen')->whereDate('last_seen', Carbon::now())->orderBy('last_seen', 'desc')->take($request->showLastSeen)->get() ?? []);
            }

            $totalStasePerProdi =  Stase::with('prodi')->select('prodi_id', DB::raw('count(*) as total'))->groupBy('prodi_id')->get();
            $totalStasePerRS =  Stase::with('rumahsakit')->select('rumah_sakit_id', DB::raw('count(*) as total'))->groupBy('rumah_sakit_id')->get();
        }

        if (auth()->user()->roles[0]?->name === 'prodi') {
            $totalResiden = User::whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            })->role('residen')->count();

            $residenKeluar = ResidenExit::whereHas('user.biodata', function ($query) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            })->count();

            $totalAlumni = User::whereHas('biodata', function ($query) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            })->whereHas('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->role('residen')->count();

            $totalDosen = Dosen::where('prodi_id', auth()->user()->prodi->id)->count();
            $totalStasePerRS =  Stase::with('rumahsakit')->where('prodi_id', auth()->user()->prodi->id)->select('rumah_sakit_id', DB::raw('count(*) as total'))->groupBy('rumah_sakit_id')->get();

            $totalStaseRs =  Stase::with('rumahsakit')->select('rumah_sakit_id')->groupBy('rumah_sakit_id')->where('prodi_id', auth()->user()->prodi->id)->count();

            $totalStase = Stase::where('prodi_id', auth()->user()->prodi->id)->count();

            $rumahSakit = RumahSakit::whereHas('staseresiden.user.biodata', function ($query) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            })->get();

            $rumahsakitResiden =   $rumahSakit->map(function ($data) {
                $staseresiden = StaseResiden::where('rumah_sakit_id', $data->id)->whereHas('user.biodata', function ($query) {
                    $query->where('prodi_id', auth()->user()->prodi->id);
                })->count();
                return [
                    "id" => $data->id,
                    "name" => $data->name,
                    "staseresiden_count" => $staseresiden,
                ];
            });
        }

        return [
            "showLastSeen" => $request->showLastSeen ?? null,
            "lastSeen" => $lastSeen ?? [],
            "totalResiden" => $totalResiden - $residenKeluar,
            "totalAlumni" => $totalAlumni ?? 0,
            "totalProdi" => $totalProdi ?? 0,
            "totalRumahSakit" => $totalRumahSakit ?? 0,
            "totalStaseRs" => $totalStaseRs ?? 0,
            "totalDosen" => $totalDosen ?? Dosen::count(),
            "residenBiodata" => ResidenBiodata::where('user_id', auth()->id())->first() ?? null,
            "totalStase" => $totalStase ?? 0,
            "totalStasePerProdi" => $totalStasePerProdi ?? [],
            "totalStasePerRS" => $totalStasePerRS ?? [],
            "totalKhs" => ResidenKhs::where('user_id', auth()->id())->count() ?? 0,
            "totalKrs" => ResidenKrs::where('user_id', auth()->id())->count(),
            "totalSpp" => Spp::where('user_id', auth()->id())->count() ?? 0,
            "totalBeritaAcara" => BeritaAcaraUjian::where('user_id', auth()->id())->count() ?? 0,
            "totalAbstrak" => AbstrakJurnal::where('user_id', auth()->id())->count() ?? 0,
            "totalPrestasi" => ResidenPrestasi::where('user_id', auth()->id())->count() ?? 0,
            "rumahsakitResiden" => $rumahsakitResiden ?? []
        ];
    }
}
