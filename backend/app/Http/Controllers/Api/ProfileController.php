<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    private UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    public function show(): JsonResponse
    {
        $user = Auth::user();
        return response()->json($user);
    }

    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar_url' => ['nullable', 'string', 'url'],
        ]);

        $updatedUser = $this->service->update($user->id, $data);
        
        if (!$updatedUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($updatedUser);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $this->service->update($user->id, [
            'password' => Hash::make($data['new_password'])
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function stats(): JsonResponse
    {
        $user = Auth::user();
        $stats = $this->service->getUserStats($user->id);
        return response()->json($stats);
    }

    public function activity(): JsonResponse
    {
        $user = Auth::user();
        $limit = request()->integer('limit', 10) ?: 10;
        $activities = $this->service->getUserActivity($user->id, $limit);
        return response()->json($activities);
    }
}
