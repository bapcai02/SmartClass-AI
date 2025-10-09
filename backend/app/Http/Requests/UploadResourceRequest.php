<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 5GB max (value is in kilobytes)
            'file' => ['required', 'file', 'max:5120000'],
            'title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
