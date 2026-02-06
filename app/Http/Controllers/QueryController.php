<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class QueryController extends Controller
{
    public function tambahRoleDanAkun()
    {
        $roleKepala =  Role::create([
            "name" => "kepala"
        ]);

        return User::create([
            "name" => "Dr. Takdir",
            "username" => "kepala",
            "password" => bcrypt("kepala123")
        ])->assignRole("kepala");
    }
}
