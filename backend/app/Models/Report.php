<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'student_id', 'class_id', 'average_score', 'attendance_rate', 'report_date',
    ];

    protected $casts = [
        'average_score' => 'decimal:2',
        'attendance_rate' => 'decimal:2',
        'report_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }
}
