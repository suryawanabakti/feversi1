<?php
// LewatMasaStudiExport
namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class LewatMasaStudiExport implements FromView
{
    public function __construct(public $data) {}
    public function view(): View
    {
        return view('export.lewat-masa-studi', [
            "data" => $this->data
        ]);
    }
}
