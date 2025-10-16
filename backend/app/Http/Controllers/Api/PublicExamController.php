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
        $query = PublicExam::with(['subject','clazz'])
            ->withCount('questions')
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
            })
            // Advanced filters via questions attributes
            ->when($request->filled('difficulty_min') || $request->filled('difficulty_max'), function ($q) use ($request) {
                $min = $request->integer('difficulty_min');
                $max = $request->integer('difficulty_max');
                $q->whereHas('questions', function ($qq) use ($min, $max) {
                    if ($min !== null) { $qq->where('difficulty', '>=', $min); }
                    if ($max !== null) { $qq->where('difficulty', '<=', $max); }
                });
            })
            ->when($request->filled('chapter'), function ($q) use ($request) {
                $chapter = $request->get('chapter');
                $q->whereHas('questions', function ($qq) use ($chapter) {
                    $qq->where('chapter', 'like', '%'.$chapter.'%');
                });
            })
            ->when($request->filled('tag'), function ($q) use ($request) {
                // single tag match
                $tag = $request->get('tag');
                $q->whereHas('questions', function ($qq) use ($tag) {
                    $qq->whereJsonContains('tags', $tag);
                });
            })
            ->when($request->filled('tags'), function ($q) use ($request) {
                // multiple tags: require any match
                $tags = array_filter(array_map('trim', explode(',', (string) $request->get('tags'))));
                if (!empty($tags)) {
                    $q->whereHas('questions', function ($qq) use ($tags) {
                        foreach ($tags as $tg) {
                            $qq->orWhereJsonContains('tags', $tg);
                        }
                    });
                }
            })
            ->when($request->filled('duration_min') || $request->filled('duration_max'), function ($q) use ($request) {
                $dmin = $request->integer('duration_min');
                $dmax = $request->integer('duration_max');
                if ($dmin !== null) { $q->where('duration_minutes', '>=', $dmin); }
                if ($dmax !== null) { $q->where('duration_minutes', '<=', $dmax); }
            });

        // Sorting
        $sort = $request->get('sort'); // latest|attempts|views|questions|duration
        $order = strtolower((string) $request->get('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        if ($request->boolean('top', false) && !$sort) { // backward-compat
            $sort = 'attempts';
        }
        switch ($sort) {
            case 'attempts':
                $query->orderBy('attempts', $order);
                break;
            case 'views':
                $query->orderBy('views', $order);
                break;
            case 'questions':
                $query->orderBy('questions_count', $order);
                break;
            case 'duration':
                $query->orderBy('duration_minutes', $order);
                break;
            default:
                $query->orderBy('id', 'desc');
        }

        $mapExam = function ($e) {
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
        };

        $perPage = $request->integer('per_page');
        if ($perPage && $perPage > 0) {
            $paginator = $query->paginate($perPage);
            $items = $paginator->getCollection()->map($mapExam)->values();
            return response()->json([
                'data' => $items,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]);
        }

        $data = $query->get()->map($mapExam);
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

    public function random(Request $request)
    {
        $subjectId = $request->integer('subject_id');
        $classId = $request->integer('class_id');
        $num = max(1, (int) $request->integer('num', 20));
        $duration = (int) $request->integer('duration_minutes', 60);

        $exam = PublicExam::query()
            ->when($subjectId, fn($q) => $q->where('public_subject_id', $subjectId))
            ->when($classId, fn($q) => $q->where('public_class_id', $classId))
            ->inRandomOrder()
            ->first();
        if (!$exam) return response()->json(['message' => 'No source exam found'], 404);

        $questions = $exam->questions()->with('choices')->inRandomOrder()->limit($num)->get();
        $payload = [
            'title' => $exam->title,
            'description' => $exam->description,
            'duration_minutes' => $duration ?: (int)($exam->duration_minutes ?? 60),
            'subject' => $exam->subject ? ['id' => $exam->subject->id, 'name' => $exam->subject->name] : null,
            'clazz' => $exam->clazz ? ['id' => $exam->clazz->id, 'name' => $exam->clazz->name] : null,
            'questions' => $questions->map(function ($q) {
                return [
                    'id' => $q->id,
                    'content' => $q->content,
                    'choices' => $q->choices->map(function ($c) {
                        return [ 'id' => $c->id, 'label' => $c->label, 'content' => $c->content ];
                    })->values(),
                ];
            })->values(),
        ];
        return response()->json($payload);
    }

    public function review(Request $request, $id)
    {
        $submission = PublicSubmission::findOrFail($id);
        $exam = PublicExam::with('questions.choices')->findOrFail($submission->public_exam_id);
        $answers = (array) ($submission->answers_json ?? []);

        $details = [];
        $numCorrect = 0;
        $topicStats = [];
        foreach ($exam->questions as $q) {
            $correct = optional($q->choices->firstWhere('is_correct', true))->label;
            $user = $answers[$q->id] ?? null;
            $isCorrect = $user && $correct && strtoupper($user) === strtoupper($correct);
            if ($isCorrect) $numCorrect++;

            $details[] = [
                'question_id' => $q->id,
                'content' => $q->content,
                'your_answer' => $user,
                'correct_answer' => $correct,
                'is_correct' => $isCorrect,
                'explanation' => $q->explanation ?? null,
                'chapter' => $q->chapter ?? null,
                'difficulty' => $q->difficulty ?? null,
                'tags' => $q->tags ?? [],
            ];

            $topicKey = $q->chapter ?: 'Khác';
            $topicStats[$topicKey] = $topicStats[$topicKey] ?? ['correct' => 0, 'total' => 0];
            $topicStats[$topicKey]['total'] += 1;
            if ($isCorrect) $topicStats[$topicKey]['correct'] += 1;
        }

        $strengths = [];
        foreach ($topicStats as $topic => $stat) {
            $acc = $stat['total'] > 0 ? ($stat['correct'] / $stat['total']) : 0;
            $strengths[] = [ 'topic' => $topic, 'accuracy' => round($acc, 2) ];
        }
        usort($strengths, function ($a, $b) { return $b['accuracy'] <=> $a['accuracy']; });

        return response()->json([
            'submission_id' => $submission->id,
            'score' => $submission->score,
            'num_correct' => $numCorrect,
            'num_questions' => count($exam->questions),
            'details' => $details,
            'strengths' => $strengths,
        ]);
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
