<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LayananAduan extends Model
{
    use HasFactory;
    protected $guarded = ['id'];
    public $with = ['user.biodata.prodi'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
