<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Exports\PrestasiExport;
use App\Models\ResidenPrestasi;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AdminPrestasiController extends Controller
{
    //
    public function index(Request $request)
    {
        $residenPrestasi = ResidenPrestasi::with('user.biodata.prodi')
            ->orderBy('user_id', 'desc');

        if ($request->term) {
            $residenPrestasi->where('name', 'LIKE', "%$request->term%")
                ->orWhereHas('user', function ($query) use ($request) {
                    $query->where('name', 'LIKE', "%$request->term%")->orWhere('username', 'LIKE', "%$request->term%");
                });
        }

        if ($request->prodiId) {
            $residenPrestasi->whereHas('user.biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }

        return $residenPrestasi = $residenPrestasi->paginate(10);
    }

    public function strsip(Request $request)
    {
        $users = User::with('biodata')->whereHas('biodata', function ($query) {
            $query->whereNotNull('str')->whereNotNull('sip');
        })->role('residen')->orderBy('username', 'desc');

        if ($request->term) {
            $users->where('name', 'LIKE', "%$request->term%")->orWhere('username', 'LIKE', "%$request->term%");
        }

        if ($request->prodiId) {
            $users->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }

        return $users = $users->paginate(10);
    }

    public function export()
    {
        return Excel::download(new PrestasiExport, 'prestasi.xlsx');
    }
}
