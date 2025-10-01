<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicExam;
use App\Models\PublicSubject;
use App\Models\PublicSubmission;
use Illuminate\Http\Request;

class PublicExamController extends Controller
{
    public function subjects()
    {
        return response()->json(PublicSubject::orderBy('name')->get());
    }

    public function index(Request $request)
    {
        $query = PublicExam::with(['subject','clazz'])->withCount('questions')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->get('search');
                $q->where('title', 'like', "%{$term}%");
            })
            ->when($request->filled('subject_id'), function ($q) use ($request) {
                $q->where('public_subject_id', $request->get('subject_id'));
            })
            ->when($request->filled('class_id'), function ($q) use ($request) {
                $q->where('public_class_id', $request->get('class_id'));
            });

        // Top by attempts if requested, else latest
        if ($request->boolean('top', false)) {
            $query->orderByDesc('attempts');
        } else {
            $query->orderByDesc('id');
        }

        $data = $query->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'title' => $e->title,
                'description' => $e->description,
                'attempts' => (int)($e->attempts ?? 0),
                'duration_minutes' => (int)($e->duration_minutes ?? 0),
                'questions_count' => (int)($e->questions_count ?? 0),
                'subject' => $e->subject ? ['name' => $e->subject->name] : null,
                'clazz' => $e->clazz ? ['name' => $e->clazz->name] : null,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function show($id)
    {
        $exam = PublicExam::with(['subject','clazz','questions.choices'])->findOrFail($id);
        return response()->json($exam);
    }

    public function submit(Request $request, $id)
    {
        $exam = PublicExam::with('questions.choices')->findOrFail($id);
        $answers = $request->input('answers', []); // { question_id: 'A' }
        $score = 0.0;

        foreach ($exam->questions as $q) {
            $correct = optional($q->choices->firstWhere('is_correct', true))->label;
            $user = $answers[$q->id] ?? null;
            if ($user && $correct && strtoupper($user) === strtoupper($correct)) {
                $score += 1; // 1 điểm mỗi câu (demo)
            }
        }

        $submission = PublicSubmission::create([
            'public_exam_id' => $exam->id,
            'candidate_name' => $request->input('name'),
            'candidate_email' => $request->input('email'),
            'attempt_no' => (int)($request->input('attempt_no', 1)),
            'score' => $score,
            'answers_json' => $answers,
            'duration_seconds' => (int)$request->input('duration_seconds', 0),
            'started_at' => $request->input('started_at'),
            'submitted_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        $exam->increment('attempts');

        return response()->json([ 'submission_id' => $submission->id, 'score' => $score ]);
    }
}
