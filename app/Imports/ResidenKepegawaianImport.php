<?php

namespace App\Imports;

use App\Models\Pegawai;
use App\Models\ResidenKepegawaian;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ResidenKepegawaianImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        // Hapus data lama
        // ResidenKepegawaian::truncate();

        $data = [];

        foreach ($rows as $row) {
            if (!empty($row['nim']) && !empty($row['nama'])) {
                $data[] = [
                    'nim' => $this->cleanNim($row['nim']),
                    'nama' => $row['nama'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        ResidenKepegawaian::insert($data);
    }

    private function cleanNim($nim)
    {
        if (empty($nim)) {
            return null;
        }

        return trim(str_replace([' ', '-', '.'], '', $nim));
    }

    private function parseDate($date)
    {
        if (empty($date)) {
            return null;
        }

        try {
            if (is_numeric($date)) {
                $excelEpoch = new \DateTime('1900-01-01');
                $excelEpoch->modify('-2 days');
                $excelEpoch->modify('+' . intval($date) . ' days');
                return $excelEpoch->format('Y-m-d');
            }

            return Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}


// ResidenKepegawaianImport