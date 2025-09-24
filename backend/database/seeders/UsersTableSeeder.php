<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Admin
        User::updateOrCreate(
            ['email' => 'admin@smartclass.ai'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'avatar_url' => null,
                'bio' => 'System administrator',
                'email_verified_at' => $now,
            ]
        );

        // Teachers
        $teachers = [
            ['name' => 'Alice Teacher', 'email' => 'alice@smartclass.ai'],
            ['name' => 'Bob Teacher', 'email' => 'bob@smartclass.ai'],
            ['name' => 'Carol Teacher', 'email' => 'carol@smartclass.ai'],
        ];
        foreach ($teachers as $t) {
            User::updateOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('password'),
                    'role' => 'teacher',
                    'avatar_url' => null,
                    'bio' => 'Experienced educator',
                    'email_verified_at' => $now,
                ]
            );
        }

        // Students
        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => "student{$i}@smartclass.ai"],
                [
                    'name' => "Student {$i}",
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'avatar_url' => null,
                    'bio' => 'Enthusiastic learner',
                    'email_verified_at' => $now,
                ]
            );
        }
    }
}
