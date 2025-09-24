<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'description',
    ];

    public function classes()
    {
        return $this->hasMany(ClassRoom::class, 'subject_id');
    }
}
