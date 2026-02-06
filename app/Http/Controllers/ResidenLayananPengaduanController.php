<?php

namespace App\Http\Controllers;

use App\Models\LayananAduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResidenLayananPengaduanController extends Controller
{
    public function index()
    {
        return LayananAduan::where('type', 'pengaduan')->orderBy('created_at', 'desc')->where('user_id', auth()->id())->get();
    }

    public function show(LayananAduan $layananAduan)
    {
        if (!$layananAduan->respon) {
            return $layananAduan;
        }

        return response()->json([
            "message" => 'sdh di beri respon'
        ]);
    }

    public function destroy(LayananAduan $layananAduan)
    {
        if ($layananAduan->user_id !== auth()->id()) {
            return;
        }
        @unlink("pengaduan/" . $layananAduan->file);
        $layananAduan->delete();
    }

    public function store(Request $request)
    {
        $valData = $request->validate([
            'topik' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp|max:5000',
        ]);

        $valData['user_id'] = auth()->id();
        $valData['type'] = 'pengaduan';

        if ($request->hasFile('file')) {
            $fileName = 'pengaduan_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
            $request->file->storeAs('pengaduan', $fileName);
            $valData['file'] = $fileName;
        }

        $user = auth()->user();
        $noHp = $user->no_wa ?? ($user->biodata->no_hp ?? null);

        if ($noHp) {
            Controller::sendWa($noHp, "Nama: {$user->name}\nNIM: {$user->username}\n\nMemberi pengaduan\nTopik:\n{$valData['topik']}\n\nDeskripsi:\n{$valData['deskripsi']}\n\n_" . url('/') . "_");
        }

        return LayananAduan::create($valData);
    }

    public function update(Request $request, LayananAduan $layananAduan)
    {
        $valData = $request->validate([
            'topik' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp|max:5000',
        ]);

        $valData['user_id'] = auth()->id();
        $valData['type'] = 'pengaduan';

        if ($request->hasFile('file')) {
            $fileName = 'pengaduan_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
            $request->file->storeAs('pengaduan', $fileName);
            $valData['file'] = $fileName;

            // Hapus file lama jika ada
            if ($layananAduan->file && Storage::exists('pengaduan/' . $layananAduan->file)) {
                Storage::delete('pengaduan/' . $layananAduan->file);
            }
        }

        $layananAduan->update($valData);
        return $layananAduan;
    }
}
