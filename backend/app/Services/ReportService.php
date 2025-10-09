<?php

namespace App\Services;

use App\Repositories\ReportRepository;

class ReportService
{
    private ReportRepository $repository;

    public function __construct(ReportRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getOverallStats(): array
    {
        return $this->repository->getOverallStats();
    }

    public function getClassPerformanceStats(): array
    {
        return $this->repository->getClassPerformanceStats();
    }

    public function getStudentPerformanceStats(): array
    {
        return $this->repository->getStudentPerformanceStats();
    }

    public function getAttendanceStats(): array
    {
        return $this->repository->getAttendanceStats();
    }

    public function getGradeDistribution(): array
    {
        return $this->repository->getGradeDistribution();
    }

    public function getRecentActivity(): array
    {
        return $this->repository->getRecentActivity();
    }

    public function getMonthlyStats(): array
    {
        return $this->repository->getMonthlyStats();
    }
}
