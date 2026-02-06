<?php

namespace App\Http\Controllers;

use App\Models\BeritaAcaraUjian;
use Illuminate\Http\Request;

class ResidenBeritaAcaraUjianController extends Controller
{
    //
    public function index()
    {
        return BeritaAcaraUjian::where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'semester' => 'required',
            'bau' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
            'tglUjian' => 'required|date_format:Y-m-d',
        ]);

        $semester = $request->semester;
        $userId = auth()->id();

        // Ambil semester yang sudah diisi oleh user
        $existingSemesters = BeritaAcaraUjian::where('user_id', $userId)
            ->pluck('semester')
            ->toArray();

        // Aturan dependensi
        $dependencies = [
            'Hasil' => ['Proposal'],
            'Akhir' => ['Proposal', 'Hasil'],
            'Nasional' => ['Proposal', 'Hasil', 'Akhir'],
        ];

        if (isset($dependencies[$semester])) {
            foreach ($dependencies[$semester] as $requiredSemester) {
                if (!in_array($requiredSemester, $existingSemesters)) {
                    return response()->json([
                        'message' => "$requiredSemester tidak ada. Harap upload $requiredSemester terlebih dahulu.",
                        'code' => 202,
                    ]);
                }
            }
        }

        // Cegah duplikasi
        if (in_array($semester, $existingSemesters)) {
            return response()->json([
                'message' => "$semester sudah diunggah sebelumnya.",
                'code' => 202,
            ]);
        }

        try {
            // Nama file unik
            $fileName = 'bau_' . $userId . '_' . $semester . '_' . time() . '_' . str()->random(6) . '.' . $request->file('bau')->getClientOriginalExtension();

            // Simpan file ke storage/app/bau
            $path = $request->file('bau')->storeAs('bau', $fileName);

            // Simpan ke database
            return BeritaAcaraUjian::create([
                'user_id' => $userId,
                'tgl_ujian' => $request->tglUjian,
                'semester' => $semester,
                'bau' => $fileName,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan data. Silakan coba lagi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


   public function deleteAll(Request $request)
{
    $dependencies = [
        'Proposal' => 'Hasil',
        'Hasil'    => 'Akhir',
        'Akhir'    => null
    ];

    foreach ($request->pilihan as $pil) {

        $item = BeritaAcaraUjian::find($pil);

        if (!$item) {
            return response()->json([
                'status'  => 'error',
                'message' => "Data dengan ID $pil tidak ditemukan."
            ], 404);
        }

        $jenis = $item->semester;
        $dependency = $dependencies[$jenis] ?? null;

        if ($dependency) {
            $cek = BeritaAcaraUjian::where('user_id', $item->user_id)
                    ->where('semester', $dependency)
                    ->exists();

            if ($cek) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "$jenis tidak dapat dihapus karena masih ada $dependency."
                ], 400);
            }
        }

        // Hapus file jika ada
        $filePath = public_path('bau/');
        if (!empty($item->bau) && file_exists($filePath . $item->bau)) {
            @unlink($filePath . $item->bau);
        }

        $item->delete();
    }

    return response()->json([
        'status'  => 'success',
        'message' => 'Data berhasil dihapus'
    ]);
}


}
