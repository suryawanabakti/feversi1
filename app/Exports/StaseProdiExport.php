<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class StaseProdiExport implements WithMultipleSheets
{
    protected $groupedData;
    protected $bulan;
    protected $tahun;

    public function __construct($groupedData, $bulan, $tahun)
    {
        $this->groupedData = $groupedData;
        $this->bulan = $bulan;
        $this->tahun = $tahun;
    }

    public function sheets(): array
    {
        $sheets = [];
        
        foreach ($this->groupedData as $prodiData) {
            $sheets[] = new StaseProdiSheet($prodiData, $this->bulan, $this->tahun);
        }
        
        return $sheets;
    }
}

class StaseProdiSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $prodiData;
    protected $bulan;
    protected $tahun;

    public function __construct($prodiData, $bulan, $tahun)
    {
        $this->prodiData = $prodiData;
        $this->bulan = $bulan;
        $this->tahun = $tahun;
    }

    public function collection()
    {
        $data = [];
        
        foreach ($this->prodiData['residen'] as $index => $residen) {
            $data[] = [
                'no' => $index + 1,
                'nim' => $residen->user->username ?? '-',
                'nama' => $residen->user->name ?? '-',
                'rumah_sakit' => $residen->rumahsakit->name ?? '-',
                'tahap' => $residen->tahap ?? '-',
                'jam_kerja' => $residen->jam_kerja ?? 0,
                'bulan' => $residen->bulan ?? '-',
                'tahun' => $residen->tahun ?? '-',
            ];
        }
        
        return collect($data);
    }

    public function headings(): array
    {
        return [
            'No',
            'NIM',
            'Nama Residen',
            'Rumah Sakit',
            'Tahap',
            'Jam Kerja/Minggu',
            'Bulan',
            'Tahun'
        ];
    }

    public function title(): string
    {
        return substr($this->prodiData['prodi'], 0, 31); // Excel sheet name max 31 chars
    }
}