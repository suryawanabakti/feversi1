<?php

namespace App\Exports;

use App\Models\Dosen;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class DosenExport implements FromView
{
    protected $prodiId;

    public function __construct($prodiId = null)
    {
        $this->prodiId = $prodiId;
    }

    public function view(): View
    {
        $query = Dosen::query();

        if (auth()->user()->hasRole('prodi')) {
            $query->where('prodi_id', auth()->user()->prodi->id);
        } elseif (auth()->user()->hasRole('admin') && $this->prodiId) {
            $query->where('prodi_id', $this->prodiId);
        }

        $dosen = $query->get();

        return view('export.dosen', [
            'dosens' => $dosen,
        ]);
    }
}
