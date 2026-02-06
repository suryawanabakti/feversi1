<?php

namespace App\Http\Controllers;

use App\Models\ResidenPrestasi;
use Illuminate\Http\Request;

class ResidenPrestasiController extends Controller
{
    //
    public function index()
    {
        return ResidenPrestasi::where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'tahun' => 'required|integer|min:2000|max:' . date('Y'),
            'prestasi' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
        ]);

        try {
            // Buat nama file unik
            $fileName = 'prestasi_' . auth()->id() . '_' . time() . '_' . str()->random(6) . '.' . $request->file('prestasi')->getClientOriginalExtension();

            // Simpan ke storage/app/prestasi
            $request->file('prestasi')->storeAs('prestasi', $fileName);

            // Simpan ke database
            return ResidenPrestasi::create([
                'type' => $request->type,
                'user_id' => auth()->id(),
                'name' => $request->name,
                'tahun' => $request->tahun,
                'prestasi' => $fileName,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengunggah file prestasi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pil) {
            $residenPrestasi = ResidenPrestasi::find($pil);
            $filePath = public_path('prestasi/');
            $currentFile = $residenPrestasi->prestasi;
            if (file_exists($filePath . $currentFile)) {
                @unlink($filePath . $currentFile);
            }
            ResidenPrestasi::destroy($pil);
        }
    }
}
