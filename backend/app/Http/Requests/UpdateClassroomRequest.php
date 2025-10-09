<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassroomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'subject_id' => ['sometimes', 'required', 'integer', 'exists:subjects,id'],
            'teacher_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'description' => ['sometimes', 'required', 'string', 'max:2000'],
            'student_ids' => ['sometimes', 'required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}


