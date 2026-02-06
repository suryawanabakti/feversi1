<?php

namespace App\Http\Controllers;

use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class TahunAjaranController extends Controller
{
    public function index()
    {
        return TahunAjaran::orderBy('tahun_ajaran', 'desc')->get();
    }

    public function store(Request $req)
    {
        return TahunAjaran::create([
            'tahun_ajaran' => $req->tahun
        ]);
    }

    public function destroy($id)
    {
        return TahunAjaran::destroy($id);
    }
}
