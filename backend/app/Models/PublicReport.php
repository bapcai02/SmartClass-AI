<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicReport extends Model
{
    use HasFactory;

    protected $table = 'public_reports';
    protected $fillable = [
        'target_type','target_id','reason','details','contact','status'
    ];
}


