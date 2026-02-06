<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;


class BlockForeignIP
{
    public function handle(Request $request, Closure $next)
    {
        $location = geoip()->getLocation($request->ip());

        // Hanya izinkan Indonesia (ID)
        if ($location->iso_code !== 'ID') {
            abort(403, 'Akses ditolak: hanya untuk Indonesia.');
        }

        return $next($request);
    }
}
