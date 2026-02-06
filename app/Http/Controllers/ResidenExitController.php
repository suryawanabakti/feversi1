<?php

namespace App\Http\Controllers;

use App\Models\ResidenExit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ResidenExitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function search(Request $request): JsonResponse
    {

        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:3|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Query pencarian minimal 3 karakter',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = $request->get('q');
            $limit = $request->get('limit', 10); // Default 10 results

            $users = User::where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                    ->orWhere('username', 'LIKE', "%{$query}%");
            })
                ->when(auth()->user()->hasRole('prodi'), function ($q) {
                    $q->whereHas('biodata', function ($q2) {
                        $q2->where('prodi_id', auth()->user()->prodi->id);
                    });
                })
                ->select('id', 'name', 'username', 'created_at')
                ->orderBy('name', 'asc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil ditemukan',
                'data' => $users,
                'total' => $users->count(),
                'query' => $query
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari data user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function index(): JsonResponse
    {
        try {
            $residenExits = ResidenExit::with(['user:id,name,username', 'user.biodata.prodi'])
                ->orderBy('created_at', 'desc');

            // Role-based filtering
            if (auth()->user()->hasRole('prodi')) {
                $residenExits->whereHas('user.biodata', fn($q) => $q->where('prodi_id', auth()->user()->prodi->id));
            }

            // Search filter
            if (request('search')) {
                $search = request('search');
                $residenExits->where(function ($query) use ($search) {
                    $query->where('alasan', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        })
                        ->orWhereHas('user.biodata.prodi', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Prodi filter
            if (request('prodi_id')) {
                $residenExits->whereHas('user.biodata', fn($q) => $q->where('prodi_id', request('prodi_id')));
            }

            // Alasan filter
            if (request('alasan')) {
                $residenExits->where('alasan', request('alasan'));
            }

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $residenExits->paginate(10)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add this method to get prodi options for the filter
    public function getProdiOptions(): JsonResponse
    {
        try {
            $prodis = \App\Models\Prodi::select('id', 'name')->orderBy('name')->get();

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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'alasan' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filePath = null;
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('residen_exits', $fileName, 'public');
            }

            $residenExit = ResidenExit::create([
                'user_id' => $request->user_id,
                'alasan' => $request->alasan,
                'file' => $filePath,
            ]);

            $residenExit->load('user:id,name,email');

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil disimpan',
                'data' => $residenExit
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $residenExit = ResidenExit::with('user:id,name,email')->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $residenExit
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'alasan' => 'required|string|max:255',
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
            $residenExit = ResidenExit::findOrFail($id);

            $filePath = $residenExit->file;
            if ($request->hasFile('file')) {
                // Delete old file
                if ($filePath && Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }

                // Upload new file
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('residen_exits', $fileName, 'public');
            }

            $residenExit->update([
                'user_id' => $request->user_id,
                'alasan' => $request->alasan,
                'file' => $filePath,
            ]);

            $residenExit->load('user:id,name,email');

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diupdate',
                'data' => $residenExit
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $residenExit = ResidenExit::findOrFail($id);

            // Delete file if exists
            if ($residenExit->file && Storage::disk('public')->exists($residenExit->file)) {
                Storage::disk('public')->delete($residenExit->file);
            }

            $residenExit->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download file
     */
    public function downloadFile(string $id)
    {
        try {
            $residenExit = ResidenExit::findOrFail($id);

            if (!$residenExit->file || !Storage::disk('public')->exists($residenExit->file)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            $filePath = Storage::disk('public')->path($residenExit->file);
            $fileName = basename($residenExit->file);

            return response()->download($filePath, $fileName);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendownload file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
