<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiChatController extends Controller
{
    private $geminiApiKey;
    private $geminiApiUrl;

    public function __construct(
        private ChatService $chatService
    ) {
        $this->geminiApiKey = config('services.gemini.api_key');
        $this->geminiApiUrl = config('services.gemini.api_url');
    }

    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_history' => ['nullable', 'array'],
            'context' => ['nullable', 'string', 'max:1000'],
            'session_id' => ['nullable', 'integer', 'exists:chat_sessions,id'],
        ]);

        $user = $request->user();
        $startTime = microtime(true);

        try {
            // Get or create session
            $session = isset($data['session_id']) && $data['session_id'] 
                ? $this->chatService->getSessionById($data['session_id'], $user->id)
                : $this->chatService->getActiveSession($user->id);

            if (!$session) {
                $session = $this->chatService->createSession(
                    $user->id, 
                    'New Chat',
                    $data['context'] ? ['context' => $data['context']] : null
                );
            }

            // Get conversation history from database
            $conversationHistory = $this->chatService->getConversationsBySession($session->id, 10);
            $historyForApi = $conversationHistory->map(function ($conv) {
                return [
                    'role' => $conv->message_type,
                    'content' => $conv->message_type === 'user' ? $conv->message : $conv->response,
                ];
            })->toArray();

            // Send to Gemini
            $apiData = [
                'message' => $data['message'],
                'conversation_history' => $historyForApi,
                'context' => $data['context'],
            ];

            $response = $this->sendToGemini($apiData);
            $responseTime = round((microtime(true) - $startTime) * 1000);

            // Save user message
            $this->chatService->createConversation([
                'user_id' => $user->id,
                'conversation_id' => $session->id,
                'message' => $data['message'],
                'message_type' => 'user',
                'context' => $data['context'] ? ['context' => $data['context']] : null,
            ]);

            // Save AI response
            $this->chatService->createConversation([
                'user_id' => $user->id,
                'conversation_id' => $session->id,
                'message' => $data['message'],
                'response' => $response,
                'message_type' => 'assistant',
                'context' => $data['context'] ? ['context' => $data['context']] : null,
                'response_time_ms' => $responseTime,
            ]);

            // Update session
            $this->chatService->updateSessionLastMessage($session->id);
            
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

        // Add current message
        $messages[] = [
            'role' => 'user',
            'parts' => [['text' => $data['message']]]
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

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($this->geminiApiUrl . '?key=' . $this->geminiApiKey, $payload);

        if (!$response->successful()) {
            throw new \Exception('Gemini API request failed: ' . $response->body());
        }

        $responseData = $response->json();
        
        if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Invalid response format from Gemini API');
        }

        return $responseData['candidates'][0]['content']['parts'][0]['text'];
    }

    public function getSuggestions(): JsonResponse
    {
        $suggestions = [
            "Explain the concept of photosynthesis",
            "Help me solve this math problem: 2x + 5 = 13",
            "What are the main causes of World War I?",
            "How does the water cycle work?",
            "Can you help me understand Newton's laws of motion?",
            "What is the difference between mitosis and meiosis?",
            "Explain the concept of democracy",
            "Help me write a thesis statement for my essay",
            "What are the key features of Renaissance art?",
            "How do I improve my study habits?"
        ];

        return response()->json([
            'suggestions' => $suggestions
        ]);
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

    public function createSession(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'context' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $session = $this->chatService->createSession(
            $user->id,
            $data['title'] ?? 'New Chat',
            $data['context'] ? ['context' => $data['context']] : null
        );

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
        $deleted = $this->chatService->deleteSession($sessionId, $user->id);

        if (!$deleted) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        return response()->json(['message' => 'Session deleted successfully']);
    }

    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = $this->chatService->getUserChatStats($user->id);

        return response()->json($stats);
    }
}
