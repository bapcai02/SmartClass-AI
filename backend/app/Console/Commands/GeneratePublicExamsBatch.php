<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GeneratePublicExamsBatch extends Command
{
    protected $signature = 'public:generate-exams-batch '
        .' {--subjects=Toán,Vật lý,Hóa học,Sinh học,Địa lý,Lịch sử} '
        .' {--class=Lớp 12} {--num=20} {--duration=60} {--count=1} {--random=}';

    protected $description = 'Generate multiple public exams for a list of subjects in one run';

    public function handle(): int
    {
        $subjects = array_values(array_filter(array_map('trim', explode(',', (string) $this->option('subjects')))));
        $class = (string) $this->option('class');
        $num = (int) $this->option('num');
        $duration = (int) $this->option('duration');
        $count = max(1, (int) $this->option('count'));
        $random = $this->option('random');

        // If --random is provided, pick a random subset (or with repeats if needed)
        if ($random !== null) {
            $k = max(0, (int) $random);
            if ($k > 0) {
                $pool = $subjects;
                $subjects = [];
                if (count($pool) === 0) {
                    $this->error('No subjects provided to pick from.');
                    return self::FAILURE;
                }
                if ($k <= count($pool)) {
                    $keys = array_rand($pool, $k);
                    if (!is_array($keys)) { $keys = [$keys]; }
                    foreach ($keys as $key) {
                        $subjects[] = $pool[$key];
                    }
                } else {
                    // Take all subjects once (shuffled), then fill the rest with random picks (with replacement)
                    $shuffled = $pool;
                    shuffle($shuffled);
                    $subjects = $shuffled;
                    for ($i = count($pool); $i < $k; $i++) {
                        $subjects[] = $pool[array_rand($pool)];
                    }
                }
                $this->info('Randomly picked subjects: '.implode(', ', $subjects));
            }
        }

        if (empty($subjects)) {
            $this->error('No subjects provided');
            return self::FAILURE;
        }

        foreach ($subjects as $subject) {
            for ($i = 1; $i <= $count; $i++) {
                $this->info("Generating [$i/$count]: $subject - $class ($num câu, $duration phút)");
                $exit = Artisan::call('public:generate-exam', [
                    '--subject' => $subject,
                    '--class' => $class,
                    '--num' => $num,
                    '--duration' => $duration,
                ]);
                $this->line(Artisan::output());
                if ($exit !== 0) {
                    $this->warn("Failed generating for subject: $subject (exit $exit)");
                }
            }
        }

        $this->info('Batch generation finished.');
        return self::SUCCESS;
    }
}


