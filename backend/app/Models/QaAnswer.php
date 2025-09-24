<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QaAnswer extends Model
{
    use SoftDeletes;

    protected $table = 'qa_answers';

    protected $fillable = [
        'qa_post_id', 'user_id', 'answer_text',
    ];

    public function post()
    {
        return $this->belongsTo(QaPost::class, 'qa_post_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
