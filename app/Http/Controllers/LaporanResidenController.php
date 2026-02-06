<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class LaporanResidenController extends Controller
{
    public function index(Request $request)
    {
        $mandiri =   User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) {
            $query->where('status_pembiyaan', 'mandiri');
        });
        $beasiswa =   User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) {
            $query->where('status_pembiyaan', 'beasiswa');
        });
        $swasta = User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) {
            $query->where('status_pembiyaan', 'swasta');
        });
        $unknown = User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) {
            $query->where('status_pembiyaan', null);
        });

        if ($request->prodi_id) {
            $mandiri->whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodi_id);
            });

            $beasiswa->whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodi_id);
            });

            $swasta->whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodi_id);
            });

            $unknown->whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', null);
            });
        }

        return response()->json([
            "statusPembiayaan" => [
                "mandiri" => $mandiri->count(),
                "beasiswa" => $beasiswa->count(),
                "swasta" => $swasta->count(),
                "unknown" => $unknown->count()
            ],
        ]);
    }

    public function show($statusPembiayaan, $prodiId)
    {
        $residens = User::role('residen')->with('biodata.prodi')->orderBy('username', 'DESC')->whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) use ($statusPembiayaan) {
            $query->where('status_pembiyaan', $statusPembiayaan !== 'unknown' ? $statusPembiayaan : null);
        });

        if ($prodiId !== "semua") {
            $residens->whereDoesntHave('ujian', function ($query) {
                return $query->where('semester', 'akhir');
            })->whereHas('biodata', function ($query) use ($prodiId) {
                $query->where('prodi_id', $prodiId);
            });
        }

        return $residens->get()->map(function ($residen) {
            return [
                "id" => $residen->id,
                "name" => $residen->name,
                "username" => $residen->username,
                "prodi" => $residen->biodata->prodi->name,
                "provinsi" => $residen->biodata->provinsi?->nama,
                "kabupaten" => $residen->biodata->kabupaten?->nama,
            ];
        });
    }
}
