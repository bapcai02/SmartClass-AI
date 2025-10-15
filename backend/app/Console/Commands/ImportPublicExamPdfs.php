<?php

namespace App\Console\Commands;

use App\Models\PublicClass;
use App\Models\PublicExamPdf;
use App\Models\PublicSubject;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ImportPublicExamPdfs extends Command
{
    protected $signature = 'public:import-exam-pdfs {--subject=} {--class=} {--dir=} {--category=}';

    protected $description = 'Import exam PDF files from a directory into public_exam_pdfs with subject/class mapping';

    public function handle(): int
    {
        $subjectName = $this->option('subject') ?: 'Hóa học';
        $className = $this->option('class') ?: 'Lớp 12';
        $dir = $this->option('dir') ?: 'storage/app/public/exam-pdfs';
        $categoryOpt = $this->option('category');

        // Normalize to storage-relative path when under storage/app/public
        $storagePublicPrefix = 'storage/app/public/';
        if (str_starts_with($dir, '/')) {
            // Absolute path, make it relative to base_path
            $base = base_path('');
            if (str_starts_with($dir, $base)) {
                $dir = ltrim(substr($dir, strlen($base)), '/');
            }
        }

        $this->info("Scanning directory: {$dir}");

        $subject = PublicSubject::firstOrCreate(['name' => $subjectName]);
        $class = PublicClass::firstOrCreate(['name' => $className]);

        $absoluteDir = base_path($dir);
        if (!is_dir($absoluteDir)) {
            $this->error('Directory not found: '.$absoluteDir);
            return self::FAILURE;
        }

        $rii = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($absoluteDir));
        $added = 0; $skipped = 0;
        foreach ($rii as $file) {
            if ($file->isDir()) continue;
            $path = $file->getPathname();
            if (!preg_match('/\.pdf$/i', $path)) continue;

            // Build storage-relative path for pdf_url
            $relativeFromBase = ltrim(str_replace(base_path(''), '', $path), '/');
            $pdfUrl = $relativeFromBase;
            if (str_starts_with($pdfUrl, $storagePublicPrefix)) {
                $pdfUrl = substr($pdfUrl, strlen($storagePublicPrefix));
            }

            // Title from filename
            $base = basename($path);
            $title = preg_replace('/\.pdf$/i', '', $base);
            $title = str_replace(['.docx - Google Tài liệu', '.docx - Google Tài liệu (1)'], '', $title);

            // Skip if already imported for this subject/class by same pdf_url
            $alreadyExists = PublicExamPdf::where('pdf_url', $pdfUrl)
                ->where('public_subject_id', $subject->id)
                ->where('public_class_id', $class->id)
                ->exists();

            if ($alreadyExists) {
                $skipped++;
                continue;
            }

            // derive category from directory name if not provided
            $category = $categoryOpt;
            if (!$category) {
                // pick immediate parent directory under Lop-12/<Category>/filename.pdf
                $parentDir = basename(dirname($path));
                $category = $parentDir && !preg_match('/^Lop-\d+$/i', $parentDir) ? $parentDir : null;
            }

            try {
                PublicExamPdf::create([
                    'title' => $title,
                    'public_subject_id' => $subject->id,
                    'public_class_id' => $class->id,
                    'category' => $category,
                    'pdf_url' => $pdfUrl,
                    'file_size_bytes' => @filesize($path) ?: null,
                    'num_pages' => null,
                ]);
                $added++;
            } catch (\Throwable $e) {
                $skipped++;
            }
        }

        $this->info("Imported: {$added}, Skipped: {$skipped}");
        return self::SUCCESS;
    }
}



