<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ClassroomController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Classrooms
    Route::get('/classes', [ClassroomController::class, 'index']);
    Route::get('/classes/{id}', [ClassroomController::class, 'show']);
    Route::get('/classes/{id}/detail', [ClassroomController::class, 'detail']);
    Route::get('/classes/{id}/attendance', [ClassroomController::class, 'attendance']);
    Route::get('/classes/{id}/students', [ClassroomController::class, 'students']);
    Route::post('/classes/{id}/students', [ClassroomController::class, 'addStudents']);
    Route::delete('/classes/{id}/students', [ClassroomController::class, 'removeStudents']);
    Route::post('/classes', [ClassroomController::class, 'store']);
    Route::put('/classes/{id}', [ClassroomController::class, 'update']);
    Route::delete('/classes/{id}', [ClassroomController::class, 'destroy']);

    // Lookups
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/users', [UserController::class, 'index']);
});


