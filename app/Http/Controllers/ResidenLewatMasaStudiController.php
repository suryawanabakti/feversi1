<?php

namespace App\Http\Controllers;

use App\Exports\LewatMasaStudiExport;
use App\Jobs\SendEmailJob;
use App\Mail\PemberitahuanLewatMasaStudiMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;

class ResidenLewatMasaStudiController extends Controller
{
    public function index(Request $request)
    {
        $users = User::role('residen')
            ->orderBy('username', 'desc')
            ->whereDoesntHave('ujian', function ($query) {
                $query->where('semester', 'akhir');
            })
            ->with('biodata.prodi')
            ->when(request('tahunMasuk'), function ($query) {
                $query->whereHas('biodata', function ($q) {
                    $q->where('tahunmasuk', request('tahunMasuk'));
                });
            });

        if ($request->prodiId) {
            $users->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }

        if (auth()->user()->hasRole('prodi')) {
            $users->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', auth()->user()->prodi->id);
            });
        }

        $users = $users->get();
        $residenHabisMasaStudi = [];

        foreach ($users as $user) {
            if (strlen($user->username) == 10) {
                $awalAkhir = substr($user->username, 6, 1);
                if ($awalAkhir == 1) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-15");
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-15");
                } elseif ($awalAkhir == 2) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-15")->addMonth(6);
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-20")->addMonth(6);
                }

                $masaStudi = $user->biodata->prodi->masa_studi;
                $parts = explode('.', (string)$masaStudi);
                if (count($parts) > 1) {
                    $addMonth = 6; // Mengembalikan bagian desimal
                } else {
                    $addMonth = 0; // Tidak ada angka di belakang koma
                }

                $tahunLewatMasaStudiResiden =  $tahunResidenMasuk->addYears($masaStudi)->addMonth($addMonth);

                if ($tahunLewatMasaStudiResiden < Carbon::now()) {
                    $residenHabisMasaStudi[] = [
                        "id" => $user->id,
                        "name" => $user->name,
                        "username" => $user->username,
                        "email" => $user->biodata->email,
                        "masaStudi" => $masaStudi,
                        "tahunResidenMasuk" => $responseTahunResidenMasuk->format('M Y'),
                        "tahunLewatMasaStudiResiden" => $tahunLewatMasaStudiResiden->format('M Y'),
                        'sudahLewat' => $tahunLewatMasaStudiResiden->diff(Carbon::now())->format('%y thn, %m bln'),
                        "proposal" => $user->ujian->where('semester', 'Proposal')->first() ?? null,
                        "hasil" => $user->ujian->where('semester', 'Hasil')->first() ?? null,
                        "akhir" => $user->ujian->where('semester', 'Akhir')->first() ?? null,
                        "nasional" => $user->ujian->where('semester', 'Nasional')->first() ?? null,
                    ];
                }
            }

            if (strlen($user->username) == 11) {
                $awalAkhir = substr($user->username, 7, 1);
                if ($awalAkhir == 1) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-15");
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-15");
                } elseif ($awalAkhir == 2) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-15")->addMonth(6);
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-20")->addMonth(6);
                }

                $masaStudi = $user->biodata->prodi->masa_studi;
                $parts = explode('.', (string)$masaStudi);
                if (count($parts) > 1) {
                    $addMonth = 6; // Mengembalikan bagian desimal
                } else {
                    $addMonth = 0; // Tidak ada angka di belakang koma
                }

                $tahunLewatMasaStudiResiden =  $tahunResidenMasuk->addYears($masaStudi)->addMonth($addMonth);

                if ($tahunLewatMasaStudiResiden < Carbon::now()) {
                    $residenHabisMasaStudi[] = [
                        "id" => $user->id,
                        "name" => $user->name,
                        "username" => $user->username,
                        "email" => $user->biodata->email,
                        "masaStudi" => $masaStudi,
                        "tahunResidenMasuk" => $responseTahunResidenMasuk->format('M Y'),
                        "tahunLewatMasaStudiResiden" => $tahunLewatMasaStudiResiden->format('M Y'),
                        'sudahLewat' => $tahunLewatMasaStudiResiden->diff(Carbon::now())->format('%y thn, %m bln, %d hari'),
                        "proposal" => $user->ujian->where('semester', 'Proposal')->first() ?? null,
                        "hasil" => $user->ujian->where('semester', 'Hasil')->first() ?? null,
                        "akhir" => $user->ujian->where('semester', 'Akhir')->first() ?? null,
                        "nasional" => $user->ujian->where('semester', 'Nasional')->first() ?? null,
                    ];
                }
            }
        }

        return $residenHabisMasaStudi;
    }
    public function export(Request $request)
    {
        $users = User::role('residen')->orderBy('username', 'desc')->whereDoesntHave('ujian', function ($query) {
            $query->where('semester', 'akhir');
        })->with('biodata.prodi');
        if ($request->prodiId) {
            $users->whereHas('biodata', function ($query) use ($request) {
                $query->where('prodi_id', $request->prodiId);
            });
        }
        $users = $users->get();
        $residenHabisMasaStudi = [];

        foreach ($users as $user) {
            if (strlen($user->username) == 10) {
                $awalAkhir = substr($user->username, 6, 1);
                if ($awalAkhir == 1) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-15");
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-15");
                } elseif ($awalAkhir == 2) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-15")->addMonth(6);
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 4,  2) . "-7-20")->addMonth(6);
                }

                $masaStudi = $user->biodata->prodi->masa_studi;
                $parts = explode('.', (string)$masaStudi);
                if (count($parts) > 1) {
                    $addMonth = 6; // Mengembalikan bagian desimal
                } else {
                    $addMonth = 0; // Tidak ada angka di belakang koma
                }

                $tahunLewatMasaStudiResiden =  $tahunResidenMasuk->addYears($masaStudi)->addMonth($addMonth);

                if ($tahunLewatMasaStudiResiden < Carbon::now()) {
                    $residenHabisMasaStudi[] = [
                        "id" => $user->id,
                        "name" => $user->name,
                        "username" => $user->username,
                        "email" => $user->biodata->email,
                        "masaStudi" => $masaStudi,
                        "tahunResidenMasuk" => $responseTahunResidenMasuk->format('M Y'),
                        "tahunLewatMasaStudiResiden" => $tahunLewatMasaStudiResiden->format('M Y'),
                        'sudahLewat' => $tahunLewatMasaStudiResiden->diff(Carbon::now())->format('%y thn, %m bln'),
                        "proposal" => $user->ujian->where('semester', 'Proposal')->first() ?? null,
                        "hasil" => $user->ujian->where('semester', 'Hasil')->first() ?? null,
                        "akhir" => $user->ujian->where('semester', 'Akhir')->first() ?? null,
                        "nasional" => $user->ujian->where('semester', 'Nasional')->first() ?? null,
                    ];
                }
            }

            if (strlen($user->username) == 11) {
                $awalAkhir = substr($user->username, 7, 1);
                if ($awalAkhir == 1) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-15");
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-15");
                } elseif ($awalAkhir == 2) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-15")->addMonth(6);
                    $responseTahunResidenMasuk = Carbon::createFromFormat('y-m-d', substr($user->username, 5,  2) . "-7-20")->addMonth(6);
                }

                $masaStudi = $user->biodata->prodi->masa_studi;
                $parts = explode('.', (string)$masaStudi);
                if (count($parts) > 1) {
                    $addMonth = 6; // Mengembalikan bagian desimal
                } else {
                    $addMonth = 0; // Tidak ada angka di belakang koma
                }

                $tahunLewatMasaStudiResiden =  $tahunResidenMasuk->addYears($masaStudi)->addMonth($addMonth);

                if ($tahunLewatMasaStudiResiden < Carbon::now()) {
                    $residenHabisMasaStudi[] = [
                        "id" => $user->id,
                        "name" => $user->name,
                        "username" => $user->username,
                        "email" => $user->biodata->email,
                        "masaStudi" => $masaStudi,
                        "tahunResidenMasuk" => $responseTahunResidenMasuk->format('M Y'),
                        "tahunLewatMasaStudiResiden" => $tahunLewatMasaStudiResiden->format('M Y'),
                        'sudahLewat' => $tahunLewatMasaStudiResiden->diff(Carbon::now())->format('%y thn, %m bln, %d hari'),
                        "proposal" => $user->ujian->where('semester', 'Proposal')->first() ?? null,
                        "hasil" => $user->ujian->where('semester', 'Hasil')->first() ?? null,
                        "akhir" => $user->ujian->where('semester', 'Akhir')->first() ?? null,
                        "nasional" => $user->ujian->where('semester', 'Nasional')->first() ?? null,
                    ];
                }
            }
        }

        return Excel::download(new LewatMasaStudiExport($residenHabisMasaStudi), 'lewat-masa-studi.xlsx');
    }

    public function sendEmail(Request $request)
    {
        $users = User::with('biodata')->whereIn('id', $request->selection)->get();

        foreach ($users as $user) {
            if ($user->biodata->email) {
                SendEmailJob::dispatch($user->biodata->email);
            }
        }
    }
}
