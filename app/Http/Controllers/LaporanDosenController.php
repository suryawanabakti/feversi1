<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use Illuminate\Http\Request;

class LaporanDosenController extends Controller
{
    public function index()
    {
        $dosen = Dosen::all();

        return response()->json([
            "countDosen" => $dosen->count(),
            "countDosenNidn" => $dosen->where('type_nomor', 'nidn')->count(),
            "countDosenNidk" => $dosen->where('type_nomor', 'nidk')->count(),
            'countDosenNup' => $dosen->where('type_nomor', 'nup')->count(),
            'countDosenDll' => $dosen->where('type_nomor', 'dll')->count(),
        ], 200);
    }

    public function show($type)
    {
        return Dosen::with('prodi')->where('type_nomor', $type)->get();
    }
}
