<?php

namespace App\Http\Controllers;

use App\Models\Prodi;
use App\Models\Stase;
use App\Models\StaseResiden;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StaseAdminExport;
use App\Exports\StaseProdiExport;
use App\Models\RumahSakit;

class LaporanStaseController extends Controller
{
    //
    public function cetak($rumahsakit, $bulan, $tahun, $format)
    {
        $stase = Stase::with('rumahsakit')->orderBy('rumah_sakit_id', 'desc');

        if ($rumahsakit !== 'semua') {
            $stase = $stase->where('rumah_sakit_id', $rumahsakit);
        }

        if ($bulan !== 'semua') {
            $stase = $stase->where('bulan', $bulan);
        }
        if ($tahun !== 'semua') {
            $stase = $stase->where('tahun', $tahun);
        }

        $stase = $stase->get();
        if ($format === 'pdf') {
            $pdf =  Pdf::loadView('export.stase-admin', compact('stase'));
            return $pdf->stream(Carbon::now()->format('D-m-Y-H:i:s') . '.pdf');
        }
        if ($format === 'excel') {
            return Excel::download(new StaseAdminExport($stase), 'stase-admin.xlsx');
        }
    }

    public function index($rumahsakit, $bulan, $tahun)
    {
        $stase = Stase::with('rumahsakit')->orderBy('rumah_sakit_id', 'desc');

        if ($rumahsakit !== 'semua') {
            $stase = $stase->where('rumah_sakit_id', $rumahsakit);
        }

        if ($bulan !== 'semua') {
            $stase = $stase->where('bulan', $bulan);
        }
        if ($tahun !== 'semua') {
            $stase = $stase->where('tahun', $tahun);
        }


        $rumahSakits = $stase->select('rumah_sakit_id')->groupBy('rumah_sakit_id')->get();
        $prodiAll = Prodi::all();
        foreach ($rumahSakits as $data) {
            $staseResiden = StaseResiden::where('rumah_sakit_id', $data->rumah_sakit_id)->where('bulan', $bulan)->where('tahun', $tahun);


            foreach ($prodiAll as $prodi) {
                $prodis[] = [
                    "id" => $prodi->id,
                    "name" =>  $prodi->name,
                    "jumlahResiden" => StaseResiden::where('tahun', $tahun)->where('bulan', $bulan)->where('rumah_sakit_id', $rumahsakit)->whereHas('user.biodata', function ($query) use ($prodi) {
                        $query->where('prodi_id', $prodi->id);
                    })->count()
                ];
            }

            $rumahSakitResiden[] = [
                "rumahSakit" => $data->rumahsakit->name,
                "jumlahResiden" => $staseResiden->count(),
                "prodis" =>   $prodis,
            ];
        }

        return $rumahSakitResiden ?? [];
        // $pdf =  Pdf::loadView('export.stase-admin', compact('stase'));
        // return $pdf->stream(Carbon::now()->format('D-m-Y-H:i:s') . '.pdf');
    }

    public function show($rumahsakit, $bulan, $tahun, $prodi)
    {
        return  $staseResiden = StaseResiden::where('rumah_sakit_id', $rumahsakit)->where('bulan', $bulan)->where('tahun', $tahun)->whereHas('user.biodata', function ($query) use ($prodi) {
            $query->where("prodi_id", $prodi);
        })->with('user.biodata.prodi', 'stase', 'user.serkom')->get();
    }

    public function cetak2($prodi, $bulan, $tahun, $format)
    {
        // Query dasar dengan relasi yang diperlukan
        $staseQuery = StaseResiden::with([
            'user.biodata.prodi',
            'rumahsakit',
            'stase'
        ])->orderBy('rumah_sakit_id', 'desc');

        // Filter berdasarkan prodi (jika bukan 'semua')
        if ($prodi !== 'semua') {
            $staseQuery = $staseQuery->whereHas('user.biodata', function ($query) use ($prodi) {
                $query->where('prodi_id', $prodi);
            });
        }

        // Filter bulan dan tahun
        if ($bulan !== 'semua') {
            $staseQuery = $staseQuery->where('bulan', $bulan);
        }
        if ($tahun !== 'semua') {
            $staseQuery = $staseQuery->where('tahun', $tahun);
        }

        $staseResiden = $staseQuery->get();

        // Group data by prodi untuk keperluan laporan
        $groupedData = [];

        foreach ($staseResiden as $residen) {
            $prodiId = $residen->user->biodata->prodi_id ?? null;
            $prodiName = $residen->user->biodata->prodi->name ?? 'Tidak Ada Prodi';

            if (!isset($groupedData[$prodiId])) {
                $groupedData[$prodiId] = [
                    'prodi' => $prodiName,
                    'prodi_id' => $prodiId,
                    'residen' => []
                ];
            }

            $groupedData[$prodiId]['residen'][] = $residen;
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('export.stase-prodi', compact('groupedData', 'bulan', 'tahun'));
            return $pdf->stream('laporan-stase-prodi-' . Carbon::now()->format('Y-m-d-H-i-s') . '.pdf');
        }

        if ($format === 'excel') {
            return Excel::download(new StaseProdiExport($groupedData, $bulan, $tahun), 'laporan-stase-prodi.xlsx');
        }
    }

