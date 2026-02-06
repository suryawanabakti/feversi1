<?php

namespace App\Imports;

use App\Models\BeritaAcaraUjian;
use App\Models\Prodi;
use App\Models\Regency;
use App\Models\ResidenBiodata;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow; // TAMBAHKAN INI

class AlumniImport implements ToCollection, WithHeadingRow // IMPLEMENTASI
{
    public function collection(Collection $rows)
    {
        $mapBulan = [
            'januari' => 1,
            'februari' => 2,
            'maret' => 3,
            'april' => 4,
            'mei' => 5,
            'juni' => 6,
            'juli' => 7,
            'agustus' => 8,
            'september' => 9,
            'oktober' => 10,
            'november' => 11,
            'desember' => 12,
        ];

        foreach ($rows as $row) {
            // Sekarang $row adalah associative array dengan key nama kolom
            // Tapi nama kolom diubah formatnya (spasi jadi underscore, lowercase)

            // Debug: lihat struktur data
            // dd($row->toArray());

            $kondisi = User::where('username', $row['nim'])->first();
            $prodi = Prodi::where('name', $row['prodi'])->first();
            Log::info('Memproses NIM: ' . $row['nim']);
            $kabupaten = Regency::where('nama', $row['kabupaten'])->first();
            $provinsi = $kabupaten ? $kabupaten->province_id : null;
            Log::info('Nim ' . $row['nim'] . ' - Prodi: ' . $row['prodi'] . ' 
            - Tempat Bertugas: ' . $row['tempat_bertugas'] . ' - Kabupaten: ' . $row['kabupaten'] . ' - Tahun: ' . $row['tahun']);
               $tahun = $row['tahun'];
                $bulan = $mapBulan[strtolower($row['bulan'])];

                $tglUjian = Carbon::create($tahun, $bulan, 1)
                    ->startOfMonth()
                    ->toDateString();
            if (empty($kondisi)) {
                $user = User::create([
                    'name' => $row['nama_residen'],
                    'username' => $row['nim'],
                    'password' => bcrypt($row['nim']),
                ]);
                Log::info('Membuat user baru untuk NIM: ' . $row['nim']);
                ResidenBiodata::create([
                    'user_id' => $user->id,
                    'prodi_id' => $prodi->id,
                    'tempat_bertugas' => $row['tempat_bertugas'],
                    'kabupaten_id' => $kabupaten->id,
                    'provinsi_id' => $provinsi,
                ]);

             

                BeritaAcaraUjian::create([
                    'user_id' => $user->id,
                    'semester' => 'Akhir',
                    'bau' => 'upload-paksa',
                    'tgl_ujian' => $tglUjian,
                ]);

                $user->assignRole('residen');
            } else {
                Log::info('Memperbarui data untuk NIM: ' . $row['nim']);
                ResidenBiodata::where('user_id', $kondisi->id)->update([
                    'prodi_id' => $prodi->id ?? null,
                    'tempat_bertugas' => $row['tempat_bertugas'],
                    'kabupaten_id' => $kabupaten->id ?? null,
                    'provinsi_id' => $provinsi ?? null,
                ]);
                BeritaAcaraUjian::updateOrCreate(
                    [
                        'user_id' => $kondisi->id,
                        'semester' => 'Akhir',
                    ],
                    [
                        'bau' => 'upload-paksa',
                        'tgl_ujian' => $tglUjian,
                    ]
                );
            }
        }
    }

    /**
     * Opsional: Custom heading row (baris berapa header berada)
     */
    public function headingRow(): int
    {
        return 1; // Header di baris pertama (default)
    }
}
