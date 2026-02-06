<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;

class ReportBeritaAcaraUjianExport implements FromCollection
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function __construct(public $users) {}
    public function collection()
    {
        return $this->users;
    }
}
