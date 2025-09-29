<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiChatController extends Controller
{
    private $geminiApiKey;
    private $geminiApiUrl;
    /** @var ChatService */
    private $chatService;

    public function __construct(ChatService $chatService) {
        $this->chatService = $chatService;
        $this->geminiApiKey = config('services.gemini.api_key');
        $this->geminiApiUrl = config('services.gemini.api_url');
    }

    public function chat(\App\Http\Requests\ChatRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $request->user();
        $startTime = microtime(true);

        try {
            // Determine session if provided; otherwise we'll create it inside DB transaction later
            $session = null;
            if (isset($data['session_id']) && $data['session_id']) {
                $session = $this->chatService->getSessionById($data['session_id'], $user->id);
            }

            // Get conversation history from database
            $conversationHistory = $this->chatService->getConversationsBySession($session->id, 10);
            $historyForApi = $conversationHistory->map(function ($conv) {
                return [
                    'role' => $conv->message_type,
                    'content' => $conv->message_type === 'user' ? $conv->message : $conv->response,
                ];
            })->toArray();

            // If client sent conversation_history as JSON string (multipart), decode it and merge
            if (!empty($data['conversation_history']) && is_string($data['conversation_history'])) {
                $clientHistory = json_decode($data['conversation_history'], true);
                if (is_array($clientHistory)) {
                    $historyForApi = $clientHistory;
                }
            } elseif (!empty($data['conversation_history']) && is_array($data['conversation_history'])) {
                $historyForApi = $data['conversation_history'];
            }

            // Send to Gemini
            $apiData = [
                'message' => $data['message'],
                'conversation_history' => $historyForApi,
                'context' => $data['context'] ?? null,
            ];

            // If image uploaded, include base64 inline data
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $mime = $file->getMimeType() ?: 'image/jpeg';
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $apiData['image'] = [
                    'mime' => $mime,
                    'data' => $base64,
                ];
            }

            $response = $this->sendToGemini($apiData);
            $responseTime = round((microtime(true) - $startTime) * 1000);

            // Persist DB changes atomically (commit/rollback)
            DB::beginTransaction();
            try {
                if (!$session) {
                    // Create session now that we have a response
                    $rawTitle = trim((string)($data['message'] ?? 'New Chat'));
                    $title = mb_substr($rawTitle, 0, 60) ?: 'New Chat';
                    $session = $this->chatService->createSession(
                        $user->id,
                        $title,
                        !empty($data['context']) ? ['context' => $data['context']] : null
                    );
                }

                $this->chatService->createConversation([
                    'user_id' => $user->id,
                    'conversation_id' => $session->id,
                    'message' => $data['message'],
                    'message_type' => 'user',
                    'context' => !empty($data['context']) ? ['context' => $data['context']] : null,
                ]);

                $this->chatService->createConversation([
                    'user_id' => $user->id,
                    'conversation_id' => $session->id,
                    'message' => $data['message'],
                    'response' => $response,
                    'message_type' => 'assistant',
                    'context' => !empty($data['context']) ? ['context' => $data['context']] : null,
                    'response_time_ms' => $responseTime,
                ]);

                $this->chatService->updateSessionLastMessage($session->id);
                DB::commit();
            } catch (\Throwable $txe) {
                DB::rollBack();
                throw $txe;
            }
            
            return response()->json([
                'success' => true,
                'response' => $response,
                'session_id' => $session->id,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gemini API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Sorry, I encountered an error. Please try again.',
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }

    private function sendToGemini(array $data): string
    {
        if (!$this->geminiApiKey) {
            throw new \Exception('Gemini API key not configured');
        }

        $messages = [];
        
        // Add system context
        $systemPrompt = "You are SmartClass AI, an intelligent educational assistant. You help students and teachers with academic questions, provide explanations, solve problems, and offer learning guidance. Be helpful, accurate, and encouraging. If asked about topics outside education, politely redirect to educational subjects.";
        
        if (!empty($data['context'])) {
            $systemPrompt .= "\n\nContext: " . $data['context'];
        }
        
        $messages[] = [
            'role' => 'user',
            'parts' => [['text' => $systemPrompt]]
        ];

        // Add conversation history
        if (!empty($data['conversation_history'])) {
            foreach ($data['conversation_history'] as $message) {
                $messages[] = [
                    'role' => $message['role'] === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $message['content']]]
                ];
            }
        }

        // Add current message, with optional image inlineData
        $currentParts = [
            ['text' => $data['message']],
        ];
        if (!empty($data['image']) && is_array($data['image']) && !empty($data['image']['data'])) {
            $currentParts[] = [
                'inlineData' => [
                    'mimeType' => $data['image']['mime'] ?? 'image/jpeg',
                    'data' => $data['image']['data'],
                ]
            ];
        }
        $messages[] = [
            'role' => 'user',
            'parts' => $currentParts,
        ];

        $payload = [
            'contents' => $messages,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
            ],
            'safetySettings' => [
                [
                    'category' => 'HARM_CATEGORY_HARASSMENT',
                    'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                ],
                [
                    'category' => 'HARM_CATEGORY_HATE_SPEECH',
                    'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                ],
                [
                    'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                ],
                [
                    'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                ]
            ]
        ];

        // Log request payload shape for debugging (avoid secrets)
        Log::info('Gemini request payload prepared', [
            'messages_count' => count($messages),
            'has_image' => !empty($data['image']),
            'generationConfig' => $payload['generationConfig'] ?? null,
        ]);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($this->geminiApiUrl . '?key=' . $this->geminiApiKey, $payload);

        if (!$response->successful()) {
            Log::error('Gemini API HTTP error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Gemini API request failed: ' . $response->body());
        }

        $responseData = $response->json();

        // Collect text from any candidate/part
        $collectedText = '';
        if (isset($responseData['candidates']) && is_array($responseData['candidates'])) {
            foreach ($responseData['candidates'] as $candidate) {
                if (isset($candidate['content']['parts']) && is_array($candidate['content']['parts'])) {
                    foreach ($candidate['content']['parts'] as $part) {
                        if (isset($part['text']) && is_string($part['text'])) {
                            $collectedText .= $part['text'] . "\n";
                        }
                    }
                }
            }
        }

        $collectedText = trim($collectedText);
        if ($collectedText !== '') {
            return $collectedText;
        }

        // If no text was found, log and return a graceful message
        Log::error('Gemini API invalid response format', [
            'top_level_keys' => is_array($responseData) ? array_keys($responseData) : 'non-array',
            'raw' => $response->body(),
        ]);

        if (!empty($responseData['candidates'][0]['finishReason'])) {
            return 'The model did not return text (finishReason: ' . $responseData['candidates'][0]['finishReason'] . '). Please try again or rephrase.';
        }

        throw new \Exception('Invalid response format from Gemini API');
    }

    public function getContext(): JsonResponse
    {
        // In a real application, this would fetch user's current context
        // like enrolled classes, recent assignments, etc.
        $context = [
            'current_classes' => ['Mathematics', 'Science', 'History'],
            'recent_topics' => ['Algebra', 'Biology', 'World Wars'],
            'upcoming_assignments' => ['Math Quiz', 'Science Project'],
        ];

        return response()->json($context);
    }

    public function getSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessions = $this->chatService->getUserSessions($user->id, 20);

        return response()->json([
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'total_messages' => $session->total_messages,
                    'last_message_at' => $session->last_message_at,
                    'is_active' => $session->is_active,
                ];
            })
        ]);
    }

    public function getSession(Request $request, int $sessionId): JsonResponse
    {
        $user = $request->user();
        $session = $this->chatService->getSessionById($sessionId, $user->id);

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $conversations = $this->chatService->getConversationsBySession($sessionId, 50);

        return response()->json([
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'total_messages' => $session->total_messages,
                'last_message_at' => $session->last_message_at,
                'is_active' => $session->is_active,
            ],
            'conversations' => $conversations->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'message' => $conv->message,
                    'response' => $conv->response,
                    'message_type' => $conv->message_type,
                    'created_at' => $conv->created_at,
                ];
            })
        ]);
    }

    public function createSession(\App\Http\Requests\CreateSessionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $request->user();
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $session = $this->chatService->createSession(
                $user->id,
                $data['title'] ?? 'New Chat',
                !empty($data['context']) ? ['context' => $data['context']] : null
            );
            \Illuminate\Support\Facades\DB::commit();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            throw $e;
        }

        return response()->json([
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'total_messages' => $session->total_messages,
                'last_message_at' => $session->last_message_at,
                'is_active' => $session->is_active,
            ]
        ], 201);
    }

    public function deleteSession(Request $request, int $sessionId): JsonResponse
    {
        $user = $request->user();
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $deleted = $this->chatService->deleteSession($sessionId, $user->id);
            if (!$deleted) {
                \Illuminate\Support\Facades\DB::rollBack();
                return response()->json(['error' => 'Session not found'], 404);
            }
            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Session deleted successfully']);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            throw $e;
        }
    }

    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = $this->chatService->getUserChatStats($user->id);

        return response()->json($stats);
    }
}
