<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicReport;
use Illuminate\Http\Request;

class PublicReportController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'target_type' => 'required|in:question,exam',
            'target_id' => 'required|integer',
            'reason' => 'required|string|max:191',
            'details' => 'nullable|string',
            'contact' => 'nullable|string|max:191',
        ]);
        $report = PublicReport::create($data);
        return response()->json(['id' => $report->id]);
    }
}


