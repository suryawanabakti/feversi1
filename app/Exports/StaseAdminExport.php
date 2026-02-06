<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class StaseAdminExport implements FromView
{
    public $stase;
    public function __construct($stase)
    {
        $this->stase  = $stase;
    }

    public function view(): View
    {
        return view('export.stase-admin-excel', [
            "stase" => $this->stase
        ]);
    }
}
