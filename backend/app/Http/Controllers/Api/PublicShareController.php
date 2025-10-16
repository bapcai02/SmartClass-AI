<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicShare;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PublicShareController extends Controller
{
    public function create(Request $request)
    {
        $data = $request->validate([
            'target_type' => 'required|in:exam,submission',
            'target_id' => 'required|integer',
            'expires_at' => 'nullable|date',
            'password' => 'nullable|string|min:4',
            'max_views' => 'nullable|integer|min:1',
        ]);

        $token = Str::random(40);
        $share = PublicShare::create([
            'token' => $token,
            'target_type' => $data['target_type'],
            'target_id' => (int) $data['target_id'],
            'expires_at' => $data['expires_at'] ?? null,
            'password_hash' => isset($data['password']) ? Hash::make($data['password']) : null,
            'max_views' => $data['max_views'] ?? null,
        ]);

        return response()->json(['token' => $share->token]);
    }

    public function resolve(Request $request, string $token)
    {
        $password = $request->input('password');
        $share = PublicShare::where('token', $token)->first();
        if (!$share) return response()->json(['message' => 'Not found'], 404);
        if ($share->expires_at && now()->greaterThan($share->expires_at)) {
            return response()->json(['message' => 'Expired'], 410);
        }
        if ($share->max_views !== null && $share->views >= $share->max_views) {
            return response()->json(['message' => 'View limit reached'], 429);
        }
        if ($share->password_hash && (!is_string($password) || !Hash::check($password, $share->password_hash))) {
            return response()->json(['message' => 'Password required or invalid'], 401);
        }
        $share->increment('views');
        return response()->json([
            'target_type' => $share->target_type,
            'target_id' => $share->target_id,
        ]);
    }
}


