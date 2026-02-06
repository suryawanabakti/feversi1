<?php

namespace App\Http\Controllers;

use App\Http\Resources\SelectRumahSakitResource;
use App\Models\Province;
use App\Models\Regency;
use App\Models\RumahSakit;
use Illuminate\Support\Facades\Http;

class RefrensiController extends Controller
{
    //
    public function getRumahSakit()
    {
        return SelectRumahSakitResource::collection(RumahSakit::all());
    }

    public function getProvinsi()
    {

        return response()->json([
            'provinsi' =>  Province::all()
        ]);
        $response = Http::get('https://dev.farizdotid.com/api/daerahindonesia/provinsi');
    }

    public function getAllKabupaten()
    {
        return Regency::orderBy('latitude', 'asc')->get();
    }


    public function getProvinsiById($id)
    {
        return Province::find($id);
        // return $response = Http::get("https://dev.farizdotid.com/api/daerahindonesia/provinsi/$id");
    }

    public function getKabupaten($idprov)
    {
        $regency = Regency::where('province_id', $idprov)->get();
        return response()->json([
            'kota_kabupaten' =>  $regency
        ]);
    }

    public function getKabupatenById($id)
    {
        return Regency::where('id', $id)->orderBy('latitude', 'asc')->first();
    }

    public function getKecamatan($idkabupaten)
    {
        return $response = Http::get('https://dev.farizdotid.com/api/daerahindonesia/kecamatan?id_kota=' . $idkabupaten);
    }

    public function getKecamatanById($id)
    {
        return $response = Http::get("https://dev.farizdotid.com/api/daerahindonesia/kecamatan/$id");
    }
}
