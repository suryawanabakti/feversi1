<?php

namespace App\Http\Controllers;

use App\Models\ResidenKhs;
use Illuminate\Http\Request;

class ResidenKhsController extends Controller
{
    //
    public function index()
    {
        return ResidenKhs::where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required',
            'semester' => 'required',
            'khs' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
        ]);

        try {
            // Buat nama file unik
            $fileName = 'khs_' . auth()->id() . '_' . time() . '_' . str()->random(8) . '.' . $request->file('khs')->getClientOriginalExtension();

            // Simpan file ke storage/app/khs (bukan public_path!)
            $path = $request->file('khs')->storeAs('khs', $fileName);

            // Simpan ke database
            $insert = [
                'user_id' => auth()->id(),
                'tahun' => $request->tahun,
                'semester' => $request->semester,
                'khs' => $fileName,
            ];

            return ResidenKhs::create($insert);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload KHS gagal. Silakan coba lagi.'], 500);
        }
    }


    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pil) {
            $residenkhs = ResidenKhs::find($pil);
            $filePath = public_path('khs/');
            $currentFile = $residenkhs->khs ?? null;
            if (file_exists($filePath . $currentFile)) {
                @unlink($filePath . $currentFile);
            }
            ResidenKhs::destroy($pil);
        }
    }
}
