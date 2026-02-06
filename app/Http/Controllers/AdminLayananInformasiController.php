<?php

namespace App\Http\Controllers;

use App\Models\LayananAduan;
use Illuminate\Http\Request;

class AdminLayananInformasiController extends Controller
{
    public function index(Request $request)
    {
        $layanan =  LayananAduan::where('type', 'informasi')->orderBy('created_at', 'desc');
        if ($request->term) {
            $layanan->where("topik", 'LIKE', "%$request->term%")
                ->orWhere("deskripsi", "LIKE", "%$request->term%")
                ->orWhere("respon", "LIKE", "%$request->term%")
                ->orWhereHas("user", function ($query) use ($request) {
                    $query->where("name", "LIKE", "%{$request->term}$")
                        ->orWhere("username", "LIKE", "%{$request->term}$");
                });
        }
        if ($request->visible === 'belum') {
            $layanan->whereNull("respon");
        }
        if ($request->visible === 'sudah') {
            $layanan->whereNotNull("respon");
        }
        return $layanan->paginate(10);
    }

    public function show(LayananAduan $layananInformasi)
    {
        return $layananInformasi;
    }

    public function update(Request $request, LayananAduan $layananInformasi)
    {
        $noHp = $layananInformasi->user->no_wa ?  $layananInformasi->user->no_wa : $layananInformasi->user->biodata->no_hp;

        Controller::sendWa($noHp, "Hi, " . $layananInformasi->user->name . " 👋. Admin telah merespon informasi anda \n" . "Respon:\n" . $request->respon . "\n\n" .  "_" .  url('/') . "_");

        $layananInformasi->update([
            'respon' => $request->respon
        ]);
    }

    public  function destroy(LayananAduan $layananInformasi)
    {
        $noHp = $layananInformasi->user->no_wa ?  $layananInformasi->user->no_wa : $layananInformasi->user->biodata->no_hp;

        Controller::sendWa($noHp, "Hi, " . $layananInformasi->user->name . " 👋 .\Admin telah menghapus informasi \n\n" . "_" .  url('/') . "_");

        $layananInformasi->delete();
    }
}
