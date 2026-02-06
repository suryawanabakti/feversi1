<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        '/alumni/import',
        'alumni/import', // tanpa slash depan juga bisa

        // Atau jika menggunakan named route pattern
        'alumni/*', // akan mengabaikan semua route yang dimulai dengan alumni/
    ];
}
