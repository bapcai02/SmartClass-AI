<?php

namespace App\Repositories;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReportRepository
{
    public function getOverallStats(): array
    {
        $totalClasses = ClassRoom::count();
        $totalStudents = User::where('role', 'student')->count();
        $totalTeachers = User::where('role', 'teacher')->count();
        $totalAssignments = Assignment::count();
        $totalExams = Exam::count();

        return [
            'total_classes' => $totalClasses,
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_assignments' => $totalAssignments,
            'total_exams' => $totalExams,
        ];
    }

    public function getClassPerformanceStats(): array
    {
        $classes = ClassRoom::with(['subject', 'teacher', 'students'])
            ->get()
            ->map(function ($class) {
                $studentCount = $class->students->count();
                $assignmentCount = $class->assignments->count();
                $examCount = $class->exams->count();
                
                // Calculate average grades
                $assignmentGrades = AssignmentSubmission::whereHas('assignment', function ($query) use ($class) {
                    $query->where('class_id', $class->id);
                })->whereNotNull('grade')->avg('grade');
                
                $examGrades = ExamSubmission::whereHas('exam', function ($query) use ($class) {
                    $query->where('class_id', $class->id);
                })->whereNotNull('grade')->avg('grade');
                
                $overallAverage = collect([$assignmentGrades, $examGrades])
                    ->filter()
                    ->avg();

                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'subject' => $class->subject->name ?? 'N/A',
                    'teacher' => $class->teacher->name ?? 'N/A',
                    'student_count' => $studentCount,
                    'assignment_count' => $assignmentCount,
                    'exam_count' => $examCount,
                    'average_grade' => round($overallAverage ?? 0, 2),
                ];
            });

        return $classes->toArray();
    }

    public function getStudentPerformanceStats(): array
    {
        $students = User::where('role', 'student')
            ->with(['assignmentSubmissions', 'examSubmissions'])
            ->get()
            ->map(function ($student) {
                $assignmentGrades = $student->assignmentSubmissions()
                    ->whereNotNull('grade')
                    ->avg('grade');
                
                $examGrades = $student->examSubmissions()
                    ->whereNotNull('grade')
                    ->avg('grade');
                
                $overallAverage = collect([$assignmentGrades, $examGrades])
                    ->filter()
                    ->avg();

                $totalSubmissions = $student->assignmentSubmissions->count() + $student->examSubmissions->count();
                $gradedSubmissions = $student->assignmentSubmissions()
                    ->whereNotNull('grade')
                    ->count() + $student->examSubmissions()
                    ->whereNotNull('grade')
                    ->count();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'total_submissions' => $totalSubmissions,
                    'graded_submissions' => $gradedSubmissions,
                    'average_grade' => round($overallAverage ?? 0, 2),
                ];
            });

        return $students->toArray();
    }

    public function getAttendanceStats(): array
    {
        $attendanceStats = DB::table('attendances as a')
            ->join('users as u', 'a.student_id', '=', 'u.id')
            ->join('classes as c', function ($join) {
                $join->on('a.timetable_id', '=', DB::raw('(SELECT id FROM timetables WHERE class_id = c.id LIMIT 1)'));
            })
            ->select(
                'u.id as student_id',
                'u.name as student_name',
                'c.id as class_id',
                'c.name as class_name',
                DB::raw('COUNT(*) as total_attendance'),
                DB::raw('SUM(CASE WHEN a.status = "present" THEN 1 ELSE 0 END) as present_count'),
                DB::raw('ROUND(SUM(CASE WHEN a.status = "present" THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_rate')
            )
            ->groupBy('u.id', 'u.name', 'c.id', 'c.name')
            ->get();

        return $attendanceStats->toArray();
    }

    public function getGradeDistribution(): array
    {
        $assignmentGrades = AssignmentSubmission::whereNotNull('grade')
            ->select(DB::raw('
                CASE 
                    WHEN grade >= 90 THEN "A (90-100)"
                    WHEN grade >= 80 THEN "B (80-89)"
                    WHEN grade >= 70 THEN "C (70-79)"
                    WHEN grade >= 60 THEN "D (60-69)"
                    ELSE "F (Below 60)"
                END as grade_range,
                COUNT(*) as count
            '))
            ->groupBy('grade_range')
            ->get();

        $examGrades = ExamSubmission::whereNotNull('grade')
            ->select(DB::raw('
                CASE 
                    WHEN grade >= 90 THEN "A (90-100)"
                    WHEN grade >= 80 THEN "B (80-89)"
                    WHEN grade >= 70 THEN "C (70-79)"
                    WHEN grade >= 60 THEN "D (60-69)"
                    ELSE "F (Below 60)"
                END as grade_range,
                COUNT(*) as count
            '))
            ->groupBy('grade_range')
            ->get();

        $combined = collect([$assignmentGrades, $examGrades])
            ->flatten()
            ->groupBy('grade_range')
            ->map(function ($group) {
                return $group->sum('count');
            });

        return $combined->toArray();
    }

    public function getRecentActivity(): array
    {
        $recentAssignments = Assignment::with(['classRoom.subject', 'creator'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($assignment) {
                return [
                    'type' => 'assignment',
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'class_name' => $assignment->classRoom->name,
                    'subject' => $assignment->classRoom->subject->name ?? 'N/A',
                    'created_by' => $assignment->creator->name ?? 'N/A',
                    'created_at' => $assignment->created_at,
                ];
            });

        $recentExams = Exam::with(['classRoom.subject', 'creator'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($exam) {
                return [
                    'type' => 'exam',
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'class_name' => $exam->classRoom->name,
                    'subject' => $exam->classRoom->subject->name ?? 'N/A',
                    'created_by' => $exam->creator->name ?? 'N/A',
                    'created_at' => $exam->created_at,
                ];
            });

        return collect([$recentAssignments, $recentExams])
            ->flatten()
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->toArray();
    }

    public function getMonthlyStats(): array
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $assignments = Assignment::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $exams = Exam::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $submissions = AssignmentSubmission::whereBetween('created_at', [$monthStart, $monthEnd])->count() +
                          ExamSubmission::whereBetween('created_at', [$monthStart, $monthEnd])->count();

            $months[] = [
                'month' => $date->format('M Y'),
                'assignments' => $assignments,
                'exams' => $exams,
                'submissions' => $submissions,
            ];
        }

        return $months;
    }
}