    public function index2($prodi, $bulan, $tahun)
    {
        // Query dasar dengan relasi yang diperlukan
        $staseQuery = StaseResiden::with(['user.biodata.prodi', 'rumahsakit'])
            ->orderBy('rumah_sakit_id', 'desc');

        // Filter berdasarkan prodi (jika bukan 'semua')
        if ($prodi !== 'semua') {
            $staseQuery = $staseQuery->whereHas('user.biodata', function ($query) use ($prodi) {
                $query->where('prodi_id', $prodi);
            });
        }

        // Filter bulan dan tahun
        if ($bulan !== 'semua') {
            $staseQuery = $staseQuery->where('bulan', $bulan);
        }
        if ($tahun !== 'semua') {
            $staseQuery = $staseQuery->where('tahun', $tahun);
        }

        // Get semua prodi untuk grouping
        $allProdis = Prodi::where('id', $prodi)->get();
        $results = [];

        foreach ($allProdis as $prodiData) {
            // Hitung jumlah residen per prodi
            $residenCount = StaseResiden::where('bulan', $bulan !== 'semua' ? $bulan : 'like', '%')
                ->where('tahun', $tahun !== 'semua' ? $tahun : 'like', '%')
                ->whereHas('user.biodata', function ($query) use ($prodiData) {
                    $query->where('prodi_id', $prodiData->id);
                })
                ->when($prodi !== 'semua', function ($query) use ($prodi) {
                    $query->whereHas('user.biodata', function ($q) use ($prodi) {
                        $q->where('prodi_id', $prodi);
                    });
                })
                ->count();

            // Jika ada residen di prodi ini, atau jika filter prodi spesifik dipilih
            if ($residenCount > 0 || $prodi !== 'semua') {
                // Get semua rumah sakit untuk prodi ini
                $rumahSakits = RumahSakit::all();
                $rumahSakitData = [];

                foreach ($rumahSakits as $rumahSakit) {
                    $jumlahResidenPerRS = StaseResiden::where('bulan', $bulan !== 'semua' ? $bulan : 'like', '%')
                        ->where('tahun', $tahun !== 'semua' ? $tahun : 'like', '%')
                        ->where('rumah_sakit_id', $rumahSakit->id)
                        ->whereHas('user.biodata', function ($query) use ($prodiData) {
                            $query->where('prodi_id', $prodiData->id);
                        })
                        ->when($prodi !== 'semua', function ($query) use ($prodi) {
                            $query->whereHas('user.biodata', function ($q) use ($prodi) {
                                $q->where('prodi_id', $prodi);
                            });
                        })
                        ->count();

                    if ($jumlahResidenPerRS > 0) {
                        $rumahSakitData[] = [
                            "id" => $rumahSakit->id,
                            "name" => $rumahSakit->name,
                            "jumlahResiden" => $jumlahResidenPerRS
                        ];
                    }
                }

                $results[] = [
                    "prodi" => $prodiData->name,
                    "prodiId" => $prodiData->id,
                    "jumlahResiden" => $residenCount,
                    "rumahSakits" => $rumahSakitData
                ];
            }
        }

        // Filter out empty results jika tidak ada filter prodi spesifik
        if ($prodi === 'semua') {
            $results = array_filter($results, function ($item) {
                return $item['jumlahResiden'] > 0;
            });
        }

        return $results;
    }

    public function show2($prodi, $bulan, $tahun, $rumahSakitId = null)
    {

        $query = StaseResiden::with([
            'user.biodata.prodi',
            'user.serkom',
            'stase',
            'rumahsakit'
        ])
            ->where('bulan', $bulan !== 'semua' ? $bulan : 'like', '%')
            ->where('tahun', $tahun !== 'semua' ? $tahun : 'like', '%')
            ->whereHas('user.biodata', function ($query) use ($prodi) {
                $query->where('prodi_id', $prodi);
            });

        // Jika rumah sakit spesifik dipilih
        if ($rumahSakitId && $rumahSakitId !== 'semua') {
            $query = $query->where('rumah_sakit_id', $rumahSakitId);
        }

        $residen = $query->get();

        return $residen;
    }
    
}
