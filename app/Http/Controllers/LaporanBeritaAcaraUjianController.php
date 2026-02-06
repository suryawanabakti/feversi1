<?php

namespace App\Http\Controllers;

use App\Exports\ReportBeritaAcaraUjianExport;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class LaporanBeritaAcaraUjianController extends Controller
{
    public function export(Request $request)
    {
        $users = User::role('residen');
        if ($request->prodiId) {
            $users->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }
        if (!$request->proposal && !$request->hasil && !$request->akhir && !$request->nasional) {
            $users->whereDoesntHave('ujian');
        } else {
            if ($request->proposal) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Proposal");
                });
            }

            if ($request->hasil) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Hasil");
                });
            }
            if ($request->akhir) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Akhir");
                });
            }
            if ($request->nasional) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Nasional");
                });
            }
        }


        $users = $users->orderBy('username', 'desc')->with('ujian')->get()->map(function ($user) {
            return [
                "id" => $user->id,
                "username" => $user->username,
                "name" => $user->name,
                "proposal" => $user->ujian->where('semester', 'Proposal')->first() ? "Sudah Proposal" : "Belum Proposal",
                "hasil" => $user->ujian->where('semester', 'Hasil')->first() ? "Sudah Hasil" : "Belum Hasil",
                "akhir" => $user->ujian->where('semester', 'Akhir')->first() ? "Sudah Akhir" : "Belum Akhir",
                "nasional" => $user->ujian->where('semester', 'Nasional')->first() ? "Sudah Nasional" : "Belum Nasional",
            ];
        }) ?? null;

        return Excel::download(new ReportBeritaAcaraUjianExport($users), 'berita-acara-ujian.xlsx');
    }
    public function getResiden(Request $request)
    {
        $users = User::role('residen');
        if ($request->prodiId) {
            $users->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }
        if (!$request->proposal && !$request->hasil && !$request->akhir && !$request->nasional) {
            $users->whereDoesntHave('ujian');
        } else {
            if ($request->proposal) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Proposal");
                });
            }

            if ($request->hasil) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Hasil");
                });
            }
            if ($request->akhir) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Akhir");
                });
            }
            if ($request->nasional) {
                $users->whereHas('ujian', function ($query) {
                    $query->where("semester", "Nasional");
                });
            }
        }


        return $users->orderBy('username', 'desc')->with('ujian')->get()->map(function ($user) {
            return [
                "id" => $user->id,
                "username" => $user->username,
                "name" => $user->name,
                "proposal" => $user->ujian->where('semester', 'Proposal')->first() ?? null,
                "hasil" => $user->ujian->where('semester', 'Hasil')->first() ?? null,
                "akhir" => $user->ujian->where('semester', 'Akhir')->first() ?? null,
                "nasional" => $user->ujian->where('semester', 'Nasional')->first() ?? null,
            ];
        }) ?? null;
    }
}
