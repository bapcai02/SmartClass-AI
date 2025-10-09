<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicExam extends Model
{
    use HasFactory;

    protected $table = 'public_exams';
    protected $fillable = [
        'title','description','public_subject_id','public_class_id','duration_minutes'
    ];

    public function subject() { return $this->belongsTo(PublicSubject::class, 'public_subject_id'); }
    public function clazz() { return $this->belongsTo(PublicClass::class, 'public_class_id'); }
    public function questions() { return $this->hasMany(PublicQuestion::class, 'public_exam_id'); }
}


