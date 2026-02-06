<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
	   public function store2(Request $request)
    {
        $user = Http::withHeaders([
            "username" => 'adminsso',
            "password" => 'qwerty123'
        ])->get("https://ssofk.surya-wanabakti.my.id/login-sso", [
            "token" => $request->token
        ]);

        $login = User::where('username', $user['username'] ?? null)->first();
        if (!empty($login)) {
            Auth::login($login);
            $request->session()->regenerate();
            $expiresAt = now()->addMinutes(2);
            Cache::put('user-is-online-' . Auth::user()->id, true, $expiresAt);
            User::where('id', auth()->user()->id)->update(['last_seen' => now()]);

            return response()->noContent();
        } else {
            return response()->noContent();
        }
    }

    public function store(LoginRequest $request): Response
    {
        $request->authenticate();

        $request->session()->regenerate();
        $expiresAt = now()->addMinutes(2);
        Cache::put('user-is-online-' . Auth::user()->id, true, $expiresAt);
        User::where('id', auth()->user()->id)->update(['last_seen' => now()]);

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
