<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicSubject extends Model
{
    use HasFactory;

    protected $table = 'public_subjects';
    protected $fillable = ['name'];
}


