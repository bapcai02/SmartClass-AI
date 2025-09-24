<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ClassroomController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Classrooms
    Route::get('/classes', [ClassroomController::class, 'index']);
    Route::get('/classes/{id}', [ClassroomController::class, 'show']);
    Route::post('/classes', [ClassroomController::class, 'store']);
    Route::put('/classes/{id}', [ClassroomController::class, 'update']);
    Route::delete('/classes/{id}', [ClassroomController::class, 'destroy']);
});


