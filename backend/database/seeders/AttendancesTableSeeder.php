<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendancesTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Fetch timetables with their class_id
        $timetables = DB::table('timetables')->select('id', 'class_id')->get();
        if ($timetables->isEmpty()) {
            $this->command?->warn('No timetables found. Skipping attendances seed.');
            return;
        }

        // Preload class -> student ids mapping from class_students
        $classStudentMap = DB::table('class_students')
            ->select('class_id', 'student_id')
            ->get()
            ->groupBy('class_id')
            ->map(function ($rows) {
                return $rows->pluck('student_id')->all();
            });

        $rows = [];
        foreach ($timetables as $tt) {
            $studentIds = $classStudentMap->get($tt->class_id, []);
            if (empty($studentIds)) {
                continue;
            }

            // Sample up to 15 students per timetable for demo
            $sample = array_slice($studentIds, 0, min(15, count($studentIds)));

            foreach ($sample as $sid) {
                // Randomize status with weighted distribution
                $r = random_int(1, 100);
                $status = $r <= 82 ? 'present' : ($r <= 92 ? 'late' : 'absent');

                $rows[] = [
                    'timetable_id' => $tt->id,
                    'student_id' => $sid,
                    'status' => $status,
                    'checked_at' => $now->copy()->subDays(random_int(0, 14)),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (empty($rows)) {
            $this->command?->warn('No attendance rows generated. Ensure class_students data exists.');
            return;
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('attendances')->insert($chunk);
        }

        $this->command?->info('Attendances seeded: ' . count($rows));
    }
}


