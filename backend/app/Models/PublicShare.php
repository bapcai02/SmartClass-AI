<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicShare extends Model
{
    use HasFactory;

    protected $table = 'public_shares';
    protected $fillable = [
        'token','target_type','target_id','expires_at','password_hash','max_views','views'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}


