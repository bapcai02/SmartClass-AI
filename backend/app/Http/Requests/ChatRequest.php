<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
            'conversation_history' => ['nullable'],
            'context' => ['nullable', 'string', 'max:1000'],
            'session_id' => ['nullable', 'integer', 'exists:chat_sessions,id'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ];
    }
}


