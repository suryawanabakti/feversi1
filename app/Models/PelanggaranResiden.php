<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PelanggaranResiden extends Model
{
    use HasFactory;

    protected $table = 'pelanggaran_residens';

    protected $fillable = [
        'prodi_id',
        'kronologi',
        'pelanggaran_id',
        'file',
        'sanksi',
    ];

    protected $with = ['prodi', 'pelanggaran'];

    public function prodi()
    {
        return $this->belongsTo(Prodi::class);
    }

    public function pelanggaran()
    {
        return $this->belongsTo(Pelanggaran::class);
    }

    public function residens()
    {
        return $this->belongsToMany(User::class, 'pelanggaran_residen_residens', 'pelanggaran_residen_id', 'user_id')
            ->withTimestamps();
    }

    // Accessor for file URL
    public function getFileUrlAttribute()
    {
        return $this->file ? asset('storage/' . $this->file) : null;
    }
}
