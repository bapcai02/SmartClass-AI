<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicChoice extends Model
{
    use HasFactory;

    protected $table = 'public_choices';
    protected $fillable = ['public_question_id','label','content','is_correct'];
}


