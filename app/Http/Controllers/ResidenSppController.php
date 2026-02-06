<?php

namespace App\Http\Controllers;

use App\Models\Spp;
use Illuminate\Http\Request;

class ResidenSppController extends Controller
{
    //
    //
    public function index()
    {
        return Spp::where('user_id', auth()->id())->get();
    }




    public function store(Request $request)
    {
        $request->validate([
            'semester' => 'required|string',
            'tahun' => 'required',
            'spp' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
        ]);

        try {
            // Generate nama file unik
            $fileName = 'spp_' . auth()->id() . '_' . time() . '_' . str()->random(8) . '.' . $request->file('spp')->getClientOriginalExtension();

            // Simpan ke storage/app/spp
            $request->file('spp')->storeAs('spp', $fileName);

            // Simpan ke database
            $insert = [
                'user_id' => auth()->id(),
                'tahun' => $request->tahun,
                'semester' => $request->semester,
                'spp' => $fileName,
            ];

            return Spp::create($insert);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload file SPP gagal. Silakan coba lagi.'], 500);
        }
    }


    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pil) {
            $residenspp = Spp::find($pil);
            $filePath = public_path('spp/');
            $currentFile = $residenspp->spp;
            if (file_exists($filePath . $currentFile)) {
                @unlink($filePath . $currentFile);
            }
            Spp::destroy($pil);
        }
    }
}
