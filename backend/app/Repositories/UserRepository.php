<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\AssignmentSubmission;
use App\Models\ExamSubmission;
use App\Models\QaPost;
use App\Models\QaAnswer;
use App\Models\Resource;
use App\Models\ClassStudent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function paginate(string $search = '', ?string $role = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query();
        if ($role) {
            $query->where('role', $role);
        }
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        return $query->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function update(int $id, array $data): ?User
    {
        $user = User::find($id);
        if (!$user) {
            return null;
        }
        
        $user->update($data);
        return $user->fresh();
    }

    public function getUserStats(int $userId): array
    {
        $user = User::find($userId);
        if (!$user) {
            return [];
        }

        // Assignment stats
        $assignmentSubmissions = AssignmentSubmission::where('student_id', $userId)->get();
        $totalAssignments = $assignmentSubmissions->count();
        $completedAssignments = $assignmentSubmissions->whereNotNull('grade')->count();
        $averageGrade = $assignmentSubmissions->whereNotNull('grade')->avg('grade') ?? 0;

        // Exam stats
        $examSubmissions = ExamSubmission::where('student_id', $userId)->get();
        $totalExams = $examSubmissions->count();
        $completedExams = $examSubmissions->whereNotNull('grade')->count();
        $averageExamGrade = $examSubmissions->whereNotNull('grade')->avg('grade') ?? 0;

        // Q&A stats
        $totalQuestions = QaPost::where('user_id', $userId)->count();
        $totalAnswers = QaAnswer::where('user_id', $userId)->count();

        // Resource stats
        $totalResources = Resource::where('uploaded_by', $userId)->count();

        // Class stats
        $totalClasses = ClassStudent::where('student_id', $userId)->count();

        // Recent activity (last 7 days)
        $recentAssignments = AssignmentSubmission::where('student_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $recentExams = ExamSubmission::where('student_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $recentQuestions = QaPost::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $recentAnswers = QaAnswer::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return [
            'assignments' => [
                'total' => $totalAssignments,
                'completed' => $completedAssignments,
                'average_grade' => round($averageGrade, 2),
            ],
            'exams' => [
                'total' => $totalExams,
                'completed' => $completedExams,
                'average_grade' => round($averageExamGrade, 2),
            ],
            'qa' => [
                'questions' => $totalQuestions,
                'answers' => $totalAnswers,
            ],
            'resources' => [
                'uploaded' => $totalResources,
            ],
            'classes' => [
                'enrolled' => $totalClasses,
            ],
            'recent_activity' => [
                'assignments' => $recentAssignments,
                'exams' => $recentExams,
                'questions' => $recentQuestions,
                'answers' => $recentAnswers,
            ],
        ];
    }

    public function getUserActivity(int $userId, int $limit = 10): array
    {
        $activities = [];

        // Recent assignment submissions
        $assignmentSubmissions = AssignmentSubmission::with(['assignment.classRoom.subject'])
            ->where('student_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        foreach ($assignmentSubmissions as $submission) {
            $activities[] = [
                'type' => 'assignment_submission',
                'title' => 'Submitted assignment: ' . $submission->assignment->title,
                'description' => $submission->assignment->classRoom->subject->name . ' - ' . $submission->assignment->classRoom->name,
                'grade' => $submission->grade,
                'date' => $submission->created_at,
            ];
        }

        // Recent exam submissions
        $examSubmissions = ExamSubmission::with(['exam.classRoom.subject'])
            ->where('student_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        foreach ($examSubmissions as $submission) {
            $activities[] = [
                'type' => 'exam_submission',
                'title' => 'Took exam: ' . $submission->exam->title,
                'description' => $submission->exam->classRoom->subject->name . ' - ' . $submission->exam->classRoom->name,
                'grade' => $submission->grade,
                'date' => $submission->created_at,
            ];
        }

        // Recent Q&A posts
        $qaPosts = QaPost::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        foreach ($qaPosts as $post) {
            $activities[] = [
                'type' => 'question',
                'title' => 'Asked question: ' . substr($post->question_text, 0, 50) . '...',
                'description' => 'Q&A Forum',
                'date' => $post->created_at,
            ];
        }

        // Recent Q&A answers
        $qaAnswers = QaAnswer::with(['post'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        foreach ($qaAnswers as $answer) {
            $activities[] = [
                'type' => 'answer',
                'title' => 'Answered: ' . substr($answer->post->question_text, 0, 50) . '...',
                'description' => 'Q&A Forum',
                'date' => $answer->created_at,
            ];
        }

        // Sort by date and limit
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return array_slice($activities, 0, $limit);
    }
}


