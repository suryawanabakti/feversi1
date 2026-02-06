<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ResidenBiodataExport implements FromCollection, WithHeadings, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->orderBy('username', 'desc')->with('biodata', 'biodata.prodi', 'biodata.provinsi', 'biodata.kabupaten')
            ->whereHas('biodata', fn($q) => $q->where('prodi_id', 31))
            ->role('residen')->get()->map(function ($data) {
                return [
                    "id" => $data->id,
                    "nim" => $data->username,
                    "nama" => $data->name,
                    "prodi" => $data->biodata->prodi->name ?? null,
                    "jk" => $data->biodata->jenis_kelamin ?? null,
                    "nik" => $data->biodata->nik ?? null,
                    "tahunmasuk" => $data->biodata->tahunmasuk ?? null,
                    "semester" => $data->biodata->semester ?? null,
                    "tanggal_lahir" => $data->biodata->tanggal_lahir ?? null,
                    "provinsi" => $data->biodata->provinsi->nama ?? null,
                    "kabupaten" => $data->biodata->kabupaten->nama ?? null,
                    "asal_fk" => $data->biodata->asal_fk ?? null,
                    "akreditasi" => $data->biodata->akreditasi ?? null,
                    "tempat_kerja_sebelumnya" => $data->biodata->tempat_kerja_sebelumnya ?? null,
                    "status_pembiyaan" => $data->biodata->status_pembiyaan ?? null,
                    "beasiswa" => $data->biodata->beasiswa ?? $data->biodata->beasiswa_dll ?? null,
                    "ipk" => $data->biodata->ipk ?? null,
                ];
            });
    }

    public function headings(): array
    {
        return [
            'ID',
            'NIM',
            'NAMA',
            'PRODI',
            'JENIS KELAMIN',
            'NIK',
            'TAHUN MASUK',
            'SEMESTER',
            'TANGGAL LAHIR',
            'PROVINSI',
            'KABUPATEN/KOTA',
            'ASAL FK',
            'AKREDITAS',
            'TEMPAT KERJA SEBELUMNYA',
            'STATUS PEMBIAYAAN',
            'BEASISWA',
            'IPK'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [ // Apply styles to the first row (header)
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'], // White text color
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFFF0000'], // Red background color
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }
}
