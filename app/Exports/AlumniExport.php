<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;

class AlumniExport implements FromCollection, WithHeadings, WithMapping
{
    protected $request;

    public function __construct($request)
    {
        $this->request = $request;
    }

    public function collection()
    {
        $query = User::with('ujian', 'biodata', 'biodata.prodi')
            ->whereHas('ujian', function ($q) {
                $q->where('semester', 'akhir');
            });

        // Jika admin → cek apakah prodiId dikirim dari frontend
        if (Auth::user()->hasRole('admin')) {
            if ($this->request->prodiId && $this->request->prodiId !== 'all') {
                $query->whereHas('biodata', function ($q) {
                    $q->where('prodi_id', $this->request->prodiId);
                });
            }
        }

        // Jika prodi (lock data hanya pada prodi user)
        if (Auth::user()->hasRole('prodi')) {
            $query->whereHas('biodata', function ($q) {
                $q->where('prodi_id', Auth::user()->prodi->id);
            });
        }

        return $query->get();
    }

    public function map($data): array
    {
        $ujianAkhir = $data->ujian?->where('semester', 'Akhir')->first();

        $tglUjian = $ujianAkhir && $ujianAkhir->tgl_ujian
            ? Carbon::parse($ujianAkhir->tgl_ujian)->format('d-m-Y')
            : '-';

        return [
            $data->username ?? '-',
            $data->name ?? '-',
            $data->biodata?->prodi?->name ?? '-',
            $tglUjian,
        ];
    }

    public function headings(): array
    {
        return [
            'Username',
            'Nama',
            'Prodi',
            'Tanggal Ujian Akhir',
        ];
    }
}
