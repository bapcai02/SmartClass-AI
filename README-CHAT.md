## SmartClass-AI Chat Realtime Logic

### Tổng quan luồng dữ liệu (Socket.io only)
- Frontend gửi tin nhắn qua Socket.io: emit `send_message` với `conversationId`, `content`.
- Gateway (Socket.io) xác thực token → publish vào Redis channel `chat:incoming`.
- Laravel consumer `chat:consume-redis` subscribe `chat:incoming` → validate & lưu DB → publish `chat:outgoing`.
- Gateway subscribe `chat:outgoing` và phát sự kiện `message` vào room `conversation:{id}` → FE nhận realtime và cập nhật UI.

Lý do chọn mô hình này: Laravel tập trung validate/ghi DB; Socket.io lo fan-out realtime; Redis làm backbone cho decouple/scale.

### Backend (Laravel)
- Endpoints chính (đã có):
  - `GET /api/chat/conversations` lấy danh sách hội thoại của user
  - `GET /api/chat/conversations/{id}` lấy thread + phân trang tin nhắn
  - `POST /api/chat/conversations/{id}/messages` gửi tin nhắn (validate + persist)
  - `POST /api/chat/direct` tạo/cuộn hội thoại trực tiếp 1-1
  - Nhóm chat: `POST /api/chat/groups`, thêm/xoá thành viên
- Redis Pub/Sub:
  - `chat:incoming`: gateway → Laravel (consumer ghi DB)
  - `chat:outgoing`: Laravel → gateway (fan-out tới room)
- CORS API: mở cho `/api` để FE gọi các API phụ trợ (profile, list conversation...).

### Frontend (React)
- HTTP client `src/utils/api.ts` gắn `Authorization: Bearer <token>` từ localStorage.
- Subscriptions: Socket.io
  - `src/utils/rt.ts` kết nối tới `VITE_RT_URL`.
  - `Chat.tsx` join room `conversation:{id}` và lắng nghe sự kiện `message`.
- Gửi tin nhắn: emit `send_message` → realtime cập nhật qua sự kiện `message`.
- UI: `Chat.tsx` load danh sách hội thoại, hiển thị thread, composer gửi tin, realtime cập nhật.

### Socket.io Gateway
- Mục tiêu: tầng realtime (rooms/sharding/backpressure), scale với Redis adapter.
- Service: `socket-rt/` (Node + TypeScript + Socket.io) → Docker service `socket-rt` cổng 8092.
- Auth: client truyền `auth.token` (Bearer). Gateway publish Redis, KHÔNG gọi HTTP trong luồng chính.
- Room: client emit `join_conversation` để join `conversation:{id}`; gateway phát `message` vào room khi nhận từ Redis `chat:outgoing`.
- Scale: dùng `@socket.io/redis-adapter` + Redis container sẵn.

### Biến môi trường quan trọng (FE)
Trong `front-end/.env` (đã có mẫu ở `front-end/env-example`):
```
VITE_API_BASE_URL=http://localhost:8081/api
VITE_RT_URL=http://localhost:8092
```

### Chạy hệ thống (Docker)
1) Khởi động stack:
```
docker compose up -d --build
```
2) Đảm bảo các service chạy: `app` (PHP-FPM + Supervisor + Redis consumer), `web` (Nginx), `db`, `redis`, `socket-rt` (Socket.io).
3) Frontend dev server (nếu dùng vite dev bên ngoài docker):
```
cd front-end && npm run dev
```

### Kiểm thử realtime
- Mở 2 trình duyệt, đăng nhập, vào trang Chat cùng một `conversation`.
- Gửi tin từ 1 bên:
  - Gateway publish Redis `chat:incoming` → Laravel consumer lưu DB → publish `chat:outgoing` → gateway phát `message` → bên kia nhận ngay.
- DevTools kiểm tra:
  - Network → WS: có kết nối Socket.io tới `127.0.0.1:8092`.

### Mở rộng nhanh
- Typing indicators: dùng Socket.io `typing` trong room `conversation:{id}` (không persist).
- Read receipts: thêm API/Redis event + DB flag, gateway phát sự kiện `read`.
- Scale: nhân bản `app` và `socket-rt`; Redis adapter đảm bảo phân tán sự kiện giữa các instance.


