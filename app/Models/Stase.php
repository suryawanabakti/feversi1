<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stase extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function prodi()
    {
        return $this->belongsTo(Prodi::class);
    }


    public function rumahsakit()
    {
        return $this->belongsTo(RumahSakit::class, 'rumah_sakit_id', 'id');
    }

    public function staseresiden()
    {
        return $this->hasMany(StaseResiden::class);
    }
}
