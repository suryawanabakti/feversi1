<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\Pegawai;
use App\Imports\PegawaiImportSimple;
use App\Exports\ComparisonResultExport;
use App\Imports\DosenKepegawaianImport;
use App\Imports\ResidenKepegawaianImport;
use App\Models\Dosen;
use App\Models\DosenKepegawaian;
use App\Models\ResidenKepegawaian;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DataComparisonService
{
    public function importExcelData($file)
    {
        try {
            DB::beginTransaction();

            Log::info('Starting Excel import', [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize()
            ]);

            // Import menggunakan simple method
            Excel::import(new ResidenKepegawaianImport, $file);

            // Hitung jumlah data yang berhasil diimport
            $importedCount = ResidenKepegawaian::count();

            DB::commit();

            Log::info('Excel import completed', [
                'imported_count' => $importedCount
            ]);

            return [
                'success' => true,
                'message' => "Data berhasil diimport. Total: {$importedCount} record",
                'imported_count' => $importedCount
            ];
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();

            $failures = $e->failures();
            $errors = [];

            foreach ($failures as $failure) {
                $errors[] = "Baris {$failure->row()}: " . implode(', ', $failure->errors());
            }

            Log::error('Excel import validation failed', [
                'errors' => $errors
            ]);

            return [
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $errors
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Excel import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'errors' => []
            ];
        }
    }

    public function compareData()
    {
        try {
            Log::info('Starting data comparison');

            // Ambil semua NIM mahasiswa
            $nimMahasiswa = User::role('residen')->pluck('username')->toArray();

            // Ambil semua NIM pegawai
            $nimPegawai = ResidenKepegawaian::pluck('nim')->toArray();

            // Cari mahasiswa yang tidak ada di data pegawai
            $missingFromPegawai = array_diff($nimMahasiswa, $nimPegawai);

            // Cari pegawai yang tidak ada di data mahasiswa
            $missingFromMahasiswa = array_diff($nimPegawai, $nimMahasiswa);

            // Ambil detail mahasiswa yang tidak ada di pegawai
            $mahasiswaNotInPegawai = User::role('residen')->whereIn('username', $missingFromPegawai)
                ->orderBy('username')
                ->get();

            // Ambil detail pegawai yang tidak ada di mahasiswa
            $pegawaiNotInMahasiswa = ResidenKepegawaian::whereIn('nim', $missingFromMahasiswa)
                ->orderBy('nim')
                ->get();

            // Ambil data yang cocok
            $matchingData = $this->getMatchingData($nimMahasiswa, $nimPegawai);

            $result = [
                'mahasiswa_not_in_pegawai' => $mahasiswaNotInPegawai,
                'pegawai_not_in_mahasiswa' => $pegawaiNotInMahasiswa,
                'matching_data' => $matchingData,
                'summary' => [
                    'total_mahasiswa' => count($nimMahasiswa),
                    'total_pegawai' => count($nimPegawai),
                    'missing_from_pegawai' => count($missingFromPegawai),
                    'missing_from_mahasiswa' => count($missingFromMahasiswa),
                    'matching_count' => count($matchingData)
                ]
            ];

            Log::info('Data comparison completed', $result['summary']);

            return $result;
        } catch (\Exception $e) {
            Log::error('Data comparison failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new \Exception('Error saat membandingkan data: ' . $e->getMessage());
        }
    }

    private function getMatchingData($nimMahasiswa, $nimPegawai)
    {
        $matchingNim = array_intersect($nimMahasiswa, $nimPegawai);

        $matchingData = [];
        foreach ($matchingNim as $nim) {
            $mahasiswa = User::role('residen')->where('username', $nim)->first();
            $pegawai = ResidenKepegawaian::where('nim', $nim)->first();

            if ($mahasiswa && $pegawai) {
                $matchingData[] = [
                    'nim' => $nim,
                    'mahasiswa' => $mahasiswa,
                    'pegawai' => $pegawai
                ];
            }
        }

        return $matchingData;
    }

    public function exportComparisonResult($comparisonResult, $fileName = null)
    {
        try {
            if (!$fileName) {
                $fileName = 'hasil_perbandingan_' . date('Y-m-d_H-i-s') . '.xlsx';
            }

            Log::info('Starting export', [
                'file_name' => $fileName,
                'summary' => $comparisonResult['summary']
            ]);

            return Excel::download(
                new ComparisonResultExport($comparisonResult),
                $fileName
            );
        } catch (\Exception $e) {
            Log::error('Export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new \Exception('Error saat export data: ' . $e->getMessage());
        }
    }

    public function getStatistics()
    {
        try {
            $totalMahasiswa = User::role('residen')->count();
            $totalPegawai = ResidenKepegawaian::count();

            return [
                'total_mahasiswa' => $totalMahasiswa,
                'total_pegawai' => $totalPegawai,
                'last_updated' => now()->format('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            Log::error('Get statistics failed', [
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Error saat mengambil statistik: ' . $e->getMessage());
        }
    }

    public function importExcelData2($file)
    {
        try {
            DB::beginTransaction();

            Log::info('Starting Excel import', [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize()
            ]);

            // Import menggunakan simple method
            Excel::import(new DosenKepegawaianImport, $file);

            // Hitung jumlah data yang berhasil diimport
            $importedCount = DosenKepegawaian::count();

            DB::commit();

            Log::info('Excel import completed', [
                'imported_count' => $importedCount
            ]);

            return [
                'success' => true,
                'message' => "Data berhasil diimport. Total: {$importedCount} record",
                'imported_count' => $importedCount
            ];
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();

            $failures = $e->failures();
            $errors = [];

            foreach ($failures as $failure) {
                $errors[] = "Baris {$failure->row()}: " . implode(', ', $failure->errors());
            }

            Log::error('Excel import validation failed', [
                'errors' => $errors
            ]);

            return [
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $errors
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Excel import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'errors' => []
            ];
        }
    }

    public function compareData2()
    {
        try {
            Log::info('Starting data comparison');

            // Ambil semua NIM mahasiswa
            $nipDosen = Dosen::pluck('nip')->toArray();

            // Ambil semua NIM pegawai
            $nipKepegawaian = DosenKepegawaian::pluck('nip')->toArray();

            // Cari mahasiswa yang tidak ada di data pegawai
            $missingFromPegawai = array_diff($nipDosen, $nipKepegawaian);

            // Cari pegawai yang tidak ada di data mahasiswa
            $missingFromDosen = array_diff($nipKepegawaian, $nipDosen);

            // Ambil detail mahasiswa yang tidak ada di pegawai
            $dosenNotInPegawai = Dosen::whereIn('nip', $missingFromPegawai)
                ->orderBy('nip')
                ->get();

            // Ambil detail pegawai yang tidak ada di mahasiswa
            $pegawaiNotInDosen = DosenKepegawaian::whereIn('nip', $missingFromDosen)
                ->orderBy('nip')
                ->get();

            // Ambil data yang cocok
            $matchingData = $this->getMatchingData2($nipDosen, $nipKepegawaian);

            $result = [
                'dosen_not_in_pegawai' => $dosenNotInPegawai,
                'pegawai_not_in_dosen' => $pegawaiNotInDosen,
                'matching_data' => $matchingData,
                'summary' => [
                    'total_dosen' => count($nipDosen),
                    'total_pegawai' => count($nipKepegawaian),
                    'missing_from_pegawai' => count($missingFromPegawai),
                    'missing_from_dosen' => count($missingFromDosen),
                    'matching_count' => count($matchingData)
                ]
            ];

            Log::info('Data comparison completed', $result['summary']);

            return $result;
        } catch (\Exception $e) {
            Log::error('Data comparison failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new \Exception('Error saat membandingkan data: ' . $e->getMessage());
        }
    }

    private function getMatchingData2($nipDosen, $nipPegawai)
    {
        $matchingNip = array_intersect($nipDosen, $nipPegawai);
        Log::info("Matching NIP", [
            "matchingNip" => $matchingNip,
            "nipDosen" => $nipDosen,
            "nipPegawai" => $nipPegawai
        ]);
        $matchingData = [];
        foreach ($matchingNip as $nip) {
            $dosen = Dosen::where('nip', $nip)->first();
            $pegawai = DosenKepegawaian::where('nip', $nip)->first();

            if ($dosen && $pegawai) {
                $matchingData[] = [
                    'nip' => $nip,
                    'dosen' => $dosen,
                    'pegawai' => $pegawai
                ];
            }
        }

        return $matchingData;
    }

    public function exportComparisonResult2($comparisonResult, $fileName = null)
    {
        try {
            if (!$fileName) {
                $fileName = 'hasil_perbandingan_' . date('Y-m-d_H-i-s') . '.xlsx';
            }

            Log::info('Starting export', [
                'file_name' => $fileName,
                'summary' => $comparisonResult['summary']
            ]);

            return Excel::download(
                new ComparisonResultExport($comparisonResult),
                $fileName
            );
        } catch (\Exception $e) {
            Log::error('Export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new \Exception('Error saat export data: ' . $e->getMessage());
        }
    }

    public function getStatistics2()
    {
        try {
            $totalDosen = Dosen::count();
            $totalPegawai = DosenKepegawaian::count();

            return [
                'total_dosen' => $totalDosen,
                'total_pegawai' => $totalPegawai,
                'last_updated' => now()->format('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            Log::error('Get statistics failed', [
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Error saat mengambil statistik: ' . $e->getMessage());
        }
    }
}
