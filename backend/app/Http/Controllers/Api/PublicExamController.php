<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicExam;
use App\Models\PublicSubject;
use App\Models\PublicSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
            })
            ->when($request->filled('grade'), function ($q) use ($request) {
                $q->whereHas('clazz', function ($qq) use ($request) {
                    $qq->where('grade', (int)$request->get('grade'));
                });
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
        // Do not leak correct answers in public payload
        $payload = [
            'id' => $exam->id,
            'title' => $exam->title,
            'description' => $exam->description,
            'duration_minutes' => (int)($exam->duration_minutes ?? 0),
            'subject' => $exam->subject ? ['id' => $exam->subject->id, 'name' => $exam->subject->name] : null,
            'clazz' => $exam->clazz ? ['id' => $exam->clazz->id, 'name' => $exam->clazz->name] : null,
            'questions' => $exam->questions->map(function ($q) {
                return [
                    'id' => $q->id,
                    'content' => $q->content,
                    'choices' => $q->choices->map(function ($c) {
                        return [
                            'id' => $c->id,
                            'label' => $c->label,
                            'content' => $c->content,
                            // is_correct intentionally omitted
                        ];
                    })->values(),
                ];
            })->values(),
        ];
        return response()->json($payload);
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
                $score += 1;
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

    public function leaderboard(Request $request)
    {
        // Most submissions per user (by name/email)
        $most = DB::table('public_submissions')
            ->selectRaw("COALESCE(candidate_name, 'Người dùng') as name, COALESCE(candidate_email,'') as email, COUNT(*) as value")
            ->groupBy('candidate_name', 'candidate_email')
            ->orderByDesc('value')
            ->limit(8)
            ->get()
            ->map(function ($r) {
                return [
                    'name' => $r->name,
                    'value' => (int)$r->value,
                    'note' => 'đề đã làm',
                    'avatar' => $this->gravatar((string)$r->email),
                ];
            });

        // Highest average score (min 1 submission)
        $score = DB::table('public_submissions')
            ->selectRaw("COALESCE(candidate_name, 'Người dùng') as name, COALESCE(candidate_email,'') as email, AVG(score) as avg_score, COUNT(*) as cnt")
            ->groupBy('candidate_name', 'candidate_email')
            ->orderByDesc('avg_score')
            ->limit(8)
            ->get()
            ->map(function ($r) {
                return [
                    'name' => $r->name,
                    'value' => round((float)$r->avg_score, 2),
                    'note' => 'điểm TB',
                    'avatar' => $this->gravatar((string)$r->email),
                ];
            });

        // Recent activity in last 7 days by user
        $since = Carbon::now()->subDays(7);
        $recent = DB::table('public_submissions')
            ->where('submitted_at', '>=', $since)
            ->selectRaw("COALESCE(candidate_name, 'Người dùng') as name, COALESCE(candidate_email,'') as email, COUNT(*) as value")
            ->groupBy('candidate_name', 'candidate_email')
            ->orderByDesc('value')
            ->limit(8)
            ->get()
            ->map(function ($r) {
                return [
                    'name' => $r->name,
                    'value' => (int)$r->value,
                    'note' => 'đề tuần này',
                    'avatar' => $this->gravatar((string)$r->email),
                ];
            });

        return response()->json([
            'most' => $most,
            'score' => $score,
            'recent' => $recent,
        ]);
    }

    private function gravatar(string $email): string
    {
        $hash = md5(strtolower(trim($email)));
        return "https://www.gravatar.com/avatar/{$hash}?d=identicon";
    }
}
