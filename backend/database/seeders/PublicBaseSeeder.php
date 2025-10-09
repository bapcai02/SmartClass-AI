<?php

namespace Database\Seeders;

use App\Models\PublicClass;
use App\Models\PublicSubject;
use Illuminate\Database\Seeder;

class PublicBaseSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = ['Toán','Vật lý','Hóa học','Sinh học','Địa lý','Lịch sử','Tiếng Anh'];
        foreach ($subjects as $name) {
            PublicSubject::firstOrCreate(['name' => $name]);
        }

        $classes = ['Lớp 10','Lớp 11','Lớp 12'];
        foreach ($classes as $name) {
            PublicClass::firstOrCreate(['name' => $name]);
        }
    }
}


