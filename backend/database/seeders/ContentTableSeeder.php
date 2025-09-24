<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\{ClassRoom, Assignment, AssignmentSubmission, Exam, ExamSubmission, Resource as ClassResource, Announcement, Discussion, DiscussionReply, ChatMessage, QaPost, QaAnswer, Leaderboard, Report, User, Subject};

class ContentTableSeeder extends Seeder
{
    public function run(): void
    {
        $classes = ClassRoom::all();
        $teacherIds = User::where('role', 'teacher')->pluck('id')->all();
        $studentIds = User::where('role', 'student')->pluck('id')->all();

        foreach ($classes as $class) {
            // Assignments
            for ($i = 1; $i <= 3; $i++) {
                $assignment = Assignment::updateOrCreate([
                    'class_id' => $class->id,
                    'title' => "Assignment {$i} for {$class->name}",
                ], [
                    'description' => 'Complete the tasks and submit as PDF.',
                    'due_date' => now()->addDays(7 + $i),
                    'created_by' => $teacherIds[array_rand($teacherIds)] ?? null,
                ]);

                // Submissions
                foreach (array_slice($studentIds, 0, rand(5, count($studentIds))) as $sid) {
                    AssignmentSubmission::updateOrCreate([
                        'assignment_id' => $assignment->id,
                        'student_id' => $sid,
                    ], [
                        'file_url' => 'https://example.com/submissions/'.Str::uuid().'.pdf',
                        'submitted_at' => now()->subDays(rand(0, 5)),
                        'grade' => rand(60, 100),
                        'feedback' => 'Good job!',
                    ]);
                }
            }

            // Exams
            for ($i = 1; $i <= 2; $i++) {
                $start = now()->addDays(10 + $i)->setTime(9, 0);
                $exam = Exam::updateOrCreate([
                    'class_id' => $class->id,
                    'title' => "Exam {$i} - {$class->name}",
                ], [
                    'description' => 'Covers recent lessons.',
                    'start_time' => $start,
                    'end_time' => (clone $start)->addHours(2),
                    'created_by' => $teacherIds[array_rand($teacherIds)] ?? null,
                ]);

                foreach (array_slice($studentIds, 0, rand(5, count($studentIds))) as $sid) {
                    ExamSubmission::updateOrCreate([
                        'exam_id' => $exam->id,
                        'student_id' => $sid,
                    ], [
                        'file_url' => 'https://example.com/exams/'.Str::uuid().'.pdf',
                        'submitted_at' => $exam->end_time,
                        'grade' => rand(50, 100),
                        'feedback' => 'Reviewed.',
                    ]);
                }
            }

            // Resources
            for ($i = 1; $i <= 4; $i++) {
                ClassResource::updateOrCreate([
                    'class_id' => $class->id,
                    'title' => "Resource {$i} - {$class->name}",
                ], [
                    'file_url' => 'https://example.com/resources/'.Str::uuid().'.pdf',
                    'uploaded_by' => $teacherIds[array_rand($teacherIds)] ?? null,
                    'uploaded_at' => now()->subDays(rand(1, 20)),
                ]);
            }

            // Announcements
            for ($i = 1; $i <= 2; $i++) {
                Announcement::updateOrCreate([
                    'class_id' => $class->id,
                    'title' => "Announcement {$i} - {$class->name}",
                ], [
                    'content' => 'Please read the latest updates and follow instructions.',
                    'created_by' => $teacherIds[array_rand($teacherIds)] ?? null,
                ]);
            }

            // Discussions & Replies
            for ($i = 1; $i <= 2; $i++) {
                $discussion = Discussion::updateOrCreate([
                    'class_id' => $class->id,
                    'user_id' => $studentIds[array_rand($studentIds)] ?? null,
                    'content' => "What about topic {$i}?",
                ], []);

                for ($j = 1; $j <= 2; $j++) {
                    DiscussionReply::updateOrCreate([
                        'discussion_id' => $discussion->id,
                        'user_id' => $teacherIds[array_rand($teacherIds)] ?? null,
                        'content' => "Answer {$j} for topic {$i}",
                    ], []);
                }
            }

            // Chat messages
            for ($i = 1; $i <= 10; $i++) {
                ChatMessage::create([
                    'sender_id' => $studentIds[array_rand($studentIds)] ?? null,
                    'receiver_id' => $teacherIds[array_rand($teacherIds)] ?? null,
                    'class_id' => $class->id,
                    'content' => 'Hello! I have a question about the assignment.',
                    'message_type' => 'text',
                ]);
            }

            // Leaderboard & Reports
            foreach ($studentIds as $sid) {
                Leaderboard::updateOrCreate([
                    'student_id' => $sid,
                    'class_id' => $class->id,
                ], [
                    'total_points' => rand(0, 500),
                    'rank' => null,
                ]);

                Report::updateOrCreate([
                    'student_id' => $sid,
                    'class_id' => $class->id,
                    'report_date' => now()->toDateString(),
                ], [
                    'average_score' => rand(50, 100),
                    'attendance_rate' => rand(70, 100),
                ]);
            }
        }

        // QA posts & answers (global)
        foreach (array_slice($studentIds, 0, 5) as $sid) {
            $post = QaPost::create([
                'user_id' => $sid,
                'question_text' => 'How to solve this problem?',
                'image_url' => null,
            ]);

            QaAnswer::create([
                'qa_post_id' => $post->id,
                'user_id' => $teacherIds[array_rand($teacherIds)] ?? null,
                'answer_text' => 'Try applying theorem X.',
            ]);
        }
    }
}
