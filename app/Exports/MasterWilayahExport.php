<?php

namespace App\Exports;

use App\Models\Prodi;
use App\Models\Province;
use App\Models\Regency;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class MasterWilayahExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        $prodi = Prodi::select('name')->get();
        $regencies = Regency::select('nama')->get();
        $provinces = Province::select('nama')->get();

        $rows = new Collection;

        /**
         * Loop data & gabungkan jadi satu sheet
         */
        $max = max(
            $prodi->count(),
            $regencies->count(),
            $provinces->count()
        );

        for ($i = 0; $i < $max; $i++) {
            $rows->push([
                'prodi' => $prodi[$i]->name ?? '',
                'provinsi' => $provinces[$i]->nama ?? '',
                'kabupaten' => $regencies[$i]->nama ?? '',
            ]);
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Nama Prodi',
            'Provinsi',
            'Kabupaten',
        ];
    }
}
