<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClassRoom;
use App\Models\ClassStudent;
use App\Models\Subject;
use App\Models\User;

class ClassesTableSeeder extends Seeder
{
    public function run(): void
    {
        $subjectMath = Subject::where('code', 'MATH101')->first();
        $subjectBio = Subject::where('code', 'BIO102')->first();
        $subjectHis = Subject::where('code', 'HIS103')->first();

        $teacher1 = User::where('email', 'alice@smartclass.ai')->first();
        $teacher2 = User::where('email', 'bob@smartclass.ai')->first();

        $classA = ClassRoom::updateOrCreate(
            ['name' => 'Algebra I'],
            [
                'subject_id' => $subjectMath?->id,
                'teacher_id' => $teacher1?->id,
                'description' => 'Introductory algebra class',
            ]
        );

        $classB = ClassRoom::updateOrCreate(
            ['name' => 'General Biology'],
            [
                'subject_id' => $subjectBio?->id,
                'teacher_id' => $teacher2?->id,
                'description' => 'Fundamentals of biology',
            ]
        );

        $students = User::where('role', 'student')->pluck('id')->all();
        foreach ($students as $sid) {
            ClassStudent::updateOrCreate([
                'class_id' => $classA->id,
                'student_id' => $sid,
            ], [
                'status' => 'active',
                'joined_at' => now()->subDays(rand(1, 60)),
            ]);

            ClassStudent::updateOrCreate([
                'class_id' => $classB->id,
                'student_id' => $sid,
            ], [
                'status' => 'active',
                'joined_at' => now()->subDays(rand(1, 60)),
            ]);
        }
    }
}
