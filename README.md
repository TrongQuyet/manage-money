<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Manage Money — GroupFund Manager Pro
</div>

Ứng dụng quản lý quỹ nhóm thông minh, tích hợp AI (Google Gemini) để phân tích tài chính.

---

## Yêu cầu

- [Node.js](https://nodejs.org/) >= 18 (để chạy local)
- [Docker](https://www.docker.com/) + Docker Compose (để chạy bằng Docker)
- Gemini API Key — lấy tại [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc dự án:

```bash
cp .env.example .env
```

Mở `.env` và điền API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Cách 1: Chạy Local (không cần Docker)

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Truy cập: **http://localhost:3000**

---

## Cách 2: Docker — Development (hot reload)

Sửa code không cần build lại, thay đổi hiển thị ngay lập tức.

```bash
# Lần đầu (hoặc khi thêm package mới)
docker compose -f docker-compose.dev.yml up --build

# Các lần sau
docker compose -f docker-compose.dev.yml up
```

Truy cập: **http://localhost:3000**

Dừng:

```bash
docker compose -f docker-compose.dev.yml down
```

---

## Cách 3: Docker — Production

Build tối ưu, phục vụ bằng Nginx.

```bash
docker compose up --build -d
```

Truy cập: **http://localhost:3333**

Dừng:

```bash
docker compose down
```

---

## So sánh các cách chạy

| | Local | Docker Dev | Docker Production |
|---|:---:|:---:|:---:|
| Port | 3000 | 3000 | 3333 |
| Hot reload | Có | Có | Không |
| Build lại khi sửa | Không | Không | Cần `--build` |
| Yêu cầu Node.js | Có | Không | Không |

---

## Cấu trúc dự án

```
manage-money/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── TransactionManagement.tsx
│   ├── MemberManagement.tsx
│   ├── Reports.tsx
│   ├── AIInsights.tsx
│   └── Settings.tsx
├── services/
│   ├── geminiService.ts # Tích hợp Google Gemini AI
│   └── apiService.ts
├── App.tsx
├── types.ts
├── constants.tsx
├── Dockerfile           # Production build
├── Dockerfile.dev       # Development build
├── docker-compose.yml   # Production compose
├── docker-compose.dev.yml # Dev compose
└── .env.example         # Template biến môi trường
```
