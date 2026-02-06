<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DosenKepegawaian;
use App\Models\ResidenBiodata;
use App\Models\ResidenKepegawaian;
use Illuminate\Http\Request;
use App\Services\DataComparisonService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class DataComparisonController extends Controller
{
    protected $comparisonService;

    public function __construct(DataComparisonService $comparisonService)
    {
        $this->comparisonService = $comparisonService;
    }

    /**
     * Upload file Excel dan lakukan perbandingan data
     */
    public function upload(Request $request)
    {
        ResidenKepegawaian::truncate();

        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'excel_file' => 'required|file|mimes:xlsx,xls,csv|max:10240' // 10MB max
            ], [
                'excel_file.required' => 'File Excel wajib dipilih',
                'excel_file.file' => 'File yang diupload tidak valid',
                'excel_file.mimes' => 'File harus berformat Excel (.xlsx, .xls) atau CSV',
                'excel_file.max' => 'Ukuran file maksimal 10MB'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Log untuk debugging
            Log::info('Starting file upload process', [
                'file_name' => $request->file('excel_file')->getClientOriginalName(),
                'file_size' => $request->file('excel_file')->getSize(),
                'user_ip' => $request->ip()
            ]);

            // Import data dari Excel
            $importResult = $this->comparisonService->importExcelData($request->file('excel_file'));

            if (!$importResult['success']) {
                Log::error('Import failed', $importResult);

                return response()->json([
                    'success' => false,
                    'message' => $importResult['message'],
                    'errors' => $importResult['errors'] ?? []
                ], 400);
            }

            Log::info('Import successful, starting comparison');

            // Lakukan perbandingan
            $comparisonResult = $this->comparisonService->compareData();

            // Simpan hasil ke session untuk export
            session(['comparison_result' => $comparisonResult]);

            Log::info('Comparison completed successfully', [
                'total_mahasiswa' => $comparisonResult['summary']['total_mahasiswa'],
                'total_pegawai' => $comparisonResult['summary']['total_pegawai'],
                'missing_count' => $comparisonResult['summary']['missing_from_pegawai']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diimport dan dibandingkan!',
                'data' => $comparisonResult
            ], 200);
        } catch (\Exception $e) {
            Log::error('Upload process failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'errors' => []
            ], 500);
        }
    }

    /**
     * Export hasil perbandingan ke Excel
     */
    public function export(Request $request)
    {
        try {
            $comparisonResult = session('comparison_result');

            if (!$comparisonResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data untuk diexport. Silakan upload file terlebih dahulu.'
                ], 404);
            }

            Log::info('Starting export process');

            $fileName = 'hasil_perbandingan_' . date('Y-m-d_H-i-s') . '.xlsx';

            return $this->comparisonService->exportComparisonResult($comparisonResult, $fileName);
        } catch (\Exception $e) {
            Log::error('Export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal export data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download template Excel
     */
    public function downloadTemplate(Request $request)
    {
        try {
            Log::info('Template download requested');

            $data = [
                ['NIM', 'Nama'],
            ];

            return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
                protected $data;

                public function __construct($data)
                {
                    $this->data = $data;
                }

                public function array(): array
                {
                    return $this->data;
                }
            }, 'template_pegawai.xlsx');
        } catch (\Exception $e) {
            Log::error('Template download failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal download template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get history perbandingan (optional)
     */
    public function getHistory(Request $request)
    {
        try {
            // Implementasi untuk mendapatkan history jika diperlukan
            $history = []; // Placeholder

            return response()->json([
                'success' => true,
                'data' => $history
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get history failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear data perbandingan
     */
    public function clearData(Request $request)
    {
        try {
            // Hapus session data
            session()->forget('comparison_result');

            // Optional: Hapus data pegawai dari database
            // Pegawai::truncate();

            Log::info('Comparison data cleared');

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Clear data failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current comparison result
     */
    public function getCurrentResult(Request $request)
    {
        try {
            $comparisonResult = session('comparison_result');

            if (!$comparisonResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data perbandingan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $comparisonResult
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get current result failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload file Excel dan lakukan perbandingan data
     */
    public function upload2(Request $request)
    {
        DosenKepegawaian::truncate();

        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'excel_file' => 'required|file|mimes:xlsx,xls,csv|max:10240' // 10MB max
            ], [
                'excel_file.required' => 'File Excel wajib dipilih',
                'excel_file.file' => 'File yang diupload tidak valid',
                'excel_file.mimes' => 'File harus berformat Excel (.xlsx, .xls) atau CSV',
                'excel_file.max' => 'Ukuran file maksimal 10MB'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Log untuk debugging
            Log::info('Starting file upload process', [
                'file_name' => $request->file('excel_file')->getClientOriginalName(),
                'file_size' => $request->file('excel_file')->getSize(),
                'user_ip' => $request->ip()
            ]);

            // Import data dari Excel
            $importResult = $this->comparisonService->importExcelData2($request->file('excel_file'));

            if (!$importResult['success']) {
                Log::error('Import failed', $importResult);

                return response()->json([
                    'success' => false,
                    'message' => $importResult['message'],
                    'errors' => $importResult['errors'] ?? []
                ], 400);
            }

            Log::info('Import successful, starting comparison');

            // Lakukan perbandingan
            $comparisonResult = $this->comparisonService->compareData2();

            // Simpan hasil ke session untuk export
            session(['comparison_result' => $comparisonResult]);

            Log::info('Comparison completed successfully', [
                'total_dosen' => $comparisonResult['summary']['total_dosen'],
                'total_pegawai' => $comparisonResult['summary']['total_pegawai'],
                'missing_count' => $comparisonResult['summary']['missing_from_pegawai']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diimport dan dibandingkan!',
                'data' => $comparisonResult
            ], 200);
        } catch (\Exception $e) {
            Log::error('Upload process failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'errors' => []
            ], 500);
        }
    }

    /**
     * Export hasil perbandingan ke Excel
     */
    public function export2(Request $request)
    {
        try {
            $comparisonResult = session('comparison_result');

            if (!$comparisonResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data untuk diexport. Silakan upload file terlebih dahulu.'
                ], 404);
            }

            Log::info('Starting export process');

            $fileName = 'hasil_perbandingan_' . date('Y-m-d_H-i-s') . '.xlsx';

            return $this->comparisonService->exportComparisonResult2($comparisonResult, $fileName);
        } catch (\Exception $e) {
            Log::error('Export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal export data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download template Excel
     */
    public function downloadTemplate2(Request $request)
    {
        try {
            Log::info('Template download requested');

            $data = [
                ['NIP', 'Nama', 'nik', 'golongan', 'jabatan_fungsional'],
            ];

            return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
                protected $data;

                public function __construct($data)
                {
                    $this->data = $data;
                }

                public function array(): array
                {
                    return $this->data;
                }
            }, 'template_pegawai.xlsx');
        } catch (\Exception $e) {
            Log::error('Template download failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal download template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get history perbandingan (optional)
     */
    public function getHistory2(Request $request)
    {
        try {
            // Implementasi untuk mendapatkan history jika diperlukan
            $history = []; // Placeholder

            return response()->json([
                'success' => true,
                'data' => $history
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get history failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear data perbandingan
     */
    public function clearData2(Request $request)
    {
        try {
            // Hapus session data
            session()->forget('comparison_result');

            // Optional: Hapus data pegawai dari database
            // Pegawai::truncate();

            Log::info('Comparison data cleared');

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Clear data failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current comparison result
     */
    public function getCurrentResult2(Request $request)
    {
        try {
            $comparisonResult = session('comparison_result');

            if (!$comparisonResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data perbandingan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $comparisonResult
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get current result failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }
}
