<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PublicDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // subjects
            $subjects = [
                ['name' => 'Toán'],
                ['name' => 'Vật Lý'],
                ['name' => 'Hóa Học'],
            ];
            foreach ($subjects as $s) {
                DB::table('public_subjects')->updateOrInsert(['name' => $s['name']], $s);
            }
            $subjMap = DB::table('public_subjects')->pluck('id', 'name');

            // classes
            $classes = [ ['name' => 'Lớp 10'], ['name' => 'Lớp 11'], ['name' => 'Lớp 12'] ];
            foreach ($classes as $c) {
                DB::table('public_classes')->updateOrInsert(['name' => $c['name']], $c);
            }
            $classId = DB::table('public_classes')->where('name', 'Lớp 12')->value('id');

            // exams (năm nay)
            $year = date('Y');
            $exams = [
                ['title' => "Đề thi THPT Quốc gia môn Toán $year", 'public_subject_id' => $subjMap['Toán'], 'public_class_id' => $classId, 'duration_minutes' => 90, 'description' => 'Đề trắc nghiệm 50 câu.'],
                ['title' => "Đề thi THPT Quốc gia môn Vật Lý $year", 'public_subject_id' => $subjMap['Vật Lý'], 'public_class_id' => $classId, 'duration_minutes' => 50, 'description' => 'Đề trắc nghiệm 40 câu.'],
                ['title' => "Đề thi THPT Quốc gia môn Hóa Học $year", 'public_subject_id' => $subjMap['Hóa Học'], 'public_class_id' => $classId, 'duration_minutes' => 50, 'description' => 'Đề trắc nghiệm 40 câu.'],
            ];

            foreach ($exams as $exam) {
                $examId = DB::table('public_exams')->insertGetId($exam + ['created_at' => now(), 'updated_at' => now()]);
                // add a few demo questions
                for ($i = 1; $i <= 5; $i++) {
                    $qId = DB::table('public_questions')->insertGetId([
                        'public_exam_id' => $examId,
                        'content' => 'Câu '.$i.': Nội dung câu hỏi minh họa.',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    foreach (['A','B','C','D'] as $idx => $label) {
                        DB::table('public_choices')->insert([
                            'public_question_id' => $qId,
                            'label' => $label,
                            'content' => 'Phương án '.$label,
                            'is_correct' => $label === 'A',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        });
    }
}
