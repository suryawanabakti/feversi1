<?php

namespace App\Http\Controllers;

use App\Models\Format;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FormatController extends Controller
{
    //
    public function index()
    {
        return Format::all();
    }



    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|file|mimes:png,jpg,jpeg,pdf,doc,docx|max:15000',
        ]);

        $fileName = 'format_' . time() . '_' . Str::random(6) . '.' . $request->file->getClientOriginalExtension();
        $request->file->storeAs('format', $fileName);

        return Format::create([
            'name' => $request->name,
            'file' => $fileName,
        ]);
    }


    public function destroy($id)
    {
        $format = Format::find($id);
        $filePath = public_path('format/');
        $currentFile = $format->file;
        if (file_exists($filePath . $currentFile)) {
            @unlink($filePath . $currentFile);
        }
        Format::destroy($id);
    }
}
