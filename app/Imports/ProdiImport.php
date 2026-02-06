<?php

namespace App\Imports;

use App\Models\Prodi;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProdiImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        //

        foreach ($rows as $row) {
            $username = strtolower($row['nama_prodi']);
            $username = str_replace("&", "", $username);
            $username = str_replace(" ", "", $username);
            $username = str_replace(".", "", $username);
            $tahun = str_replace(",", ".", $row['masa_studi']);
            $tahun = str_replace(" Tahun", "", $tahun);

            $kondisi = User::where('username', $username)->first();

            if (empty($kondisi)) {
                $user = User::create([
                    'name' => $row['nama_prodi'],
                    'username' => $username,
                    'password' => bcrypt($username)
                ]);

                Prodi::create([
                    'user_id' => $user->id,
                    'name' => $row['nama_prodi'],
                    'masa_studi' => $tahun
                ]);

                $user->assignRole("prodi");
            }
        }
    }
}
