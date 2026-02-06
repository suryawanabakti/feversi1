<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'last_seen',
        'no_wa',
    ];

    public function prodi()
    {
        return $this->hasOne(Prodi::class);
    }

    public function staseresiden()
    {
        return $this->hasMany(StaseResiden::class);
    }

    public function ujian()
    {
        return $this->hasMany(BeritaAcaraUjian::class);
    }

    public function serkom()
    {
        return $this->hasMany(ResidenSerKom::class);
    }


    public function residenExit()
    {
        return $this->hasOne(ResidenExit::class);
    }

    public function biodata()
    {
        return $this->hasOne(ResidenBiodata::class);
    }


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
