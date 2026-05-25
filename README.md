# AuraCards - MVP Hệ Thống Học Từ Vựng Flashcard & Spaced Repetition

AuraCards là một MVP website học từ vựng bằng Flashcard với kiến trúc tách biệt rõ ràng giữa **Frontend (fe)** và **Backend (be)**, tích hợp thuật toán ôn tập chu kỳ (Spaced Repetition SM-2) để tối ưu hóa khả năng ghi nhớ dài hạn.

## 🚀 Tính năng nổi bật
- 🗂 **Quản lý Flashcard**: Thêm, sửa, xóa, tìm kiếm từ vựng linh hoạt.
- 🧠 **Ôn tập Spaced Repetition**: Lọc danh sách thẻ đến hạn ôn tập, học qua mô hình lật thẻ 3D và tự đánh giá (Đúng/Sai) để tự động cập nhật lịch học.
- 🎯 **Làm Quiz Sinh Tự Động**: Sinh ngẫu nhiên câu hỏi trắc nghiệm (Multiple Choice), Đúng/Sai (True/False), tự luận điền từ (Short Answer).
- 📊 **Thống kê Tiến trình (Dashboard)**: Theo dõi số lượng thẻ, tỷ lệ thuộc lòng, độ chính xác, và biểu đồ học tập 7 ngày gần nhất.

---

## 🛠 Hướng dẫn chạy thử nghiệm cục bộ (Local Startup)

### 1. Khởi chạy Backend Server (be)
Mở một cửa sổ Terminal mới tại thư mục dự án và thực hiện các lệnh sau:
```bash
cd be
# Cài đặt các thư viện phụ thuộc
npm install

# Khởi tạo cơ sở dữ liệu SQLite & Đồng bộ schema
npx prisma db push

# Tạo dữ liệu mẫu (Seeding)
npx ts-node prisma/seed.ts

# Chạy server ở chế độ Development (mặc định tại http://localhost:5000)
npm run dev
```

### 2. Khởi chạy Frontend Web Client (fe)
Mở một cửa sổ Terminal thứ hai và thực hiện:
```bash
cd fe
# Cài đặt các thư viện phụ thuộc
npm install

# Chạy web client ở chế độ Development (mặc định tại http://localhost:3000)
npm run dev
```

---

## 🔑 Tài khoản Demo sẵn có
Bạn có thể sử dụng thông tin đăng nhập sau để chạy thử nghiệm các tính năng lập tức:
- **Email**: `demo@example.com`
- **Mật khẩu**: `password123`

---

## 📁 Cấu trúc thư mục dự án
```txt
project/
 ├── be/                 # Backend Node.js Express TS API
 │    ├── prisma/        # SQLite DB configuration & Seed script
 │    └── src/
 │         ├── database/
 │         ├── middleware/
 │         └── routes/   # Auth, Flashcards, Study/Quiz endpoints
 ├── fe/                 # Frontend Vite React TS Client
 │    ├── src/
 │    │    ├── components/
 │    │    ├── pages/    # Auth, Dashboard, Flashcards, Study, Quiz
 │    │    ├── App.tsx
 │    │    └── index.css # Premium glassmorphism & 3D flip card styles
 └── README.md
```
