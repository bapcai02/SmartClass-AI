<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicExamPdf extends Model
{
    use HasFactory;

    protected $table = 'public_exam_pdfs';
    protected $fillable = [
        'title','public_subject_id','public_class_id','category','pdf_url','file_size_bytes','num_pages','download_count','view_count'
    ];

    public function subject() { return $this->belongsTo(PublicSubject::class, 'public_subject_id'); }
    public function clazz() { return $this->belongsTo(PublicClass::class, 'public_class_id'); }
}


