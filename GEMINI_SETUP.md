# Gemini AI Setup Guide

## Cấu hình Gemini API

Để sử dụng AI Chat với Gemini, bạn cần cấu hình API key trong file `.env`:

### 1. Lấy API Key từ Google AI Studio
- Truy cập: https://makersuite.google.com/app/apikey
- Đăng nhập với Google account
- Tạo API key mới
- Copy API key

### 2. Cấu hình Environment Variables

**Cách 1: Sử dụng system environment variables**
```bash
export GEMINI_API_KEY=your-actual-api-key-here
export GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Cách 2: Tạo file .env trong thư mục root**
Tạo file `.env` trong `/home/hadv/Documents/SmartClass-AI/.env`:
```env
GEMINI_API_KEY=your-actual-api-key-here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### 3. Restart Docker containers
```bash
docker-compose down
docker-compose up -d
```

### 4. Kiểm tra cấu hình
```bash
docker-compose exec app php artisan tinker
>>> config('services.gemini.api_key')
```

## Tính năng AI Chat

### Database Schema
- `chat_sessions` - Lưu các phiên chat
- `chat_conversations` - Lưu từng tin nhắn và phản hồi

### API Endpoints
- `POST /api/ai/chat` - Gửi tin nhắn
- `GET /api/ai/sessions` - Lấy danh sách sessions
- `GET /api/ai/sessions/{id}` - Lấy chi tiết session
- `POST /api/ai/sessions` - Tạo session mới
- `DELETE /api/ai/sessions/{id}` - Xóa session
- `GET /api/ai/stats` - Thống kê chat
- `GET /api/ai/suggestions` - Gợi ý câu hỏi
- `GET /api/ai/context` - Context của user

### Frontend
- Truy cập: `http://localhost:5174/ai-chat`
- Chat history được lưu tự động
- Quản lý sessions
- Thống kê sử dụng
