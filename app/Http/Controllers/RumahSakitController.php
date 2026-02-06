<?php

namespace App\Http\Controllers;

use App\Imports\RumahSakitImport;
use App\Models\RumahSakit;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Svg\Tag\Rect;

class RumahSakitController extends Controller
{
    //
    public function index()
    {
        return RumahSakit::orderBy('created_at', 'desc')->get();
    }

    public function import(Request $request)
    {
        Excel::import(new RumahSakitImport(), $request->file('file'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'kategori' => 'nullable|array', // Added validation for kategori as array
            'kategori.*' => 'string|in:Pendidikan,Jejaring', // Validate each kategori item
        ]);

        return RumahSakit::create([
            'name' => $request->name,
            'kategori' => $request->kategori ?? [], // Added kategori field with default empty array
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'required',
            'kategori' => 'nullable|array', // Added validation for kategori as array
            'kategori.*' => 'string|in:Pendidikan,Jejaring', // Validate each kategori item
        ]);

        return RumahSakit::where('id', $id)->update([
            'name' => $request->name,
            'is_active' => $request->is_active,
            'kategori' => $request->kategori ?? [], // Added kategori field with default empty array
        ]);
    }

    public function deleteAll(Request $request)
    {
        foreach ($request->pilihan as $pilihan) {
            RumahSakit::destroy($pilihan);
        }
    }

    public  function show($id)
    {
        return RumahSakit::find($id);
    }
}
