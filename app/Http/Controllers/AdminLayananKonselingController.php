<?php

namespace App\Http\Controllers;

use App\Models\LayananAduan;
use Illuminate\Http\Request;

class AdminLayananKonselingController extends Controller
{
    public function index(Request $request)
    {
        $layanan =  LayananAduan::where('type', 'konseling')->orderBy('created_at', 'desc');
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

    public function show(LayananAduan $layananKonseling)
    {
        return $layananKonseling;
    }

    public function update(Request $request, LayananAduan $layananKonseling)
    {
        $noHp = $layananKonseling->user->no_wa ?  $layananKonseling->user->no_wa : $layananKonseling->user->biodata->no_hp;

        Controller::sendWa($noHp, "Hi, " . $layananKonseling->user->name . " 👋. Admin telah merespon konseling anda \n" . "Respon:\n" . $request->respon . "\n\n" .  "_" .  url('/') . "_");

        $layananKonseling->update([
            'respon' => $request->respon
        ]);
    }

    public  function destroy(LayananAduan $layananKonseling)
    {
        $noHp = $layananKonseling->user->no_wa ?  $layananKonseling->user->no_wa : $layananKonseling->user->biodata->no_hp;

        Controller::sendWa($noHp, "Hi, " . $layananKonseling->user->name . " 👋 .\Admin telah menghapus konseling \n\n" . "_" .  url('/') . "_");

        $layananKonseling->delete();
    }
}
