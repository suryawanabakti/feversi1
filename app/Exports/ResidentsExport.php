<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ResidentsExport implements FromCollection, WithHeadings
{
    protected $request;

    // constructor untuk terima request
    public function __construct($request)
    {
        $this->request = $request;
    }

    public function collection()
    {
        $query =  User::role('residen')->whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->orderBy('username', 'desc')->with(['biodata', 'biodata.prodi', 'residenExit'])->whereDoesntHave('residenExit');

        // contoh filter berdasarkan tanggal registrasi
        if ($this->request->filled('status')) {
            if ($this->request->status === "belum") {
                $query->whereHas('biodata', fn($q) => $q->whereNull('tanggal_lahir'));
            }
        }
        if ($this->request->filled('prodi_id')) {
            if ($this->request->prodi_id !== "semua") {
                $query->whereHas('biodata', fn($q) => $q->where('prodi_id', $this->request->prodi_id));
            }
        }

        return $query->get()->map(function ($data) {
            return [
                "id" => $data->id,
                "name" => $data->name,
                "username" => $data->username,
                "prodi" => $data->biodata->prodi->name,
                "created_at" => $data->created_at,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama',
            'NIM',
            'Prodi',
            'Tanggal Registrasi',
        ];
    }
}
