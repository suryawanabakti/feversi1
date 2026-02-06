<?php

namespace App\Http\Controllers;

use App\Imports\AlumniImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AlumniImportController extends Controller
{
    /**
     * Menampilkan form import alumni
     */
    public function showImportForm()
    {
        return view('alumni.import');
    }

    public function downloadTemplate()
    {
        $templatePath = storage_path('app/templates/template_alumni.xlsx');

        if (! file_exists($templatePath)) {
            // Buat template jika belum ada
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();

            // Header kolom
            $headers = ['nim', 'nama_residen', 'prodi', 'tempat_bertugas', 'kabupaten', 'tahun','bulan'];
            $sheet->fromArray($headers, null, 'A1');

            // Contoh data
            $sampleData = [
                ['2023001', 'John Doe', 'Kedokteran', 'RS Umum', 'Jakarta Selatan', '2023', 'Januari'],
                ['2023002', 'Jane Smith', 'Kedokteran Gigi', 'RS Gigi', 'Surabaya', '2023',' Februari'],
            ];
            $sheet->fromArray($sampleData, null, 'A2');

            // Simpan file
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $writer->save($templatePath);
        }

        return response()->download($templatePath, 'template_import_alumni.xlsx');
    }

    /**
     * Proses import data alumni
     */
    public function import(Request $request)
    {

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        try {
            // Import data

            Excel::import(new AlumniImport, $request->file('file'));

            return redirect()->route('alumni.import.form')
                ->with('success', 'Data alumni berhasil diimport!');

        } catch (\Exception $e) {
            return $e->getMessage();

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: '.$e->getMessage());
        }
    }
}
