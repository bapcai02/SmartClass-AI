<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    private UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    public function getSettings(): JsonResponse
    {
        $user = Auth::user();
        
        // Get user preferences (can be extended with a settings table)
        $settings = [
            'notifications' => [
                'email_notifications' => true,
                'assignment_reminders' => true,
                'exam_reminders' => true,
                'grade_updates' => true,
                'announcement_notifications' => true,
            ],
            'privacy' => [
                'profile_visibility' => 'public', // public, friends, private
                'show_email' => false,
                'show_activity' => true,
            ],
            'appearance' => [
                'theme' => 'light', // light, dark, auto
                'language' => 'en',
                'timezone' => 'UTC',
            ],
            'account' => [
                'two_factor_enabled' => false,
                'login_notifications' => true,
            ]
        ];

        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'notifications.email_notifications' => ['sometimes', 'boolean'],
            'notifications.assignment_reminders' => ['sometimes', 'boolean'],
            'notifications.exam_reminders' => ['sometimes', 'boolean'],
            'notifications.grade_updates' => ['sometimes', 'boolean'],
            'notifications.announcement_notifications' => ['sometimes', 'boolean'],
            'privacy.profile_visibility' => ['sometimes', 'string', Rule::in(['public', 'friends', 'private'])],
            'privacy.show_email' => ['sometimes', 'boolean'],
            'privacy.show_activity' => ['sometimes', 'boolean'],
            'appearance.theme' => ['sometimes', 'string', Rule::in(['light', 'dark', 'auto'])],
            'appearance.language' => ['sometimes', 'string', Rule::in(['en', 'vi', 'es', 'fr'])],
            'appearance.timezone' => ['sometimes', 'string'],
            'account.two_factor_enabled' => ['sometimes', 'boolean'],
            'account.login_notifications' => ['sometimes', 'boolean'],
        ]);

        // In a real application, you would save these to a settings table
        // For now, we'll just return the updated settings
        $settings = [
            'notifications' => [
                'email_notifications' => $data['notifications']['email_notifications'] ?? true,
                'assignment_reminders' => $data['notifications']['assignment_reminders'] ?? true,
                'exam_reminders' => $data['notifications']['exam_reminders'] ?? true,
                'grade_updates' => $data['notifications']['grade_updates'] ?? true,
                'announcement_notifications' => $data['notifications']['announcement_notifications'] ?? true,
            ],
            'privacy' => [
                'profile_visibility' => $data['privacy']['profile_visibility'] ?? 'public',
                'show_email' => $data['privacy']['show_email'] ?? false,
                'show_activity' => $data['privacy']['show_activity'] ?? true,
            ],
            'appearance' => [
                'theme' => $data['appearance']['theme'] ?? 'light',
                'language' => $data['appearance']['language'] ?? 'en',
                'timezone' => $data['appearance']['timezone'] ?? 'UTC',
            ],
            'account' => [
                'two_factor_enabled' => $data['account']['two_factor_enabled'] ?? false,
                'login_notifications' => $data['account']['login_notifications'] ?? true,
            ]
        ];

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
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

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $updatedUser
        ]);
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

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $data = $request->validate([
            'password' => ['required', 'string'],
            'confirmation' => ['required', 'string', 'in:DELETE'],
        ]);

        if (!Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Password is incorrect'], 400);
        }

        // In a real application, you would soft delete the user
        // and handle related data cleanup
        \App\Models\User::where('id', $user->id)->update(['deleted_at' => now()]);

        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function exportData(): JsonResponse
    {
        $user = Auth::user();
        
        // In a real application, you would generate a comprehensive data export
        $exportData = [
            'user_info' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
            'message' => 'Data export feature coming soon',
            'exported_at' => now(),
        ];

        return response()->json($exportData);
    }
}
