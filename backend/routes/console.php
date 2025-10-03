<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Example schedule (optional): generate a math exam daily at 3am
// Note: In production, ensure the scheduler is running (php artisan schedule:work)
Schedule::command('public:generate-exam --subject=Toán --class="Lớp 12" --num=20 --duration=60')->dailyAt('03:00');
