<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicSubmission extends Model
{
    use HasFactory;

    protected $table = 'public_submissions';
    protected $fillable = [
        'public_exam_id','candidate_name','candidate_email','attempt_no','score','answers_json','duration_seconds','started_at','submitted_at','ip_address'
    ];

    protected $casts = [
        'answers_json' => 'array',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];
}


