<?php

namespace App\Http\Controllers;

use App\Models\AbstrakJurnal;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AbstrakController extends Controller
{
    //
    public function index()
    {
        return AbstrakJurnal::where('user_id', auth()->id())->get();
    }



    public function store(Request $request)
    {
        $request->validate([
            'semester' => 'required|string|max:255',
            'jenisPublikasi' => 'required|string|max:255',
            'abstrak' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
            'link' => 'nullable|url',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        try {
            // Nama file unik
            $fileName = 'abstrak_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file('abstrak')->getClientOriginalExtension();

            // Simpan ke folder storage/app/abstrak
            $path = $request->file('abstrak')->storeAs('abstrak', $fileName);

            // Simpan ke DB
            $insert = [
                'user_id' => auth()->id(),
                'jenis_publikasi' => $request->jenisPublikasi,
                'semester' => $request->semester,
                'abstrak' => $fileName,
                'link' => $request->link ?? null,
                'keterangan' => $request->keterangan ?? null,
            ];

            return AbstrakJurnal::create($insert);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan data. Silakan coba lagi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pil) {
            $residenabstrak = AbstrakJurnal::find($pil);
            $filePath = public_path('abstrak/');
            $currentFile = $residenabstrak->abstrak;
            if (file_exists($filePath . $currentFile)) {
                @unlink($filePath . $currentFile);
            }
            AbstrakJurnal::destroy($pil);
        }
    }
}
