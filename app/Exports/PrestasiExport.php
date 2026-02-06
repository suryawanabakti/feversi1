<?php

namespace App\Exports;

use App\Models\ResidenPrestasi;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\FromView;

class PrestasiExport implements FromView
{
    /**
     * @return \Illuminate\Support\Collection
     */

    public function view(): View
    {
        return view('export.prestasi', [
            'prestasi' =>  ResidenPrestasi::with('user')->orderBy('user_id', 'desc')->get()
        ]);
    }

    public function collection()
    {
        //
    }
}
