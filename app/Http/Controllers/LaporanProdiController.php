<?php

namespace App\Http\Controllers;

use App\Models\Prodi;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LaporanProdiController extends Controller
{
    //
    public function index()
    {
        $activeUserIds = User::role('residen')->whereDoesntHave('ujian', function ($query) {
            $query->where('semester', 'akhir');
        })
            ->whereDoesntHave('residenExit')
            ->pluck('id');

        $totalResiden = Prodi::join('residen_biodatas', 'residen_biodatas.prodi_id', '=', 'prodis.id')
            ->whereIn('residen_biodatas.user_id', $activeUserIds)
            ->groupBy('prodis.id', 'prodis.name')
            ->orderBy('totalResiden', 'desc')
            ->get([
                'prodis.id',
                'prodis.name',
                DB::raw('count(residen_biodatas.id) as totalResiden'),
            ]);

        $totalDosen = Prodi::join('dosens', 'dosens.prodi_id', '=', 'prodis.id')
            ->groupBy('prodis.id', 'prodis.name')
            ->orderBy('totalDosen', 'desc')
            ->get(['prodis.id', 'prodis.name', DB::raw('count(dosens.id) as totalDosen')]);

        $residenBiodata = Prodi::join('residen_biodatas', 'residen_biodatas.prodi_id', '=', 'prodis.id')
            ->whereNotNull('residen_biodatas.jenis_kelamin')
            ->groupBy('prodis.id', 'prodis.name')
            ->orderBy('totalResiden', 'desc')
            ->get(['prodis.id', 'prodis.name', DB::raw('count(residen_biodatas.id) as totalResiden')]);

        return response()->json([
            'totalresiden' => $totalResiden,
            'totaldosen' => $totalDosen,
            'residenbiodata' => $residenBiodata,
        ]);
    }
}
