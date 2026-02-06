<?php

namespace App\Http\Controllers;

use App\Models\PelanggaranResiden;
use App\Models\Prodi;
use App\Models\Pelanggaran;
use App\Models\User;
use App\Http\Requests\StorePelanggaranResidenRequest;
use App\Http\Requests\UpdatePelanggaranResidenRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PelanggaranResidenController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = PelanggaranResiden::with(['prodi', 'pelanggaran', 'residens']);
            if (auth()->user()->hasRole('prodi')) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            }
            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('prodi', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                        ->orWhereHas('pelanggaran', function ($q) use ($search) {
                            $q->where('nama_pelanggaran', 'like', "%{$search}%");
                        })
                        ->orWhereHas('residens', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhere('sanksi', 'like', "%{$search}%");
                });
            }

            // Filter by prodi
            if ($request->has('prodi_id') && !empty($request->prodi_id)) {
                $query->where('prodi_id', $request->prodi_id);
            }

            // Filter by pelanggaran
            if ($request->has('pelanggaran_id') && !empty($request->pelanggaran_id)) {
                $query->where('pelanggaran_id', $request->pelanggaran_id);
            }

            $pelanggaranResidens = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $pelanggaranResidens,
                'message' => 'Data berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(StorePelanggaranResidenRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $data['file'] = $file->storeAs('pelanggaran-residen', $filename, 'public');
            }

            // Remove residen_ids from data before creating
            $residenIds = $data['residen_ids'];
            unset($data['residen_ids']);

            // Create pelanggaran residen
            $pelanggaranResiden = PelanggaranResiden::create($data);

            // Attach residens
            $pelanggaranResiden->residens()->attach($residenIds);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pelanggaranResiden->load(['prodi', 'pelanggaran', 'residens']),
                'message' => 'Data berhasil ditambahkan'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $pelanggaranResiden = PelanggaranResiden::with(['prodi', 'pelanggaran', 'residens'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $pelanggaranResiden,
                'message' => 'Data berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
    }

    public function update(UpdatePelanggaranResidenRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $pelanggaranResiden = PelanggaranResiden::findOrFail($id);
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($pelanggaranResiden->file) {
                    Storage::disk('public')->delete($pelanggaranResiden->file);
                }

                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $data['file'] = $file->storeAs('pelanggaran-residen', $filename, 'public');
            }

            // Remove residen_ids from data before updating
            $residenIds = $data['residen_ids'];
            unset($data['residen_ids']);

            // Update pelanggaran residen
            $pelanggaranResiden->update($data);

            // Sync residens
            $pelanggaranResiden->residens()->sync($residenIds);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pelanggaranResiden->load(['prodi', 'pelanggaran', 'residens']),
                'message' => 'Data berhasil diperbarui'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $pelanggaranResiden = PelanggaranResiden::findOrFail($id);

            // Delete file if exists
            if ($pelanggaranResiden->file) {
                Storage::disk('public')->delete($pelanggaranResiden->file);
            }

            // Delete relationships
            $pelanggaranResiden->residens()->detach();

            // Delete the record
            $pelanggaranResiden->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get basic options (prodi and pelanggaran only)
    public function getOptions()
    {
        try {
            $prodis = Prodi::select('id', 'name')->get();
            $pelanggarans = Pelanggaran::select('id', 'nama_pelanggaran')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'prodis' => $prodis,
                    'pelanggarans' => $pelanggarans,
                ],
                'message' => 'Options berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil options: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get residents filtered by prodi
    public function getResidensByProdi(Request $request)
    {
        try {
            $prodiId = $request->get('prodi_id');

            if (!$prodiId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prodi ID diperlukan'
                ], 400);
            }

            // Get residents that belong to the specified prodi
            // Assuming users have prodi_id field or relationship
            $residens = User::role('residen')
                ->whereHas('biodata', fn($query) => $query->where('prodi_id', $prodiId))
                ->select('id', 'name', 'username')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $residens,
                'message' => 'Residens berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data residens: ' . $e->getMessage()
            ], 500);
        }
    }
}
