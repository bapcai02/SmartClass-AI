<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GeneratePublicExamsBatch extends Command
{
    protected $signature = 'public:generate-exams-batch '
        .' {--subjects=Toán,Vật lý,Hóa học,Sinh học,Địa lý,Lịch sử} '
        .' {--class=Lớp 12} {--num=20} {--duration=60} {--count=1}';

    protected $description = 'Generate multiple public exams for a list of subjects in one run';

    public function handle(): int
    {
        $subjects = array_values(array_filter(array_map('trim', explode(',', (string) $this->option('subjects')))));
        $class = (string) $this->option('class');
        $num = (int) $this->option('num');
        $duration = (int) $this->option('duration');
        $count = max(1, (int) $this->option('count'));

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


