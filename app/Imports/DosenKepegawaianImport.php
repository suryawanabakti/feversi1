<?php

namespace App\Imports;

use App\Models\DosenKepegawaian;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DosenKepegawaianImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        // Hapus data lama
        // ResidenKepegawaian::truncate();

        $data = [];

        foreach ($rows as $row) {

            if (!empty($row['nip']) && !empty($row['nama'])) {
                $data[] = [
                    'nip' => $this->cleanNip($row['nip']),
                    'nama' => $row['nama'],
                    'nik' => $row['nik'],
                    'golongan' => $row['golongan'],
                    'jabatan_fungsional' => $row['jabatan_fungsional'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DosenKepegawaian::insert($data);
    }

    private function cleanNip($nip)
    {
        if (empty($nip)) {
            return null;
        }

        return trim(str_replace([' ', '-', '.'], '', $nip));
    }
}
