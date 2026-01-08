README – LIVE CHAT + AI GEMINI (FIX FULL & ROADMAP)

1. Tổng quan hệ thống

Dự án triển khai Live Chat cho website bán hoa, hỗ trợ:

💬 Chat realtime giữa khách hàng và Admin

🤖 Chatbot AI Gemini hỗ trợ tư vấn tự động

👤 Admin có thể tiếp quản cuộc hội thoại

🛍️ Tư vấn sản phẩm kèm hình ảnh – giá – link

🔄 Chạy song song AI + nhân viên

📊 Lưu lịch sử hội thoại & thông tin khách hàng

2. Các vấn đề đã phát hiện (Audit Report)
   ❌ Vấn đề 1: Admin không nhận được tin nhắn từ User

Hiện tượng

User chat → Bot trả lời

Admin không thấy tin nhắn khi chuyển sang chế độ Nhân viên

Nguyên nhân gốc

WebSocket bị unsubscribe khi đổi mode BOT ⇄ STAFF

Admin không subscribe đúng topic session

❌ Vấn đề 2: Mất hội thoại khi chuyển BOT ⇄ NHÂN VIÊN

Hiện tượng

BOT thấy hội thoại

STAFF không thấy hội thoại

Nguyên nhân gốc

Hiểu sai kiến trúc: BOT và STAFF bị coi là 2 session khác nhau

FE gọi API không tồn tại:

GET /api/livechat/admin/sessions/{id} → 404

❌ Vấn đề 3: AI không lấy được dữ liệu thật (ảnh, giá, link)

Hiện tượng

AI trả lời chung chung

Không hiển thị product card

Nguyên nhân gốc

Gemini chạy LLM thuần (không có dữ liệu DB)

Không dùng RAG (Retrieval Augmented Generation)

Response chỉ là text, FE không có schema để render

3. Kiến trúc ĐÚNG sau khi fix
   🔑 Nguyên tắc cốt lõi

1 Session = 1 Hội thoại = 1 WebSocket Topic

BOT / STAFF / HYBRID chỉ là trạng thái

KHÔNG BAO GIỜ tạo session mới khi đổi mode

User ─┐
├─▶ /topic/chat/{sessionId} ◀─ Admin
Bot ──┘

4.  Cấu trúc Backend chuẩn (Clean Architecture)
    livechat
    ├── controller
    │ ├── ChatController
    │ └── AdminLiveChatController
    ├── service
    │ ├── ChatSessionService
    │ ├── ChatMessageService
    │ ├── ChatBotService
    │ └── GeminiService
    ├── repository
    │ ├── ChatSessionRepository
    │ └── ChatMessageRepository
    ├── dto
    │ ├── ChatMessageDTO
    │ ├── ChatSessionDTO
    │ └── BotResponseDTO
    └── websocket
    └── WebSocketConfig

5.  Chuẩn hóa Entity
    ChatSession
    @Entity
    public class ChatSession {
    @Id @GeneratedValue
    private Long id;

        private String sessionKey;
        private String guestId;
        private Long adminId;

        @Enumerated(EnumType.STRING)
        private ChatMode mode; // BOT, STAFF, HYBRID

    }

ChatMessage
@Entity
public class ChatMessage {
@Id @GeneratedValue
private Long id;

    private Long sessionId;
    private String sender; // USER, BOT, ADMIN

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

}

6. API BẮT BUỘC phải có (Fix 404)
   GET /api/livechat/admin/sessions
   GET /api/livechat/admin/sessions/{id}
   GET /api/livechat/admin/sessions/{id}/messages
   POST /api/livechat/admin/sessions/{id}/toggle-mode

❗ Nếu thiếu API trên → Admin không thể load hội thoại

7. WebSocket chuẩn (KHÔNG đổi theo mode)
   /topic/chat/{sessionId}

Subscribe 1 lần duy nhất

Không unsubscribe khi đổi BOT ⇄ STAFF

8. Tích hợp AI Gemini đúng cách (RAG)
   8.1. Luồng xử lý AI

User gửi tin nhắn

Backend phân tích intent (ví dụ: giá ≤ 200k)

Query DB sản phẩm phù hợp

Inject dữ liệu vào prompt

Gọi Gemini

Trả về response có cấu trúc

8.2. Prompt Gemini chuẩn
Bạn là trợ lý bán hoa cho shop FlowerCorner.

Chỉ được sử dụng danh sách sản phẩm sau:
{{PRODUCT_LIST}}

Không được bịa giá hoặc sản phẩm.

Hãy tư vấn ngắn gọn, thân thiện.

8.3. Response AI chuẩn (JSON)
{
"type": "PRODUCT_LIST",
"message": "Shop có các mẫu phù hợp:",
"items": [
{
"name": "Bó hoa hồng đỏ",
"price": 150000,
"image": "https://...",
"link": "/products/12"
}
]
}

9. Frontend – Quy tắc render

Nếu type = TEXT → render bubble

Nếu type = PRODUCT_LIST → render product card

BOT / ADMIN / USER có icon riêng

Không reload hội thoại khi đổi mode

10. Chống spam & loop AI

Không trả lời tin nhắn trùng trong 30s

AI không tự trả lời lại chính nó

Khi admin tiếp quản → AI dừng

11. Định hướng phát triển tiếp theo (Roadmap)
    Giai đoạn 1 (Hoàn thiện hiện tại)

✅ Ổn định live chat

✅ AI tư vấn sản phẩm

✅ Admin tiếp quản mượt

Giai đoạn 2

📂 Lưu hồ sơ khách hàng (tên, SĐT, địa chỉ)

📊 Dashboard thống kê chat

🔔 Thông báo admin realtime

Giai đoạn 3

🤖 Fine-tune prompt theo hành vi mua

🧠 Gợi ý upsell / cross-sell

🌐 Đa ngôn ngữ

12. PROMPT CHUẨN ĐỂ FIX / PHÁT TRIỂN (COPY DÙNG)
    Bạn là Senior Fullstack Engineer (Spring Boot + React + WebSocket).

Tôi có hệ thống live chat cho website bán hoa, đang gặp các vấn đề:

- Admin không nhận được tin nhắn user
- Mất hội thoại khi chuyển BOT ⇄ STAFF
- FE gọi API 404
- AI Gemini không lấy được dữ liệu DB
- Không hiển thị hình ảnh, giá, link sản phẩm

Yêu cầu:

1. Thiết kế lại kiến trúc live chat với 1 session duy nhất
2. BOT / STAFF chỉ là trạng thái, không tạo session mới
3. WebSocket dùng 1 topic / session
4. Bổ sung đầy đủ API admin sessions
5. Tích hợp Gemini theo mô hình RAG
6. Response AI có cấu trúc để render product card
7. Đảm bảo admin và user thấy cùng 1 hội thoại

Hãy đưa ra:

- Kiến trúc
- Code backend
- Cách fix frontend
- Best practices production

13. Kết luận

Sau khi áp dụng README này:

✅ Admin & User chat realtime ổn định
✅ AI Gemini tư vấn đúng dữ liệu shop
✅ Không mất hội thoại khi đổi mode
✅ Code sạch – dễ mở rộng – đúng chuẩn production
