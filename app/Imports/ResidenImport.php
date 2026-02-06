<?php

namespace App\Imports;

use App\Models\Prodi;
use App\Models\ResidenBiodata;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ResidenImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $kondisi = User::where('username', $row['nim'])->first();
            $prodi = Prodi::where('name', $row['prodi'])->first();


            if (empty($kondisi)) {
                $user = User::create([
                    'name' => $row['nama_residen'],
                    'username' => $row['nim'],
                    'password' =>  bcrypt($row['nim']),
                ]);

                ResidenBiodata::create([
                    'user_id' => $user->id,
                    'prodi_id' => $prodi->id,
                ]);

                $user->assignRole("residen");
            }
        }
    }
}
