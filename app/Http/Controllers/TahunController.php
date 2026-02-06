<?php

namespace App\Http\Controllers;

use App\Models\Tahun;
use Illuminate\Http\Request;

class TahunController extends Controller
{
    //
    public function index()
    {
        return Tahun::orderBy('tahun', 'desc')->get();
    }

    public function store(Request $req)
    {
        return Tahun::create([
            'tahun' => $req->name,
        ]);
    }

    public function destroy(Request $request)
    {
        foreach ($request->pilihan as $pilihan) {
            Tahun::destroy($pilihan);
        }
    }
}
