<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ComparisonResultExport implements WithMultipleSheets
{
    protected $comparisonResult;

    public function __construct($comparisonResult)
    {
        $this->comparisonResult = $comparisonResult;
    }

    public function sheets(): array
    {
        return [
            new MahasiswaNotInPegawaiSheet($this->comparisonResult['mahasiswa_not_in_pegawai']),
            new PegawaiNotInMahasiswaSheet($this->comparisonResult['pegawai_not_in_mahasiswa']),
            new MatchingDataSheet($this->comparisonResult['matching_data']),
            new SummarySheet($this->comparisonResult['summary']),
        ];
    }
}

class MahasiswaNotInPegawaiSheet implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data->map(function ($mahasiswa) {
            return [
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'NIM',
            'Nama',
        ];
    }

    public function title(): string
    {
        return 'Mahasiswa Tidak di Pegawai';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class PegawaiNotInMahasiswaSheet implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data->map(function ($pegawai) {
            return [
                'nim' => $pegawai->nim,
                'nama' => $pegawai->nama,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'NIM',
            'Nama',
        ];
    }

    public function title(): string
    {
        return 'Pegawai Tidak di Mahasiswa';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class MatchingDataSheet implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data)->map(function ($match) {
            return [
                'nim' => $match['nim'],
                'nama_mahasiswa' => $match['mahasiswa']->nama,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'NIM',
            'Nama Mahasiswa',
        ];
    }

    public function title(): string
    {
        return 'Data Cocok';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class SummarySheet implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected $summary;

    public function __construct($summary)
    {
        $this->summary = $summary;
    }

    public function collection()
    {
        return collect([
            ['Keterangan', 'Jumlah'],
            ['Total Mahasiswa', $this->summary['total_mahasiswa']],
            ['Total Pegawai', $this->summary['total_pegawai']],
            ['Mahasiswa Tidak di Pegawai', $this->summary['missing_from_pegawai']],
            ['Pegawai Tidak di Mahasiswa', $this->summary['missing_from_mahasiswa']],
            ['Data Cocok', $this->summary['matching_count']],
        ]);
    }

    public function headings(): array
    {
        return [];
    }

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
            'A:B' => ['font' => ['bold' => true]],
        ];
    }
}
