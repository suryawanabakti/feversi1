<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RumahSakit extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'kategori' => 'array', // otomatis jadi array saat diambil
    ];

    public function stase()
    {
        return $this->hasMany(Stase::class);
    }

    public function staseresiden()
    {
        return $this->hasMany(StaseResiden::class);
    }
}
