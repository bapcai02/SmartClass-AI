<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicQuestion extends Model
{
    use HasFactory;

    protected $table = 'public_questions';
    protected $fillable = ['public_exam_id','content'];

    public function choices() { return $this->hasMany(PublicChoice::class, 'public_question_id'); }
}


