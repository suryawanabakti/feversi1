<?php

namespace App\Imports;

use App\Models\RumahSakit;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RumahSakitImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        //
        foreach ($rows as $row) {
            RumahSakit::create([
                'name' => $row['nama_rumah_sakit']
            ]);
        }
    }
}
