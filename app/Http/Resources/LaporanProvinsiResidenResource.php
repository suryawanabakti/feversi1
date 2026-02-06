<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LaporanProvinsiResidenResource extends JsonResource
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
            'namaProvinsi' => $this->provinsi->nama,
            'id' => $this->user->id,
            'name' => $this->user->name,
            'username' => $this->user->username,
            'prodi' => $this->prodi->name,
            'tempatBertugas' => $this->tempat_bertugas,
        ];
    }
}
