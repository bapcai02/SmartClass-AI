<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ClassroomController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\QaController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\PublicExamController;
use App\Http\Controllers\Api\PublicExamPdfController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ConversationController;
use Illuminate\Broadcasting\BroadcastController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public endpoints (no auth) - now backed by public_* tables
Route::get('/public/question-bank', [PublicExamController::class, 'index']);
Route::post('/public/ai/chat', [AiChatController::class, 'publicChat']);
Route::get('/public/subjects', [PublicExamController::class, 'subjects']);
Route::get('/public/exams/{id}', [PublicExamController::class, 'show']);
Route::post('/public/exams/{id}/submit', [PublicExamController::class, 'submit']);
Route::get('/public/leaderboard', [PublicExamController::class, 'leaderboard']);
Route::get('/public/exam-pdfs', [PublicExamPdfController::class, 'index']);
Route::get('/public/exam-pdfs/{id}/download', [PublicExamPdfController::class, 'download']);
Route::get('/public/exam-pdfs/{id}/view', [PublicExamPdfController::class, 'view']);

// (Removed /public2/* aliases)

// Broadcasting auth for SPA (token-based)
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate'])->middleware('auth:api');

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Classrooms
    Route::get('/classes', [ClassroomController::class, 'index']);
    Route::get('/classes/{id}', [ClassroomController::class, 'show']);
    Route::get('/classes/{id}/detail', [ClassroomController::class, 'detail']);
    Route::get('/classes/{id}/attendance', [ClassroomController::class, 'attendance']);
    Route::get('/classes/{id}/grades', [ClassroomController::class, 'grades']);
    Route::get('/classes/{id}/leaderboard', [ClassroomController::class, 'leaderboard']);
    Route::get('/classes/{id}/announcements', [ClassroomController::class, 'announcements']);
    Route::post('/classes/{id}/announcements', [ClassroomController::class, 'storeAnnouncement']);
    Route::get('/classes/{id}/students', [ClassroomController::class, 'students']);
    Route::post('/classes/{id}/resources', [ClassroomController::class, 'uploadResource']);
    Route::get('/classes/{id}/resources/{rid}/download', [ClassroomController::class, 'downloadResource']);
    Route::delete('/classes/{id}/resources/{rid}', [ClassroomController::class, 'destroyResource']);
    Route::post('/classes/{id}/students', [ClassroomController::class, 'addStudents']);
    Route::delete('/classes/{id}/students', [ClassroomController::class, 'removeStudents']);
    Route::post('/classes', [ClassroomController::class, 'store']);
    Route::put('/classes/{id}', [ClassroomController::class, 'update']);
    Route::delete('/classes/{id}', [ClassroomController::class, 'destroy']);

    // Assignments per class
    Route::get('/classes/{classId}/assignments', [AssignmentController::class, 'index']);
    Route::get('/classes/{classId}/assignments/{id}', [AssignmentController::class, 'show']);
    Route::post('/classes/{classId}/assignments', [AssignmentController::class, 'store']);
    Route::put('/classes/{classId}/assignments/{id}', [AssignmentController::class, 'update']);
    Route::delete('/classes/{classId}/assignments/{id}', [AssignmentController::class, 'destroy']);

    // All assignments
    Route::get('/assignments', [AssignmentController::class, 'all']);
    Route::get('/assignments/stats', [AssignmentController::class, 'stats']);

    // Exams per class
    Route::get('/classes/{classId}/exams', [ExamController::class, 'index']);
    Route::get('/classes/{classId}/exams/{id}', [ExamController::class, 'show']);
    Route::get('/classes/{classId}/exams/{id}/stats', [ExamController::class, 'stats']);
    Route::post('/classes/{classId}/exams', [ExamController::class, 'store']);
    Route::put('/classes/{classId}/exams/{id}', [ExamController::class, 'update']);
    Route::delete('/classes/{classId}/exams/{id}', [ExamController::class, 'destroy']);
    Route::post('/classes/{classId}/exams/{id}/submit', [ExamController::class, 'submit']);

    // All exams
    Route::get('/exams', [ExamController::class, 'all']);
    Route::get('/exams/stats', [ExamController::class, 'allStats']);

    // Reports
    Route::get('/reports/overall-stats', [ReportController::class, 'overallStats']);
    Route::get('/reports/class-performance', [ReportController::class, 'classPerformance']);
    Route::get('/reports/student-performance', [ReportController::class, 'studentPerformance']);
    Route::get('/reports/attendance-stats', [ReportController::class, 'attendanceStats']);
    Route::get('/reports/grade-distribution', [ReportController::class, 'gradeDistribution']);
    Route::get('/reports/recent-activity', [ReportController::class, 'recentActivity']);
    Route::get('/reports/monthly-stats', [ReportController::class, 'monthlyStats']);

    // Q&A
    Route::get('/qa', [QaController::class, 'index']);
    Route::get('/qa/my-posts', [QaController::class, 'myPosts']);
    Route::get('/qa/my-answers', [QaController::class, 'myAnswers']);
    Route::get('/qa/my-stats', [QaController::class, 'myStats']);
    Route::get('/qa/{id}', [QaController::class, 'show']);
    Route::post('/qa', [QaController::class, 'storePost']);
    Route::post('/qa/{id}/answers', [QaController::class, 'storeAnswer']);
    Route::put('/qa/posts/{id}', [QaController::class, 'updatePost']);
    Route::put('/qa/answers/{id}', [QaController::class, 'updateAnswer']);
    Route::delete('/qa/posts/{id}', [QaController::class, 'destroyPost']);
    Route::delete('/qa/answers/{id}', [QaController::class, 'destroyAnswer']);

    // Resources
    Route::get('/resources', [ResourceController::class, 'index']);
    Route::get('/resources/stats', [ResourceController::class, 'stats']);
    Route::get('/resources/recent', [ResourceController::class, 'recent']);
    Route::get('/resources/class/{classId}', [ResourceController::class, 'byClass']);
    Route::get('/resources/{id}', [ResourceController::class, 'show']);
    Route::post('/resources', [ResourceController::class, 'store']);
    Route::put('/resources/{id}', [ResourceController::class, 'update']);
    Route::delete('/resources/{id}', [ResourceController::class, 'destroy']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);
    Route::get('/profile/activity', [ProfileController::class, 'activity']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'getSettings']);
    Route::put('/settings', [SettingsController::class, 'updateSettings']);
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile']);
    Route::put('/settings/password', [SettingsController::class, 'updatePassword']);
    Route::delete('/settings/account', [SettingsController::class, 'deleteAccount']);
    Route::get('/settings/export', [SettingsController::class, 'exportData']);

    // AI Chat
    Route::post('/ai/chat', [AiChatController::class, 'chat']);
    Route::get('/ai/suggestions', [AiChatController::class, 'getSuggestions']);
    Route::get('/ai/context', [AiChatController::class, 'getContext']);
    Route::get('/ai/sessions', [AiChatController::class, 'getSessions']);
    Route::get('/ai/sessions/{id}', [AiChatController::class, 'getSession']);
    Route::post('/ai/sessions', [AiChatController::class, 'createSession']);
    Route::delete('/ai/sessions/{id}', [AiChatController::class, 'deleteSession']);
    Route::get('/ai/stats', [AiChatController::class, 'getStats']);

    // Conversations (1-1, groups)
    Route::get('/chat/conversations', [ConversationController::class, 'index']);
    Route::get('/chat/conversations/{id}', [ConversationController::class, 'show']);
    Route::post('/chat/conversations/{id}/messages', [ConversationController::class, 'send']);
    Route::post('/chat/conversations/{id}/reactions', [ConversationController::class, 'react']);
    Route::post('/chat/direct', [ConversationController::class, 'direct']);
    Route::post('/chat/groups', [ConversationController::class, 'createGroup']);
    Route::post('/chat/conversations/{id}/participants', [ConversationController::class, 'addParticipants']);
    Route::delete('/chat/conversations/{id}/participants', [ConversationController::class, 'removeParticipant']);

    // Lookups
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/users', [UserController::class, 'index']);
});


