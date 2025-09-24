<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attendance extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'timetable_id', 'student_id', 'status', 'checked_at',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
    ];

    public function timetable()
    {
        return $this->belongsTo(Timetable::class, 'timetable_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
