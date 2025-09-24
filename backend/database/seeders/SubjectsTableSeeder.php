<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;

class SubjectsTableSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH101', 'description' => 'Algebra and geometry fundamentals'],
            ['name' => 'Biology', 'code' => 'BIO102', 'description' => 'Cells, genetics, ecosystems'],
            ['name' => 'History', 'code' => 'HIS103', 'description' => 'World history overview'],
        ];

        foreach ($subjects as $s) {
            Subject::updateOrCreate(['code' => $s['code']], $s);
        }
    }
}
