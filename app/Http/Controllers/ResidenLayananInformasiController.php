<?php

namespace App\Http\Controllers;

use App\Models\LayananAduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class ResidenLayananInformasiController extends Controller
{
    public function index()
    {
        return LayananAduan::where('type', 'informasi')->orderBy('created_at', 'desc')->where('user_id', auth()->id())->get();
    }

    public function show(LayananAduan $layananInformasi)
    {
        if (!$layananInformasi->respon) {
            return $layananInformasi;
        }

        return response()->json([
            "message" => 'sdh di beri respon'
        ]);
    }

    public function destroy(LayananAduan $layananInformasi)
    {
        if ($layananInformasi->user_id !== auth()->id()) {
            return;
        }
        @unlink("pengaduan/" . $layananInformasi->file);
        $layananInformasi->delete();
    }


    public function store(Request $request)
    {
        $valData = $request->validate([
            'topik' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp,pdf|max:5000',
        ]);

        $valData['user_id'] = auth()->id();
        $valData['type'] = 'informasi';

        if ($request->hasFile('file')) {
            $fileName = 'informasi_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
            $request->file->storeAs('informasi', $fileName);
            $valData['file'] = $fileName;
        }

        $user = auth()->user();
        $noHp = $user->no_wa ?? ($user->biodata->no_hp ?? null);

        if ($noHp) {
            Controller::sendWa($noHp, "Nama: {$user->name}\nNIM: {$user->username}\n\nMemberi pengaduan\nTopik:\n{$request->topik}\n\nDeskripsi:\n{$request->deskripsi}\n\n_" . url('/') . '_');
        }

        return LayananAduan::create($valData);
    }

    public function update(Request $request, LayananAduan $layananInformasi)
    {
        $valData = $request->validate([
            'topik' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp,pdf|max:5000',
        ]);

        $valData['user_id'] = auth()->id();
        $valData['type'] = 'informasi';

        if ($request->hasFile('file')) {
            $fileName = 'informasi_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
            $request->file->storeAs('informasi', $fileName);
            $valData['file'] = $fileName;

            // Hapus file lama jika ada
            if ($layananInformasi->file && Storage::exists('informasi/' . $layananInformasi->file)) {
                Storage::delete('informasi/' . $layananInformasi->file);
            }
        }

        $layananInformasi->update($valData);
        return $layananInformasi;
    }
}
