<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaseResiden extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stase()
    {
        return $this->belongsTo(Stase::class);
    }

    public function rumahsakit()
    {
        return $this->belongsTo(RumahSakit::class, 'rumah_sakit_id', 'id');
    }
}
