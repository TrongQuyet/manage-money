# manage-money

React frontend cho ứng dụng quản lý quỹ nhóm. Hỗ trợ nhiều tổ chức, tích hợp AI (Google Gemini).

## Lệnh thường dùng

```bash
npm install
npm run dev        # Dev server, port 3000
npm run build      # Build production → dist/
npm run preview    # Xem trước bản build
```

## Tech stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: Google Gemini SDK (`@google/genai`)
- **Styling**: Tailwind CSS

## Cấu trúc thư mục

```
├── components/
│   ├── Dashboard.tsx             # Tổng quan: biểu đồ, giao dịch gần đây
│   ├── TransactionManagement.tsx # CRUD giao dịch + tìm kiếm/lọc
│   ├── MemberManagement.tsx      # Danh sách thành viên, vai trò, thông tin
│   ├── Reports.tsx               # Báo cáo tài chính
│   ├── AIInsights.tsx            # Phân tích AI bằng Gemini
│   ├── Settings.tsx              # Quản lý danh mục
│   └── CreateOrg.tsx             # Form tạo tổ chức mới
├── services/
│   ├── apiService.ts             # HTTP client (fetch + auto token refresh)
│   └── geminiService.ts          # Tích hợp Google Gemini AI
├── App.tsx                       # Shell chính: auth, routing, state
├── index.tsx                     # Entry point với BrowserRouter
├── types.ts                      # TypeScript interfaces
└── constants.tsx                 # Điều hướng, danh mục fallback, API URL
```

## Environment variables

Tạo file `.env` ở root:

```env
VITE_API_URL=http://localhost:3334/api
GEMINI_API_KEY=your_gemini_api_key_here
```

Trong Docker (Nginx proxy), `VITE_API_URL` nên để là `/api`.

## Routing

| Route | Màn hình |
|-------|----------|
| `/` | Welcome / chọn tổ chức |
| `/create-org` | Tạo tổ chức mới |
| `/:orgSlug/dashboard` | Dashboard |
| `/:orgSlug/transactions` | Quản lý giao dịch |
| `/:orgSlug/members` | Quản lý thành viên |
| `/:orgSlug/reports` | Báo cáo |
| `/:orgSlug/ai` | AI Insights |
| `/:orgSlug/settings` | Cài đặt danh mục |

## Quản lý state

State tập trung trong `App.tsx` — không dùng Redux hay Context API:

```
AppState {
  members, transactions, categories  # Dữ liệu từ API
  balance                            # Tổng thu/chi/tồn
  isLoading, isSaving, lastSaved     # Trạng thái UI
}
```

Dữ liệu truyền xuống component con qua props; mutations qua callback (`onAddMember`, `onUpdateTransaction`, ...).

## API client (apiService.ts)

Tất cả request đều dùng `credentials: 'include'` để gửi cookie JWT.

Khi nhận 401 → tự động gọi `/auth/refresh` rồi retry request gốc.

Ví dụ pattern:
```typescript
// Tất cả hàm đều nhận orgSlug làm tham số đầu tiên
api.getMembers(orgSlug)
api.createTransaction(orgSlug, data)
api.updateMember(orgSlug, memberId, data)
```

## Luồng xác thực

1. `App.tsx` gọi `api.getMe()` khi load — nếu thành công thì đã đăng nhập
2. Modal đăng nhập hiển thị nếu chưa auth
3. Sau đăng nhập → gọi `api.getMyOrganizations()` lấy danh sách org
4. Token lưu trong httpOnly cookie (không truy cập được từ JS)
5. Tự động refresh token khi hết hạn (trong `apiService.ts`)

## Quyền truy cập

- **OWNER / ADMIN**: thấy nút thêm/sửa/xóa
- **MEMBER**: chỉ xem (read-only badge hiển thị trên giao diện)

Role lấy từ `api.getMe()` + `orgRole` trong response; component kiểm tra `isAdmin` prop.

## Thêm tổ chức / trang mới

1. Thêm route trong `App.tsx`
2. Tạo component trong `components/`
3. Thêm mục vào `NAV_ITEMS` trong `constants.tsx`
4. Thêm hàm API tương ứng trong `services/apiService.ts`

## Docker

```bash
# Dev (hot-reload, port 3000)
docker compose -f docker-compose.dev.yml up --build

# Production (Nginx, port 3333)
docker compose up --build -d
```

Production dùng Nginx để serve static files và proxy `/api` → backend.
