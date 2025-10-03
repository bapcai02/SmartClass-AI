<?php

namespace App\Console\Commands;

use App\Models\PublicChoice;
use App\Models\PublicClass;
use App\Models\PublicExam;
use App\Models\PublicQuestion;
use App\Models\PublicSubject;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class GeneratePublicExamFromGemini extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Options:
     *  --subject=         Subject name (e.g., "Toán", "Vật lý")
     *  --class=           Class name (e.g., "Lớp 12")
     *  --title=           Custom exam title
     *  --num=             Number of questions to request (default: 20)
     *  --duration=        Duration minutes (default: 60)
     */
    protected $signature = 'public:generate-exam '
        .' {--subject=} {--class=} {--title=} {--num=20} {--duration=60}';

    /**
     * The console command description.
     */
    protected $description = 'Call Gemini to generate a public exam and insert it into database';

    public function handle(): int
    {
        $subjectName = $this->option('subject') ?: 'Toán';
        $className = $this->option('class') ?: 'Lớp 12';
        $title = $this->option('title') ?: ("Đề thi $subjectName - $className");
        $numQuestions = (int) $this->option('num') ?: 20;
        $duration = (int) $this->option('duration') ?: 60;

        $apiKey = config('services.gemini.api_key');
        $apiUrl = config('services.gemini.api_url');
        $apiUrlsEnv = env('GEMINI_API_URLS');
        $apiUrls = array_values(array_filter(array_map('trim', explode(',', (string) $apiUrlsEnv))));
        if (empty($apiUrls)) { $apiUrls = [$apiUrl]; }
        if (!$apiKey || !$apiUrl) {
            $this->error('Gemini API not configured. Please set GEMINI_API_KEY and GEMINI_API_URL.');
            return self::FAILURE;
        }

        $prompt = $this->buildPrompt($subjectName, $className, $numQuestions);

        try {
            $payload = [
                'contents' => [[
                    'parts' => [[ 'text' => $prompt ]],
                ]],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'topK' => 40,
                    'topP' => 0.95,
                ],
            ];

            $json = null;
            $lastStatus = null; $lastBody = null;
            foreach ($apiUrls as $endpoint) {
                $this->line("Trying model endpoint: $endpoint");
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->timeout(120)
                    ->connectTimeout(15)
                    ->retry(1, 1000)
                    ->withQueryParameters(['key' => $apiKey])
                    ->post($endpoint, $payload);
                if ($response->ok()) {
                    $json = $this->extractJsonFromGemini($response->json());
                    if ($json) break;
                    // 200 but cannot parse JSON → try next endpoint
                    $this->line('Received 200 but JSON invalid, trying next model...');
                    continue;
                }
                $lastStatus = $response->status();
                $lastBody = $response->body();
                $this->line("Model returned non-200: $lastStatus. Trying next if retriable...");
                if (!in_array($lastStatus, [429, 500, 503, 504])) {
                    // non-retriable
                    break;
                }
                // try next endpoint on retriable errors
            }
            if (!$json) {
                $this->error('Could not extract JSON from Gemini response.');
                if ($lastStatus) {
                    $this->error('Last status: '.$lastStatus.' '.$lastBody);
                }
                return self::FAILURE;
            }

            $this->validateExamJson($json);

            DB::transaction(function () use ($json, $subjectName, $className, $title, $duration) {
                $subject = PublicSubject::firstOrCreate(['name' => $subjectName]);
                $class = PublicClass::firstOrCreate(['name' => $className]);

                $exam = PublicExam::create([
                    'title' => $title,
                    'description' => Arr::get($json, 'description'),
                    'public_subject_id' => $subject->id,
                    'public_class_id' => $class->id,
                    'duration_minutes' => $duration,
                ]);

                foreach (Arr::get($json, 'questions', []) as $q) {
                    $question = PublicQuestion::create([
                        'public_exam_id' => $exam->id,
                        'content' => (string) Arr::get($q, 'content', ''),
                    ]);
                    $answerLetter = strtoupper((string) Arr::get($q, 'answer', '')) ?: null;
                    foreach (Arr::get($q, 'choices', []) as $choice) {
                        $label = (string) Arr::get($choice, 'label', '');
                        $labelUp = strtoupper($label);
                        $isCorrectFlag = Arr::has($choice, 'is_correct') ? (bool) Arr::get($choice, 'is_correct', false) : null;
                        $isCorrect = $isCorrectFlag === null
                            ? ($answerLetter && $labelUp === $answerLetter)
                            : (bool) $isCorrectFlag;
                        PublicChoice::create([
                            'public_question_id' => $question->id,
                            'label' => $label,
                            'content' => (string) Arr::get($choice, 'content', ''),
                            'is_correct' => $isCorrect,
                        ]);
                    }
                }
            });

            $this->info('Exam generated and saved successfully.');
            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error('Failed: '.$e->getMessage());
            return self::FAILURE;
        }
    }

    private function buildPrompt(string $subject, string $class, int $num): string
    {
        return <<<PROMPT
You are a Vietnamese exam generator. Create a multiple-choice exam for subject "$subject" and level "$class" with $num questions. Return STRICT JSON only, no markdown, following this schema:
{
  "description": string,
  "questions": [
    {
      "content": string,
      "choices": [
        { "label": "A", "content": string, "is_correct": boolean },
        { "label": "B", "content": string, "is_correct": boolean },
        { "label": "C", "content": string, "is_correct": boolean },
        { "label": "D", "content": string, "is_correct": boolean }
      ]
    }
  ]
}
Ensure exactly one choice has is_correct=true per question. Language: Vietnamese.
PROMPT;
    }

    /**
     * Extract JSON string from Gemini response structure.
     */
    private function extractJsonFromGemini(array $response): ?array
    {
        // Gemini returns candidates[0].content.parts[*].text
        $text = '';
        $parts = Arr::get($response, 'candidates.0.content.parts', []);
        foreach ($parts as $part) {
            $text .= (string) Arr::get($part, 'text', '');
        }
        if (!$text) return null;

        // Strip code fences if present
        $text = trim($text);
        $text = preg_replace('/^```json\\n|^```|```$/m', '', $text);
        $text = trim($text);

        $decoded = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        return $decoded;
    }

    private function validateExamJson(array $json): void
    {
        if (!isset($json['questions']) || !is_array($json['questions'])) {
            throw new Exception('Invalid JSON: missing questions array');
        }
        foreach ($json['questions'] as $idx => $q) {
            if (!isset($q['content']) || !isset($q['choices']) || !is_array($q['choices'])) {
                throw new Exception("Invalid question at index $idx");
            }
            $correct = 0;
            foreach ($q['choices'] as $ch) {
                if (!isset($ch['label'], $ch['content'])) {
                    throw new Exception("Invalid choice in question $idx");
                }
                if (!empty($ch['is_correct'])) $correct++;
            }
            if ($correct !== 1) {
                throw new Exception("Question $idx must have exactly 1 correct choice");
            }
        }
    }
}


