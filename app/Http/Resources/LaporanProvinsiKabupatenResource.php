<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class LaporanProvinsiKabupatenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $ujianAkhir = $this->user->ujian
    ->where('semester', 'Akhir')
    ->first();
        return [
            'namaKabupaten' => $this->kabupaten->nama,
            'id' => $this->user->id,
            'name' => $this->user->name,
            'username' => $this->user->username,
            'prodi' => $this->prodi->name,
            'tempatBertugas' => $this->tempat_bertugas,
             'tglUjian' => $ujianAkhir?->tgl_ujian,
    'tahunLulus' => $ujianAkhir?->tgl_ujian
        ? Carbon::parse($ujianAkhir->tgl_ujian)->format('Y')
        : null,
    'bulanLulus' => $ujianAkhir?->tgl_ujian
        ? Carbon::parse($ujianAkhir->tgl_ujian)->format('M')
        : null,
        ];
    }
}
