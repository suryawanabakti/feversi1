<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    //
    public function changePassword(Request $request)
    {
        $request->validate([
            'password' => 'confirmed'
        ]);

        return User::where('id', auth()->id())->update([
            'password' => bcrypt($request->password)
        ]);
    }

    public function resetPassword($id)
    {
        $user = User::where("id", $id)->first();

        User::where('id', $id)->update([
            'password' => bcrypt($user->username)
        ]);
    }
}
