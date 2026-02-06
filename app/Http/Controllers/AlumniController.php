<?php

namespace App\Http\Controllers;

use App\Exports\AlumniExport;
use App\Http\Resources\AlumniResource;
use App\Models\BeritaAcaraUjian;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AlumniController extends Controller
{
    //
    public function index(Request $request)
    {

        if (auth()->user()->hasRole('admin')) {
            $user = User::with('ujian', 'biodata', 'biodata.prodi')
                ->whereHas('ujian', function ($query) {
                    return $query->where('semester', 'akhir');
                });
            // ->whereHas('ujian', function ($query) {
            //     return $query->where('semester', 'nasional');
            // });
        }

        if (auth()->user()->hasRole('prodi')) {
            $user = User::with('ujian', 'biodata', 'biodata.prodi')->whereHas('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })
                ->whereHas('biodata', function ($query) {
                    $query->where('prodi_id', auth()->user()->prodi->id);
                });
        }

        if ($request->prodiId) {
            $user->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }

        return AlumniResource::collection($user->get());

        // return BeritaAcaraUjian::with('user', 'user.biodata', 'user.biodata.prodi')->where('semester', 'nasional')->get();
    }

    public function export(Request $request)
    {
        if (auth()->user()->hasRole('admin')) {
            $user = User::with('ujian', 'biodata', 'biodata.prodi')
                ->whereHas('ujian', function ($query) {
                    return $query->where('semester', 'akhir');
                })->get();
        }

        if (auth()->user()->hasRole('prodi')) {
            $user = User::with('ujian', 'biodata', 'biodata.prodi')->whereHas('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            })->get();
        }
    
        return Excel::download(new AlumniExport($request), 'alumni.xlsx');
     
    }
}
