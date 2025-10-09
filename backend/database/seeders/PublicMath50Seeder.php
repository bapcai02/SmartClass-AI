<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PublicMath50Seeder extends Seeder
{
    public function run(): void
    {
        $payload = json_decode(<<<'JSON'
{
  "examTitle": "50 Câu hỏi Trắc nghiệm ôn thi THPT Môn Toán",
  "questions": %s
}
JSON
        , true);

        // Inline questions JSON (trimmed in heredoc to avoid PHP string escaping issues)
        $questionsJson = <<<'QJSON'
[ {"id":1,"topic":"Hàm số","question":"Cho hàm số $y = x^3 - 3x^2 + 2$. Mệnh đề nào dưới đây đúng?","options":{"A":"Hàm số nghịch biến trên khoảng (0; 2)","B":"Hàm số đồng biến trên khoảng (0; 2)","C":"Hàm số nghịch biến trên khoảng $(-\\infty; 0)$","D":"Hàm số đồng biến trên khoảng $(2; +\\infty)$"},"answer":"A"},{"id":2,"topic":"Mũ - Logarit","question":"Tập nghiệm của bất phương trình $\\log_2(x-1) > 3$ là:","options":{"A":"(9; +\\infty)","B":"(1; 9)","C":"(-\\infty; 9)","D":"[9; +\\infty)"},"answer":"A"},{"id":3,"topic":"Nguyên hàm - Tích phân","question":"Họ nguyên hàm của hàm số $f(x) = e^{2x} + x^2$ là:","options":{"A":"\\frac{1}{2}e^{2x} + \\frac{x^3}{3} + C","B":"2e^{2x} + 2x + C","C":"e^{2x} + x^3 + C","D":"\\frac{1}{2}e^{2x} + x^3 + C"},"answer":"A"},{"id":4,"topic":"Số phức","question":"Cho số phức $z = 3 - 4i$. Môđun của $z$ bằng:","options":{"A":"5","B":"7","C":"1","D":"25"},"answer":"A"},{"id":5,"topic":"Hình học không gian","question":"Cho hình chóp S.ABC có đáy là tam giác đều cạnh a, SA vuông góc với mặt phẳng đáy và $SA = a\\sqrt{3}$. Thể tích khối chóp S.ABC bằng:","options":{"A":"\\frac{a^3}{4}","B":"\\frac{a^3}{2}","C":"\\frac{3a^3}{4}","D":"\\frac{a^3\\sqrt{3}}{4}"},"answer":"A"},{"id":6,"topic":"Hình học Oxyz","question":"Trong không gian Oxyz, cho hai điểm A(1; 2; 3) và B(3; 0; 1). Tọa độ trung điểm I của đoạn thẳng AB là:","options":{"A":"I(2; 1; 2)","B":"I(4; 2; 4)","C":"I(2; -2; -2)","D":"I(1; 1; 1)"},"answer":"A"},{"id":7,"topic":"Tổ hợp - Xác suất","question":"Từ một nhóm có 10 học sinh, có bao nhiêu cách chọn ra 3 học sinh để tham gia một cuộc thi?","options":{"A":"120","B":"720","C":"30","D":"1000"},"answer":"A"},{"id":8,"topic":"Hàm số","question":"Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x-1}{x+1}$ là:","options":{"A":"x = -1","B":"y = -1","C":"x = 1","D":"y = 2"},"answer":"A"},{"id":9,"topic":"Mũ - Logarit","question":"Nghiệm của phương trình $2^{x+1} = 16$ là:","options":{"A":"x = 3","B":"x = 4","C":"x = 7","D":"x = 8"},"answer":"A"},{"id":10,"topic":"Nguyên hàm - Tích phân","question":"Giá trị của $\\int_{0}^{1} (3x^2 + 1) dx$ bằng:","options":{"A":"2","B":"3","C":"4","D":"1"},"answer":"A"},{"id":11,"topic":"Số phức","question":"Số phức liên hợp của $z = -1 + 2i$ là:","options":{"A":"$\\bar{z} = -1 - 2i$","B":"$\\bar{z} = 1 - 2i$","C":"$\\bar{z} = 1 + 2i$","D":"$\\bar{z} = -2 + i$"},"answer":"A"},{"id":12,"topic":"Hình học không gian","question":"Thể tích của khối lăng trụ có diện tích đáy B và chiều cao h là:","options":{"A":"$V = B \\cdot h$","B":"$V = \\frac{1}{3} B \\cdot h$","C":"$V = 3 B \\cdot h$","D":"$V = B + h$"},"answer":"A"},{"id":13,"topic":"Hình học Oxyz","question":"Trong không gian Oxyz, mặt phẳng (P) đi qua điểm M(1; 1; -1) và có vectơ pháp tuyến $\\vec{n} = (1; -2; 3)$ có phương trình là:","options":{"A":"$x - 2y + 3z + 4 = 0$","B":"$x - 2y + 3z - 4 = 0$","C":"$x + y - z + 4 = 0$","D":"$x + y - z - 3 = 0$"},"answer":"A"},{"id":14,"topic":"Cấp số cộng - Cấp số nhân","question":"Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 2$. Giá trị của $u_5$ bằng:","options":{"A":"11","B":"13","C":"9","D":"10"},"answer":"A"},{"id":15,"topic":"Hàm số","question":"Giá trị cực đại của hàm số $y = -x^3 + 3x + 4$ là:","options":{"A":"6","B":"2","C":"4","D":"1"},"answer":"A"},{"id":16,"topic":"Mũ - Logarit","question":"Rút gọn biểu thức $P = a^{\\sqrt{2}} \\cdot (\\frac{1}{a})^{\\sqrt{2}-1}$ với $a > 0$.","options":{"A":"$a$","B":"$a^2$","C":"$1$","D":"$a^{\\sqrt{2}}$"},"answer":"A"},{"id":17,"topic":"Nguyên hàm - Tích phân","question":"Diện tích hình phẳng giới hạn bởi đồ thị hàm số $y = x^2 - 4$, trục hoành và hai đường thẳng $x=0, x=2$ là:","options":{"A":"$\\frac{16}{3}$","B":"8","C":"$\\frac{8}{3}$","D":"16"},"answer":"A"},{"id":18,"topic":"Số phức","question":"Phần thực và phần ảo của số phức $z = (1+i)^2$ lần lượt là:","options":{"A":"0 và 2","B":"2 và 0","C":"1 và 1","D":"0 và -2"},"answer":"A"},{"id":19,"topic":"Hình học không gian","question":"Thể tích của khối nón có bán kính đáy r và chiều cao h là:","options":{"A":"$V = \\frac{1}{3}\\pi r^2 h$","B":"$V = \\pi r^2 h$","C":"$V = 2\\pi r h$","D":"$V = \\frac{4}{3}\\pi r^3$"},"answer":"A"},{"id":20,"topic":"Hình học Oxyz","question":"Trong không gian Oxyz, phương trình mặt cầu có tâm I(1; -2; 3) và bán kính R = 5 là:","options":{"A":"$(x-1)^2 + (y+2)^2 + (z-3)^2 = 25$","B":"$(x+1)^2 + (y-2)^2 + (z+3)^2 = 25$","C":"$(x-1)^2 + (y+2)^2 + (z-3)^2 = 5$","D":"$(x-1)^2 - (y+2)^2 - (z-3)^2 = 25$"},"answer":"A"}
]
QJSON;

        $payload['questions'] = json_decode($questionsJson, true);

        DB::transaction(function () use ($payload) {
            // Clear existing public exams (keep subjects/classes)
            // Order matters due to FKs
            DB::table('public_choices')->delete();
            DB::table('public_questions')->delete();
            if (Schema::hasTable('public_submissions')) {
                DB::table('public_submissions')->delete();
            }
            DB::table('public_exams')->delete();

            // Ensure subject and class exist
            $subjectId = DB::table('public_subjects')->updateOrInsert(['name' => 'Toán'], ['name' => 'Toán']);
            $subjectId = DB::table('public_subjects')->where('name', 'Toán')->value('id');
            $classId = DB::table('public_classes')->updateOrInsert(['name' => 'Lớp 12'], ['name' => 'Lớp 12']);
            $classId = DB::table('public_classes')->where('name', 'Lớp 12')->value('id');

            $examId = DB::table('public_exams')->insertGetId([
                'title' => $payload['examTitle'] ?? 'Đề Toán 50 câu',
                'description' => 'Đề trắc nghiệm 50 câu môn Toán (nhập thủ công).',
                'public_subject_id' => $subjectId,
                'public_class_id' => $classId,
                'duration_minutes' => 90,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($payload['questions'] as $q) {
                $content = trim((string)($q['question'] ?? ''));
                if (!empty($q['topic'])) {
                    $content = "[Chủ đề: {$q['topic']}]\n".$content;
                }
                $questionId = DB::table('public_questions')->insertGetId([
                    'public_exam_id' => $examId,
                    'content' => $content,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $answer = strtoupper((string)($q['answer'] ?? ''));
                $options = $q['options'] ?? [];
                foreach (['A','B','C','D'] as $label) {
                    if (!array_key_exists($label, $options)) continue;
                    DB::table('public_choices')->insert([
                        'public_question_id' => $questionId,
                        'label' => $label,
                        'content' => (string)$options[$label],
                        'is_correct' => $label === $answer,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }
}


