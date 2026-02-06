<?php

namespace App\Http\Controllers;

use App\Http\Resources\LaporanProvinsiKabupatenResource;
use App\Models\Regency;
use App\Models\ResidenBiodata;
use App\Models\User;
use Illuminate\Http\Request;

class LaporanKabupatenController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->user()->hasRole('admin')) {
            $regency = Regency::all()->map(function ($data) use ($request) {
                if ($request->status == 'alumni') {
                    $totalResiden = User::whereHas('ujian', function ($query) {
                        return $query->where('semester', 'akhir');
                    })->role('residen')->whereHas('biodata', function ($query) use ($data, $request) {
                        $query->where('kabupaten_id', $data->id);
                        if ($request->prodiId) {
                            $query->where('prodi_id', $request->prodiId);
                        }
                    })->count();
                } else {
                    $totalResiden = User::whereDoesntHave('ujian', function ($query) {
                        return $query->where('semester', 'akhir');
                    })->role('residen')->whereHas('biodata', function ($query) use ($data, $request) {
                        $query->where('kabupaten_id', $data->id);
                        if ($request->prodiId) {
                            $query->where('prodi_id', $request->prodiId);
                        }
                    })->count();
                }

                return [
                    'id' => $data->id,
                    'nama' => $data->nama,
                    'latitude' => $data->latitude,
                    'longitude' => $data->longitude,
                    'totalResiden' => $totalResiden,
                ];
            });
        }

        if (auth()->user()->hasRole('prodi')) {
            $regency = Regency::all()->map(function ($data) {
                $totalResiden = User::whereDoesntHave('ujian', function ($query) {
                    return $query->where('semester', 'akhir');
                })->role('residen')->whereHas('biodata', function ($query) use ($data) {
                    $query->where('kabupaten_id', $data->id)->where('prodi_id', auth()->user()->prodi->id);
                })->count();

                return [
                    'id' => $data->id,
                    'nama' => $data->nama,
                    'latitude' => $data->latitude,
                    'longitude' => $data->longitude,
                    'totalResiden' => $totalResiden,
                ];
            });
        }

        return collect($regency)->where('totalResiden', '!=', 0)->values();
    }

    public function show(Request $request, $id)
    {
        $regency = ResidenBiodata::with('user', 'kabupaten', 'prodi')->where('kabupaten_id', $id);

        if ($request->status == 'alumni') {
            $regency->whereHas('user.ujian', function ($query) {
                $query->where('semester', 'akhir');
            });
        } else {
            $regency->whereDoesntHave('user.ujian', function ($query) {
                $query->where('semester', 'akhir');
            });
        }

        if ($request->prodiId) {
            $regency->where('prodi_id', $request->prodiId);
        }
        if (auth()->user()->hasRole('prodi')) {
            $regency->where('prodi_id', auth()->user()->prodi->id);
        }

        return LaporanProvinsiKabupatenResource::collection($regency->get());
    }
}
