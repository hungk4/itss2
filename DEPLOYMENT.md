# Hướng Dẫn Triển Khai Hệ Thống (Deployment Guide)

Tài liệu này hướng dẫn từng bước chi tiết để deploy toàn bộ ứng dụng **AuraCards** lên môi trường Production trên internet (gồm Backend trên **Render**, Frontend trên **Vercel** và cơ chế **Cronjob** giữ server thức 24/7).

---

## BƯỚC 1: ĐƯA MÃ NGUỒN LÊN GITHUB

Trước khi deploy, bạn cần đẩy toàn bộ mã nguồn của dự án lên GitHub của bạn:

1. **Khởi tạo Git** (nếu chưa có):
   ```bash
   git init
   git add .
   git commit -m "feat: complete MVP flashcard project"
   ```
2. **Tạo Repository mới trên GitHub** và liên kết repo local:
   ```bash
   git remote add origin <đường-dẫn-github-repo-của-bạn>
   git branch -M main
   git push -u origin main
   ```

---

## BƯỚC 2: TRIỂN KHAI BACKEND (Render + SQLite Persistent Disk)

Vì dự án dùng **SQLite**, nếu deploy lên gói Free thông thường của Render, dữ liệu sẽ bị reset (mất hết flashcard) mỗi khi server khởi động lại hoặc khi bạn cập nhật code. Chúng ta cần thiết lập một **ổ đĩa lưu trữ vĩnh viễn (Persistent Disk)**.

### 1. Đăng ký/Đăng nhập Render.com
Truy cập [Render.com](https://render.com/) và đăng nhập bằng tài khoản GitHub của bạn.

### 2. Tạo Web Service mới
- Chọn **New** -> **Web Service**.
- Chọn repository GitHub bạn vừa đẩy lên ở Bước 1.
- Điền các thông số cơ bản:
  - **Name**: `auracards-backend` (hoặc tên bất kỳ bạn chọn).
  - **Region**: Chọn vùng gần Việt Nam nhất (ví dụ: `Singapore` hoặc `Oregon`).
  - **Branch**: `main`
  - **Root Directory**: `be` (đường dẫn đến thư mục backend).
  - **Runtime**: `Node`
  - **Build Command**: 
    ```bash
    npm install && npx prisma generate && npm run build
    ```
  - **Start Command**: 
    ```bash
    npx prisma db push && node dist/index.js
    ```
  - **Instance Type**: Chọn gói **Free** (hoặc gói cao hơn tùy nhu cầu).

### 3. Cấu hình Ổ Đĩa Ảo (Persistent Disk) để giữ file SQLite
- Chuyển sang menu **Disks** (ở cột cấu hình bên trái của Web Service).
- Nhấp **Add Disk**:
  - **Name**: `sqlite_data`
  - **Mount Path**: `/var/data`
  - **Size**: `1 GB` (đủ lưu trữ hàng triệu từ vựng SQLite).

### 4. Cấu hình biến môi trường (Environment Variables)
- Chuyển sang menu **Environment** của Web Service.
- Nhấp **Add Environment Variable**:
  - Thêm khóa `DATABASE_URL` với giá trị: `file:/var/data/dev.db` (Bắt buộc trỏ vào đường dẫn Mount Path `/var/data` đã cấu hình ở bước trên để dữ liệu được lưu vĩnh viễn).
  - Thêm khóa `PORT` với giá trị: `5000`
  - Thêm khóa `NODE_ENV` với giá trị: `production`
- Nhấn **Save Changes**. Hệ thống sẽ tự động tiến hành Build và Deploy Backend. Sau khi deploy xong, bạn sẽ nhận được một đường link API, ví dụ: `https://auracards-backend.onrender.com`.

---

## BƯỚC 3: TRIỂN KHAI FRONTEND (Vercel)

Giao diện Frontend tĩnh được viết bằng React Vite sẽ được deploy lên Vercel để tối ưu hóa tốc độ tải trang.

### 1. Đăng ký/Đăng nhập Vercel
Truy cập [Vercel.com](https://vercel.com/) và kết nối với tài khoản GitHub của bạn.

### 2. Tạo dự án mới (Add New Project)
- Chọn **Import** repository chứa dự án của bạn.
- Cấu hình thông số dự án:
  - **Framework Preset**: Chọn `Vite` (Vercel tự động nhận diện).
  - **Root Directory**: Nhấp chọn và chỉnh thành `fe` (thư mục frontend).
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

### 3. Cài đặt biến môi trường cho Frontend kết nối đến Backend
- Tại mục **Environment Variables**, điền:
  - **Key**: `VITE_API_BASE_URL`
  - **Value**: Điền URL của Backend Render bạn vừa nhận được ở Bước 2 (ví dụ: `https://auracards-backend.onrender.com`).
- Nhấn **Add**.

### 4. Deploy
- Nhấp nút **Deploy**. Vercel sẽ tiến hành build code và cấp cho bạn một đường dẫn chạy ứng dụng miễn phí (ví dụ: `https://auracards-frontend.vercel.app`).

---

## BƯỚC 4: THIẾT LẬP CRONJOB GIỮ SỢI SERVER THỨC (KEEP-AWAKE)

Do Render Free Tier sẽ tự động đi vào trạng thái "ngủ" nếu không có lưu lượng truy cập sau 15 phút, lần truy cập tiếp theo sẽ phải đợi khởi động lại khoảng 30s - 1 phút. Để giữ ứng dụng hoạt động mượt mà 24/7, bạn cần cấu hình một cronjob gọi liên tục vào API healthcheck:

### Cài đặt qua UptimeRobot (Khuyên dùng)
1. Đăng ký tài khoản miễn phí tại [UptimeRobot.com](https://uptimerobot.com/).
2. Chọn **Add New Monitor**.
3. Cấu hình:
   - **Monitor Type**: Chọn `HTTP(s)`
   - **Friendly Name**: `AuraCards Keep-Alive`
   - **URL (or IP)**: Điền URL Backend Render + `/health`. Ví dụ:
     `https://auracards-backend.onrender.com/health`
   - **Monitoring Interval**: Đặt là `14 minutes` (vừa đủ trước khi Render đi ngủ ở mốc 15 phút).
4. Nhấn **Create Monitor**. 

UptimeRobot sẽ gửi request đến `/health` định kỳ mỗi 14 phút, giúp server Express của bạn luôn hoạt động tức thì bất kỳ lúc nào người dùng mở web học tập.
