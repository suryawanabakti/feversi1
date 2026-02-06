<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function tempatkerja()
    {
        return $this->hasMany(DosenTempatKerja::class);
    }

    public function skjabatan()
    {
        return $this->hasMany(DosenSkJabatan::class);
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class);
    }
}
