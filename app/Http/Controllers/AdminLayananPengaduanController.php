<?php

namespace App\Http\Controllers;

use App\Models\LayananAduan;
use Illuminate\Http\Request;

class AdminLayananPengaduanController extends Controller
{
    public function index(Request $request)
    {
        $layanan =  LayananAduan::where('type', 'pengaduan')->orderBy('created_at', 'desc');
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

    public function show(LayananAduan $layananAduan)
    {
        return $layananAduan;
    }

    public function update(Request $request, LayananAduan $layananAduan)
    {
        $noHp = $layananAduan->user->no_wa ?  $layananAduan->user->no_wa : $layananAduan->user->biodata->no_hp;

        Controller::sendWa($noHp, "Hi, " . $layananAduan->user->name . " 👋. Admin telah merespon pengaduan anda \n" . "Respon:\n" . $request->respon . "\n\n" .  "_" .  url('/') . "_");

        $layananAduan->update([
            'respon' => $request->respon
        ]);
    }

    public  function destroy(LayananAduan $layananAduan)
    {
        $noHp = $layananAduan->user->no_wa ?  $layananAduan->user->no_wa : $layananAduan->user->biodata->no_hp;

        Controller::sendWa($noHp, "Hi, " . $layananAduan->user->name . " 👋 .\Admin telah menghapus pengaduan \n\n" . "_" .  url('/') . "_");

        $layananAduan->delete();
    }
}
