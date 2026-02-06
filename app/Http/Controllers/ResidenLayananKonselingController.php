<?php

namespace App\Http\Controllers;

use App\Models\LayananAduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class ResidenLayananKonselingController extends Controller
{
    public function index()
    {
        return LayananAduan::where('type', 'konseling')->orderBy('created_at', 'desc')->where('user_id', auth()->id())->get();
    }

    public function show(LayananAduan $layananKonseling)
    {
        if (!$layananKonseling->respon) {
            return $layananKonseling;
        }

        return response()->json([
            "message" => 'sdh di beri respon'
        ]);
    }

    public function destroy(LayananAduan $layananKonseling)
    {
        if ($layananKonseling->user_id !== auth()->id()) {
            return;
        }
        @unlink("konseling/" . $layananKonseling->file);
        $layananKonseling->delete();
    }


    public function store(Request $request)
    {
        $valData = $request->validate([
            'topik' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp|max:5000',
        ]);

        $valData['user_id'] = auth()->id();
        $valData['type'] = 'konseling';

        if ($request->hasFile('file')) {
            $fileName = 'konseling_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
            $request->file->storeAs('konseling', $fileName);
            $valData['file'] = $fileName;
        }

        $user = auth()->user();
        $noHp = $user->no_wa ?? ($user->biodata->no_hp ?? null);

        if ($noHp) {
            Controller::sendWa($noHp, "Nama: {$user->name}\nNIM: {$user->username}\n\nMemberi konseling\nTopik:\n{$valData['topik']}\n\nDeskripsi:\n{$valData['deskripsi']}\n\n_" . url('/') . "_");
        }

        return LayananAduan::create($valData);
    }

    public function update(Request $request, LayananAduan $layananKonseling)
    {
        $valData = $request->validate([
            'topik' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp|max:5000',
        ]);

        $valData['user_id'] = auth()->id();
        $valData['type'] = 'konseling';

        if ($request->hasFile('file')) {
            $fileName = 'konseling_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
            $request->file->storeAs('konseling', $fileName);
            $valData['file'] = $fileName;

            // Hapus file lama jika ada
            if ($layananKonseling->file && Storage::exists('konseling/' . $layananKonseling->file)) {
                Storage::delete('konseling/' . $layananKonseling->file);
            }
        }

        $layananKonseling->update($valData);
        return $layananKonseling;
    }
}
