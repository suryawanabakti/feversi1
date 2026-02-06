<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StaseResource extends JsonResource
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
            'tahun' => $this->tahun,
            'bulan' => $this->bulan,
            'tahap' => $this->tahap,
            'rumah_sakit_id' => $this->rumah_sakit_id,
            'staseresiden' => StaseResidenResource::collection($this->staseresiden),
            'rumahsakit' => $this->rumahsakit,
            'file' => url('storage/' . $this->file)
        ];
    }
}
