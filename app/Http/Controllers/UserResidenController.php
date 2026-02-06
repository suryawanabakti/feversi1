<?php
// baruus new
namespace App\Http\Controllers;

use App\Exports\ResidentsExport;
use App\Imports\ResidenImport;
use App\Models\BeritaAcaraUjian;
use App\Models\ResidenBiodata;
use App\Models\ResidenKhs;
use App\Models\ResidenKrs;
use App\Models\AbstrakJurnal;
use App\Models\ResidenPrestasi;
use App\Models\ResidenSerKom;
use App\Models\Spp;
use App\Models\StaseResiden;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;


class UserResidenController extends Controller
{
    public function export(Request $request)
    {
        return Excel::download(new ResidentsExport($request), 'residen.xlsx');
    }
    public function bulkUpdateTahap(Request $request)
    {
        ResidenBiodata::whereIn('user_id', $request->residen_ids)->update([
            "tahap" => $request->tahap
        ]);
        return $request;
    }
    public function getSerkom($user)
    {
        return User::with('serkom')->where('id', $user)->first();
    }

    public function deleteSerkom($id)
    {
        $serkom = ResidenSerKom::find($id);
        if ($serkom->user_id == auth()->id()) {
            $filePath = public_path('serkom/');
            $currentFile = $serkom->file;
            if (file_exists($filePath . $currentFile)) {
                @unlink($filePath . $currentFile);
            }

            return ResidenSerKom::destroy($id);
        } else {
            return response()->json([
                "message" => "User id tidak sama dengan serkom id"
            ], 422);
        }
    }

    public function getSerkom2()
    {
        return User::with('serkom')->where('id', auth()->id())->first();
    }

