<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicExamPdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PublicExamPdfController extends Controller
{
    public function index(Request $request)
    {
        $query = PublicExamPdf::with(['subject','clazz'])
            ->when($request->filled('subject_id'), fn($q) => $q->where('public_subject_id', $request->get('subject_id')))
            ->when($request->filled('class_id'), fn($q) => $q->where('public_class_id', $request->get('class_id')))
            ->when($request->filled('search'), fn($q) => $q->where('title','like','%'.$request->get('search').'%'))
            ->orderByDesc('id');

        $data = $query->get()->map(function ($e) {
            $publicUrl = $e->pdf_url;
            if ($publicUrl && !preg_match('/^https?:\/\//i', (string) $publicUrl)) {
                // Convert storage-relative path to absolute URL
                $publicUrl = url(Storage::url($publicUrl));
            }
            return [
                'id' => $e->id,
                'title' => $e->title,
                'pdf_url' => $publicUrl,
                'file_size_bytes' => (int)($e->file_size_bytes ?? 0),
                'num_pages' => (int)($e->num_pages ?? 0),
                'subject' => $e->subject ? ['id' => $e->subject->id, 'name' => $e->subject->name] : null,
                'clazz' => $e->clazz ? ['id' => $e->clazz->id, 'name' => $e->clazz->name] : null,
            ];
        });

        return response()->json(['data' => $data]);
    }
}
