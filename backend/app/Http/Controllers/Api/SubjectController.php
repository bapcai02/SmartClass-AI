<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    private SubjectService $service;

    public function __construct(SubjectService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = trim((string) $request->get('search', ''));

        $subjects = $this->service->paginate($search, $perPage);

        return response()->json($subjects);
    }
}


