<?php

namespace App\Http\Controllers;

use App\Models\ResidenKrs;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResidenKrsController extends Controller
{

    public function index()
    {
        return ResidenKrs::where('user_id', auth()->id())->get();
    }


    public function store(Request $request)
    {
        $request->validate([
            'semester' => 'required|string',
            'tahun' => 'required|max:50',
            'krs' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
        ]);

        try {
            // Generate nama unik
            $fileName = 'krs_' . auth()->id() . '_' . time() . '_' . str()->random(10) . '.' . $request->krs->getClientOriginalExtension();

            // Simpan ke folder storage/app/krs (bukan public)
            $path = $request->file('krs')->storeAs('krs', $fileName);

            // Simpan ke database
            $insert = [
                'user_id' => auth()->id(),
                'semester' => $request->semester,
                'tahun' => $request->tahun,
                'krs' => $fileName,
            ];

            return ResidenKrs::create($insert);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload gagal. Silakan coba lagi.'], 500);
        }
    }


    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pil) {
            $residenkrs = ResidenKrs::find($pil);
            $filePath = public_path('krs/');
            $currentFile = $residenkrs->krs;
            if (file_exists($filePath . $currentFile)) {
                @unlink($filePath . $currentFile);
            }
            ResidenKrs::destroy($pil);
        }
    }
}
