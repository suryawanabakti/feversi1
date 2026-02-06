<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prodi extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function residen_biodatas()
    {
        return $this->hasMany(ResidenBiodata::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sekertariatprodi()
    {
        return $this->belongsTo(Dosen::class, 'sps', 'id');
    }

    public function ketuaprodi()
    {
        return $this->belongsTo(Dosen::class, 'kps', 'id');
    }
}
