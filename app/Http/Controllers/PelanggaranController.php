<?php

namespace App\Http\Controllers;

use App\Models\Pelanggaran;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PelanggaranController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $pelanggarans = Pelanggaran::with(['prodi:id,name'])
                ->orderBy('created_at', 'desc');

            // Role-based filtering
            if (auth()->user()->hasRole('prodi')) {
                $pelanggarans->where('prodi_id', auth()->user()->prodi->id);
            }

            // Search filter
            if (request('search')) {
                $search = request('search');
                $pelanggarans->where(function ($query) use ($search) {
                    $query->where('nama_pelanggaran', 'like', "%{$search}%")
                        ->orWhere('sanksi', 'like', "%{$search}%")
                        ->orWhereHas('prodi', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Prodi filter
            if (request('prodi_id')) {
                $pelanggarans->where('prodi_id', request('prodi_id'));
            }

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $pelanggarans->paginate(10)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [

            'nama_pelanggaran' => 'required|string|max:255',
            'sanksi' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['nama_pelanggaran', 'sanksi', 'tingkat']);

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $data['file'] = $file->storeAs('pelanggarans', $filename, 'public');
            }

            $pelanggaran = Pelanggaran::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Data pelanggaran berhasil ditambahkan',
                'data' => $pelanggaran->load('prodi')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $pelanggaran = Pelanggaran::with('prodi')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $pelanggaran
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prodi_id' => 'required|exists:prodis,id',
            'nama_pelanggaran' => 'required|string|max:255',
            'sanksi' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pelanggaran = Pelanggaran::findOrFail($id);
            $data = $request->only(['prodi_id', 'nama_pelanggaran', 'sanksi']);

            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($pelanggaran->file) {
                    Storage::disk('public')->delete($pelanggaran->file);
                }

                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $data['file'] = $file->storeAs('pelanggarans', $filename, 'public');
            }

            $pelanggaran->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Data pelanggaran berhasil diperbarui',
                'data' => $pelanggaran->load('prodi')
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $pelanggaran = Pelanggaran::findOrFail($id);

            // Delete file if exists
            if ($pelanggaran->file) {
                Storage::disk('public')->delete($pelanggaran->file);
            }

            $pelanggaran->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data pelanggaran berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProdiOptions(): JsonResponse
    {
        try {
            $prodis = Prodi::select('id', 'name')->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $prodis
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data prodi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function download($id)
    {
        try {
            $pelanggaran = Pelanggaran::findOrFail($id);

            if (!$pelanggaran->file) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            $filePath = storage_path('app/public/' . $pelanggaran->file);

            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan di server'
                ], 404);
            }

            return response()->download($filePath);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendownload file'
            ], 500);
        }
    }
}
