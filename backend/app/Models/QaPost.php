<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QaPost extends Model
{
    use SoftDeletes;

    protected $table = 'qa_posts';

    protected $fillable = [
        'user_id', 'question_text', 'image_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function answers()
    {
        return $this->hasMany(QaAnswer::class, 'qa_post_id');
    }
}
