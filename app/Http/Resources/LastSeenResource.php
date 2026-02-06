<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Cache;

class LastSeenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {

        if (Cache::has('user-is-online-' . $this->id)) {
            $status = true;
        } else {
            $status = false;
        }

        return [
            'name' => $this->name,
            'lastSeen' => Carbon::createFromDate($this->last_seen)->diffForHumans(),
            'isOnline' => $status,
        ];
    }
}
