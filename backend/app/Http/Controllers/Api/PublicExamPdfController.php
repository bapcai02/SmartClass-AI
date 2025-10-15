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
            ->when($request->filled('category'), fn($q) => $q->where('category', $request->get('category')))
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
                'download_count' => (int)($e->download_count ?? 0),
                'view_count' => (int)($e->view_count ?? 0),
                'subject' => $e->subject ? ['id' => $e->subject->id, 'name' => $e->subject->name] : null,
                'clazz' => $e->clazz ? ['id' => $e->clazz->id, 'name' => $e->clazz->name] : null,
                'category' => $e->category,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function download(Request $request, $id)
    {
        $pdf = PublicExamPdf::findOrFail($id);
        $pdf->increment('download_count');

        // If this is an AJAX/JSON request, just return 204 after incrementing
        if ($request->expectsJson() || $request->ajax()) {
            return response()->noContent();
        }

        $path = $pdf->pdf_url;
        if (!$path) {
            return response()->json(['error' => 'File not found'], 404);
        }

        if (preg_match('/^https?:\/\//i', (string) $path)) {
            return redirect()->away($path);
        }

        if (!Storage::exists($path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::download($path);
    }

    public function view(Request $request, $id)
    {
        $pdf = PublicExamPdf::findOrFail($id);
        $pdf->increment('view_count');

        // If this is an AJAX/JSON request, just return 204 after incrementing
        if ($request->expectsJson() || $request->ajax()) {
            return response()->noContent();
        }

        $path = $pdf->pdf_url;
        if (!$path) {
            return response()->json(['error' => 'File not found'], 404);
        }

        if (preg_match('/^https?:\/\//i', (string) $path)) {
            return redirect()->away($path);
        }

        if (!Storage::exists($path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Use Storage::url to allow browser to render inline
        return redirect()->to(url(Storage::url($path)));
    }
}
