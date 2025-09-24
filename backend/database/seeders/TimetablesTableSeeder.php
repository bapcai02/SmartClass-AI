<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TimetablesTableSeeder extends Seeder
{
    public function run(): void
    {
        $classes = DB::table('classes')->select('id', 'subject_id', 'teacher_id')->get();
        if ($classes->isEmpty()) {
            $this->command?->warn('No classes found. Skipping timetables seeding.');
            return;
        }

        $now = Carbon::now();
        $rows = [];

        foreach ($classes as $class) {
            // Create 3 upcoming lessons per class across the week
            $baseDay = random_int(1, 3); // Mon..Wed
            for ($i = 0; $i < 3; $i++) {
                $day = min(7, $baseDay + $i); // spread days
                $startHour = [8, 9, 10, 13, 14][array_rand([8, 9, 10, 13, 14])];
                $endHour = $startHour + 1;

                $rows[] = [
                    'class_id' => $class->id,
                    'subject_id' => $class->subject_id ?? 1,
                    'teacher_id' => $class->teacher_id ?? 1,
                    'day_of_week' => $day,
                    'start_time' => sprintf('%02d:00:00', $startHour),
                    'end_time' => sprintf('%02d:00:00', $endHour),
                    'room' => 'R-' . random_int(101, 120),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Clear existing sample data for idempotence (optional)
        // DB::table('timetables')->truncate();

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('timetables')->insert($chunk);
        }

        $this->command?->info('Timetables seeded: ' . count($rows));
    }
}
