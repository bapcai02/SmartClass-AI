<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicClass extends Model
{
    use HasFactory;

    protected $table = 'public_classes';
    protected $fillable = ['name'];
}


