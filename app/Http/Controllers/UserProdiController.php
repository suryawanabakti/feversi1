<?php

namespace App\Http\Controllers;

use App\Http\Resources\SelectDosenResource;
use App\Imports\ProdiImport;
use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\ResidenBiodata;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class UserProdiController extends Controller
{
    //
    public function show($id)
    {
        return User::with('prodi', 'prodi.sekertariatprodi', 'prodi.ketuaprodi')->where('id', $id)->first();
    }

    public function sample()
    {
        return response()->download('sampel/prodisample.xlsx');
    }

    public function update(Request $request, $id)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'masaStudi' => 'required|numeric'
        ]);

        $user = User::where('id', $id)->update([
            'name' => $request->name,
        ]);



        Prodi::where('user_id', $id)->update([
            'name' => $request->name,
            'masa_studi' => $request->masaStudi,
            'kps' => $request->kps ?? null,
            'sps' => $request->sps ?? null,
        ]);
    }

    public function index()
    {
        return User::with('prodi', 'prodi.sekertariatprodi', 'prodi.ketuaprodi')->role('prodi')->orderBy('created_at', 'desc')->get();
    }



    public function import(Request $request)
    {
        Excel::import(new ProdiImport(), $request->file('file'));
    }

    public function deleteAll(Request $request)
    {

        foreach ($request->pilihan as $pilihan) {
            $user = User::where('id', $pilihan)->first();
            $kondisi = ResidenBiodata::where('prodi_id', $user->prodi->id)->count();
            if ($kondisi === 0) {
                User::where('id', $pilihan)->delete();
            } else {
                return response()->json([
                    'code' => '201',
                    'message' => 'Prodi Mempunyai Residen Tidak dapat di hapus'
                ], 201);
            }
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users|alpha_dash|max:255',
            'name' => 'required|string|max:255',
            'masaStudi' => 'required|numeric'
        ]);

        $user = User::create([
            'username' => strtolower($request->username),
            'name' => $request->name,
            'password' => bcrypt($request->username)
        ]);

        Prodi::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'masa_studi' => $request->masaStudi,
        ]);

        $user->assignRole("prodi");
    }

    public function getDosen()
    {
        return SelectDosenResource::collection(Dosen::all());
    }
}
