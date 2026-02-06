<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RumahSakitAndResidenResource extends JsonResource
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
            'user_id' => $this->user_id,
            'rumah_sakit_id' => $this->stase->rumah_sakit_id,
            'nama_rs' => $this->stase->rumahsakit->name,
        ];
    }
}
