<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    private ReportService $service;

    public function __construct(ReportService $service)
    {
        $this->service = $service;
    }

    public function overallStats(): JsonResponse
    {
        return response()->json($this->service->getOverallStats());
    }

    public function classPerformance(): JsonResponse
    {
        return response()->json($this->service->getClassPerformanceStats());
    }

    public function studentPerformance(): JsonResponse
    {
        return response()->json($this->service->getStudentPerformanceStats());
    }

    public function attendanceStats(): JsonResponse
    {
        return response()->json($this->service->getAttendanceStats());
    }

    public function gradeDistribution(): JsonResponse
    {
        return response()->json($this->service->getGradeDistribution());
    }

    public function recentActivity(): JsonResponse
    {
        return response()->json($this->service->getRecentActivity());
    }

    public function monthlyStats(): JsonResponse
    {
        return response()->json($this->service->getMonthlyStats());
    }
}