    public function storeSerkom2(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
        ]);

        try {
            // Generate nama file unik
            $fileName = 'serkom_' . auth()->id() . '_' . time() . '_' . Str::random(6) . '.' . $request->file('file')->getClientOriginalExtension();

            // Simpan ke storage/app/serkom
            $path = $request->file('file')->storeAs('serkom', $fileName);

            // Simpan ke database
            return ResidenSerKom::create([
                'user_id' => auth()->id(),
                'name' => $request->name,
                'file' => $fileName,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload file gagal.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeSerkom(Request $request, $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|file|mimes:png,jpg,jpeg,pdf|max:5000',
        ]);

        try {
            // Buat nama file unik
            $fileName = 'serkom_' . $user . '_' . time() . '_' . Str::random(6) . '.' . $request->file('file')->getClientOriginalExtension();

            // Simpan ke folder storage/app/serkom
            $path = $request->file('file')->storeAs('serkom', $fileName);

            // Simpan ke DB
            return ResidenSerKom::create([
                'user_id' => $user,
                'name' => $request->name,
                'file' => $fileName,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload sertifikat gagal. Silakan coba lagi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getStatusBiodataBelumMengisi()
    {
        $user =  User::role('residen')->whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->with('biodata', 'biodata.prodi')->orderBy('created_at', 'desc');

        $user->whereHas('biodata', function ($query) {
            $query->whereNull('jenis_kelamin')->where('prodi_id', auth()->user()->prodi->id);
        });

        return $user->get();
    }

    public function getStatusBiodataResiden()
    {
        $sudahIsiBiodata = User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) {
            $query->where('prodi_id', auth()->user()->prodi?->id);
            $query->whereNotNull('jenis_kelamin');
        })->role('residen')
            ->count();

        $belumIsiBiodata = User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->whereHas('biodata', function ($query) {
            $query->where('prodi_id', auth()->user()->prodi?->id);
            $query->whereNull('jenis_kelamin');
        })->orderBy('username', 'desc')->role('residen')->count();

        return response()->json([
            'sudahIsiBiodata' => $sudahIsiBiodata,
            'belumIsiBiodata' => $belumIsiBiodata
        ]);
    }

    public function getResidenTerm(Request $request)
    {
        // Jika request.data berisi angka halaman dari select2
        if ($request->data) {
            $request['page'] = $request->data;
        }

        // Query dasar: user yang tidak memiliki ujian semester akhir & tidak memiliki residenExit
        $user = User::query()
            ->whereDoesntHave('ujian', function ($query) {
                $query->where('semester', 'akhir');
            })
            ->whereDoesntHave('residenExit')
            ->with(['biodata', 'biodata.prodi', 'residenExit'])
            ->orderBy('username', 'desc');

        // Filter khusus untuk role prodi
        if (auth()->user()->hasRole('prodi')) {
            $user->whereHas('biodata.prodi', function ($query) {
                $query->where('id', auth()->user()->prodi->id);
            });
        }

        // Pencarian / term
        if ($request->term) {
            $term = $request->term;

            $user->where(function ($q) use ($term) {

                // Cari berdasarkan name & username
                $q->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('username', 'LIKE', "%{$term}%")

                    // Cari berdasarkan nama prodi
                    ->orWhereHas('biodata.prodi', function ($query) use ($term) {
                        $query->where('name', 'LIKE', "%{$term}%");
                    });
            });
        }

        // Filter Prodi ID
        if ($request->prodiId !== "semua") {
            $user->whereHas('biodata.prodi', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }

        // Filter Status: belum mengisi biodata
        if ($request->status === "belum") {
            $user->whereHas('biodata', function ($query) {
                $query->whereNull('jenis_kelamin');
            });
        }

        // Filter Status: sudah lengkap biodatanya
        if ($request->status === "sudah") {
            $user->whereHas('biodata', function ($query) {
                $query->whereNotNull('ktp')
                    ->whereNotNull('jenis_kelamin');
            });
        }

        return $user->role('residen')->paginate(10);
    }


    public function index()
    {
        $user =  User::whereDoesntHave('ujian', function ($query) {
            return $query->where('semester', 'akhir');
        })->orderBy('username', 'desc')->with('biodata', 'biodata.prodi', 'residenExit')->whereDoesntHave('residenExit');

        if (auth()->user()->hasRole('prodi')) {
            $user->whereHas('biodata', function ($query) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            });
        }

        return $user->role('residen')->paginate(10);
    }

    public function sampel()
    {
        return response()->download('sampel/residensample.xlsx');
    }

    public function show($id)
    {
        return User::role('residen')->where('id', $id)->first();
    }

    public function getKhs($user)
    {
        return ResidenKhs::with('user')->where('user_id', $user)->get();
    }

    public function getKrs($user)
    {
        if (auth()->user()->hasRole('admin')) {
            return ResidenKrs::with('user')->where('user_id', $user)->get();
        }
        if (auth()->user()->hasRole('prodi')) {
            return ResidenKrs::whereHas('user.biodata', fn($query) =>  $query->where('prodi_id', auth()->user()->prodi->id))->with('user')->where('user_id', $user)->get();
        }
    }

    public function getSpp($user)
    {
        return Spp::with('user')->where('user_id', $user)->get();
    }

    public function getPrestasi($user)
    {
        if (auth()->user()->hasRole('admin')) {
            return ResidenPrestasi::with('user.biodata')->where('user_id', $user)->get();
        }
        if (auth()->user()->hasRole('prodi')) {
            return ResidenPrestasi::whereHas('user.biodata', fn($query) => $query->where('prodi_id', auth()->user()->prodi->id))->with('user')->where('user_id', $user)->get();
        }
    }

    public function getAbstrak($user)
    {
        if (auth()->user()->hasRole('admin')) {
            return AbstrakJurnal::with('user')->where('user_id', $user)->get();
        }
        if (auth()->user()->hasRole('prodi')) {
            return AbstrakJurnal::whereHas('user.biodata', fn($query) => $query->where('prodi_id', auth()->user()->prodi->id))->with('user')->where('user_id', $user)->get();
        }
    }

    public function getUjian($user)
    {
        if (auth()->user()->hasRole('admin')) {
            return BeritaAcaraUjian::with('user')->where('user_id', $user)->get();
        }
        if (auth()->user()->hasRole('prodi')) {
            return BeritaAcaraUjian::whereHas('user.biodata', fn($query) => $query->where('prodi_id', auth()->user()->prodi->id))->with('user')->where('user_id', $user)->get();
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'username' => 'required|alpha_dash|max:255',
            'name' => 'required|string|max:255',
            'tahap' => 'nullable'
        ]);

        ResidenBiodata::where('user_id', $id)->update([
            "tahap" => $request->tahap,
        ]);

        $user = User::where('id', $id)->update([
            'username' => $request->username,
            'name' => $request->name,
        ]);

        return $request;
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users|alpha_dash|max:255',
            'name' => 'required|string|max:255',
            'prodiId' => 'required'
        ]);

        $user = User::create([
            'username' => $request->username,
            'name' => $request->name,
            'password' => bcrypt($request->username)
        ]);

        ResidenBiodata::create([
            'user_id' => $user->id,
            'prodi_id' => $request->prodiId,
        ]);

        $user->assignRole("residen");
    }

    public function getBiodata($id)
    {
        if (auth()->user()->hasRole('admin')) {
            return ResidenBiodata::with('user', 'prodi', 'kabupaten', 'provinsi')->where('user_id', $id)->first();
        }
        if (auth()->user()->hasRole('prodi')) {
            return ResidenBiodata::where('prodi_id', auth()->user()->prodi->id)->with('user', 'prodi', 'kabupaten', 'provinsi')->where('user_id', $id)->first();
        }
    }

    public function destroy($id)
    {
        StaseResiden::where('user_id', $id)->delete();
        User::destroy($id);
    }

    // public function deleteAll(Request $request)
    // {
    //     foreach ($request->pilihan as $pilihan) {
    //         User::destroy($pilihan);
    //     }
    // }

    public function import(Request $request)
    {
        Excel::import(new ResidenImport(), $request->file('file'));
    }
}
