<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class AlumniResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'biodata' => [
                'prodi' => [
                    'name' => $this->biodata->prodi->name,
                ],
                'tempat_bertugas' => $this->biodata->tempat_bertugas,
            ],
            'tglUjianAkhir' => Carbon::createFromDate($this->ujian->where('semester', 'Akhir')->first()->tgl_ujian)->format('d-m-Y'),
        ];
    }
}
