<?php

namespace App\Http\Controllers;

use App\Http\Resources\LaporanProvinsiResidenResource;
use App\Models\Province;
use App\Models\ResidenBiodata;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanProvinsiController extends Controller
{
    //
    public function index(Request $request)
    {
        if (auth()->user()->hasRole('admin')) {
            $province = Province::all()->map(function ($data) use ($request) {
                if ($request->status == "alumni") {
                    $totalResiden = User::whereHas('ujian', function ($query) {
                        return $query->where('semester', 'akhir');
                    })->role('residen')->whereHas('biodata', function ($query) use ($data, $request) {
                        $query->where('provinsi_id', $data->id);
                        if ($request->prodiId) {
                            $query->where('prodi_id', $request->prodiId);
                        }
                    })->count();
                } else {
                    $totalResiden = User::whereDoesntHave('ujian', function ($query) {
                        return $query->where('semester', 'akhir');
                    })->role('residen')->whereHas('biodata', function ($query) use ($data, $request) {
                        $query->where('provinsi_id', $data->id);
                        if ($request->prodiId) {
                            $query->where('prodi_id', $request->prodiId);
                        }
                    })->count();
                }

                return [
                    "id" => $data->id,
                    "nama" => $data->nama,
                    "latitude" => $data->latitude,
                    "longitude" => $data->longitude,
                    "totalResiden" => $totalResiden,
                ];
            });
        }

        if (auth()->user()->hasRole('prodi')) {
            $province = Province::all()->map(function ($data) {
                $totalResiden = User::whereDoesntHave('ujian', function ($query) {
                    return $query->where('semester', 'akhir');
                })->role('residen')->whereHas('biodata', function ($query) use ($data) {
                    $query->where('provinsi_id', $data->id)->where('prodi_id', auth()->user()->prodi->id);
                })->count();
                return [
                    "id" => $data->id,
                    "nama" => $data->nama,
                    "latitude" => $data->latitude,
                    "longitude" => $data->longitude,
                    "totalResiden" => $totalResiden,
                ];
            });
        }

        return $province;
    }

    public function show(Request $request, $id)
    {
        if (auth()->user()->hasRole('admin')) {
            $data = ResidenBiodata::with('user', 'provinsi', 'prodi')->where('provinsi_id', $id);

            if ($request->status) {
                $data->whereHas("user.ujian", function ($query) {
                    $query->where('semester', 'akhir');
                });
            } else {
                $data->whereDoesntHave("user.ujian", function ($query) {
                    $query->where('semester', 'akhir');
                });
            }
            if ($request->prodiId) {
                $data->where('prodi_id', $request->prodiId);
            }

            return LaporanProvinsiResidenResource::collection($data->get());
        }

        if (auth()->user()->hasRole('prodi')) {
            return LaporanProvinsiResidenResource::collection(ResidenBiodata::with('user', 'provinsi', 'prodi')->where('provinsi_id', $id)->where('prodi_id', auth()->user()->prodi->id)->get());
        }
    }
}
