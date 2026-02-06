<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePelanggaranResidenRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'prodi_id' => 'required|exists:prodis,id',
            'pelanggaran_id' => 'nullable|exists:pelanggarans,id',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
            'sanksi' => 'nullable|string|max:1000',
            'kronologi' => 'required|string|max:1000',
            'residen_ids' => 'required|array|min:1',
            'residen_ids.*' => 'exists:users,id',
        ];
    }

    public function messages()
    {
        return [
            'prodi_id.required' => 'Program studi harus dipilih',
            'prodi_id.exists' => 'Program studi tidak valid',
            'pelanggaran_id.exists' => 'Pelanggaran tidak valid',
            'file.mimes' => 'File harus berformat: pdf, doc, docx, jpg, jpeg, png',
            'file.max' => 'Ukuran file maksimal 2MB',
            'sanksi.max' => 'Sanksi maksimal 1000 karakter',
            'residen_ids.required' => 'Minimal pilih satu residen',
            'residen_ids.array' => 'Format residen tidak valid',
            'residen_ids.min' => 'Minimal pilih satu residen',
            'residen_ids.*.exists' => 'Residen tidak valid',
        ];
    }
}
