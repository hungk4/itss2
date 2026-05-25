# AuraCards - Hệ Thống Học Từ Vựng Tiếng Nhật Qua Flashcard (Developer Documentation)

Tài liệu này cung cấp mô tả kỹ thuật chi tiết của hệ thống học từ vựng AuraCards dành cho nhà phát triển (developer onboarding/spec). Tài liệu tập trung làm rõ kiến trúc, phạm vi sản phẩm (MVP), luồng dữ liệu (data flow) và cách hoạt động của từng tính năng chính nhằm hỗ trợ tiếp tục phát triển dự án một cách nhanh chóng.

---

## 1. Tổng Quan Dự Án (Project Overview)

AuraCards là nền tảng học từ vựng tiếng Nhật trực tuyến, thiết kế chuyên biệt cho đối tượng người Việt học tiếng Nhật (giao diện hoàn toàn bằng tiếng Việt, nội dung học liệu bằng tiếng Nhật kèm dịch nghĩa/giải thích tiếng Việt). 

Hệ thống giải quyết bài toán tối ưu hóa ghi nhớ từ vựng (chữ Kanji, Hiragana/Katagana và ý nghĩa ngữ cảnh) thông qua sự kết hợp giữa:
- **Phương pháp học Flashcard trực quan** (Lật thẻ 3D).
- **Thuật toán ôn tập giãn cách (Spaced Repetition)** dựa trên phản hồi chủ động của người dùng.
- **Hệ thống đánh giá định kỳ qua Quiz** tự động sinh từ kho thẻ học cá nhân.

---

## 2. Mục Tiêu MVP (MVP Scope)

Dự án hiện tại được phát triển dưới dạng **MVP tối giản phục vụ cho một người dùng duy nhất (Single-user MVP)**:
- **Phạm vi hiện tại**: 
  - Lưu trữ, quản lý và phân tích thư viện từ vựng tiếng Nhật cá nhân.
  - Tích hợp vòng lặp học liệu hoàn chỉnh: **Nhập từ vựng -> Học/Lật thẻ -> Ôn tập chu kỳ -> Kiểm tra (Quiz) -> Xem thống kê (Dashboard)**.
  - Lưu trữ dữ liệu cục bộ ổn định.
- **Những gì KHÔNG tập trung**:
  - Không có hệ thống xác thực (Login/Register/Auth). Tất cả thao tác truy vấn và ghi dữ liệu được thực hiện trực tiếp lên cơ sở dữ liệu chung duy nhất.
  - Không có phân quyền người dùng phức tạp hoặc đồng bộ đám mây (Cloud Sync) nhiều tài khoản.

---

## 3. Kiến Trúc Hệ Thống (System Architecture)

Dự án sử dụng mô hình Client-Server tách biệt hoàn chỉnh giữa Frontend và Backend.

```mermaid
graph TD
    subgraph Frontend Client (React)
        UI[Giao diện Tiếng Việt / Light Mode] --> Axios[Axios API Client]
    end
    
    subgraph Backend Server (Express Node.js)
        Axios --> Router[Express Router]
        Router --> Controller[API Controllers]
        Controller --> Prisma[Prisma ORM Client]
    end

    subgraph Database Layer
        Prisma --> SQLite[(SQLite database: dev.db)]
    end
```

### Chi tiết các tầng công nghệ:
- **Frontend (`fe/`)**:
  - **Framework/Tooling**: React 18, Vite, TypeScript.
  - **Styling**: Vanilla CSS thiết kế tối giản (Minimal), giao diện sáng (Light mode) tích hợp hiệu ứng chuyển động 3D cho flashcard.
  - **State & API**: Axios kết nối trực tiếp với backend qua cổng mặc định `http://localhost:5000`.
- **Backend (`be/`)**:
  - **Platform**: Node.js, Express, TypeScript.
  - **ORM**: Prisma Client.
- **Database**:
  - **Database engine**: SQLite (`dev.db`), gọn nhẹ, không yêu cầu cài đặt server database độc lập, lý tưởng cho môi trường chạy đơn lẻ (local/single-user).

---

## 4. Các Tính Năng Chính (Core Features)

### 4.1. Flashcard Learning (Học liệu thẻ lật)
- **Quản lý kho thẻ**: Thêm mới, chỉnh sửa, xóa và tìm kiếm nhanh các flashcard.
- **Cấu trúc thông tin thẻ**: Mỗi từ vựng lưu trữ đầy đủ các trường:
  - *Vocabulary*: Chữ Kanji chính của từ.
  - *Reading*: Cách đọc Kana (Hiragana/Katakana).
  - *Meaning*: Nghĩa tiếng Việt.
  - *Example Sentence & Example Translation*: Câu ví dụ tiếng Nhật và bản dịch nghĩa tiếng Việt tương ứng.
  - *JLPT Level*: Cấp độ tương ứng (N5 - N1).
- **Luồng học**: Giao diện hiển thị thẻ dạng 3D giúp lật qua lại giữa mặt trước (Từ vựng/Kana) và mặt sau (Nghĩa/Ví dụ/Giải thích).

### 4.2. Spaced Repetition (Ôn tập giãn cách)
- Hệ thống áp dụng thuật toán mô phỏng từ nguyên lý **SuperMemo-2 (SM-2)** để lập lịch ôn tập tiếp theo dựa trên phản hồi của người học.
- **Các chỉ số cốt lõi lưu trên mỗi thẻ**:
  - `reviewCount`: Tổng số lần thẻ đã được đưa ra ôn tập.
  - `correctCount` / `wrongCount`: Số lần người dùng tự đánh giá là đã nhớ/chưa nhớ từ này.
  - `masteryLevel`: Mức độ thành thạo của từ vựng (từ 0 đến 5).
  - `nextReviewAt`: Mốc thời gian tiếp theo mà thẻ sẽ xuất hiện trong danh sách ôn tập.
- **Luồng tính toán**: Sau mỗi lượt lật thẻ ôn tập, người học chọn đánh giá mức độ nhớ thẻ:
  - Nếu **Chưa nhớ (Sai)**: `masteryLevel` reset hoặc giảm dần, lịch ôn tiếp theo đặt ngay lập tức (hoặc trong ngày).
  - Nếu **Đã nhớ (Đúng)**: `masteryLevel` tăng dần, khoảng cách ôn tập tiếp theo (`nextReviewAt`) tự động giãn cách xa hơn theo lũy thừa.

### 4.3. Quiz Generation (Sinh bài kiểm tra tự động)
- **Tạo Quiz**: Hệ thống tự động quét và lựa chọn ngẫu nhiên các từ vựng trong cơ sở dữ liệu để tạo bài trắc nghiệm nhanh gồm 3 dạng câu hỏi chính:
  1. Trắc nghiệm 4 đáp án (Multiple choice).
  2. Câu hỏi Đúng / Sai (True / False).
  3. Điền từ vào ô trống (Short answer).
- **Flexible Answer Matching (Chấm điểm tiếng Việt linh hoạt)**:
  Đối với dạng câu hỏi Tự luận ngắn (Short answer) điền nghĩa tiếng Việt, hệ thống không so khớp chuỗi tuyệt đối mà áp dụng thuật toán chuẩn hóa:
  - Tách nghĩa của thẻ bằng các ký tự phân tách phổ biến (`/`, `,`, `;`, dòng mới `\n`).
  - Chuẩn hóa đầu vào của người dùng (chuyển chữ thường, cắt khoảng trắng dư thừa, lọc bỏ các ký hiệu dấu câu đặc biệt như `. , ! ?`).
  - Chấp nhận đúng nếu từ nhập vào khớp chính xác hoặc là một phần nghĩa hợp lệ (độ dài ký tự từ khóa nhập vào tối thiểu $\ge 2$ để tránh khớp sai các ký tự đơn lẻ).

### 4.4. Learning History + Dashboard (Thống kê tiến trình)
- **Lịch sử học tập**: Mỗi khi người học nhấn lưu kết quả phiên ôn tập hoặc nộp bài Quiz, một bản ghi chi tiết sẽ được đẩy vào bảng `LearningHistory` ghi nhận ID flashcard, mức độ nhớ, điểm số đạt được và thời gian thực hiện.
- **Thống kê Dashboard**: 
  - Phân tích tổng số lượng từ vựng hiện có trong thư viện.
  - Đếm tổng số từ đã học thuộc (`masteryLevel` cao) so với số từ cần ôn tập ngay (`nextReviewAt` đã quá hạn hoặc sắp tới hạn).
  - Thống kê phân phối tỷ lệ từ vựng theo các cấp độ thi năng lực Nhật ngữ (N5, N4, N3, N2, N1).
  - Hiển thị biểu đồ lịch sử tương tác ôn tập trong vòng 7 ngày gần nhất để duy trì thói quen học tập.

---

## 5. Cơ Sở Dữ Liệu và Data Model

Lược đồ cơ sở dữ liệu được định nghĩa gọn nhẹ thông qua Prisma Client tại [schema.prisma](file:///d:/Bach%20Khoa/Nam%204%20Ki%202/ITSS%202/Project/be/prisma/schema.prisma):

```prisma
model Flashcard {
  id                 String            @id @default(uuid())
  vocabulary         String            // Chữ Kanji gốc
  reading            String?           // Cách đọc Kana (Hiragana/Katakana)
  meaning            String            // Ý nghĩa tiếng Việt (Synonyms ngăn cách bởi dấu phẩy, dấu chấm phẩy)
  exampleSentence    String?           // Câu ví dụ tiếng Nhật
  exampleTranslation String?           // Dịch nghĩa câu ví dụ
  partOfSpeech       String?           // Loại từ (Danh từ, Động từ, Tính từ...)
  jlptLevel          String?           // Cấp độ JLPT (N5 - N1)
  
  // Thuộc tính phục vụ thuật toán Spaced Repetition
  nextReviewAt       DateTime          @default(now())
  reviewCount        Int               @default(0)
  correctCount       Int               @default(0)
  wrongCount         Int               @default(0)
  masteryLevel       Int               @default(0) // Mức độ ghi nhớ (0 - 5)
  
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  history            LearningHistory[]
}

model LearningHistory {
  id          String   @id @default(uuid())
  flashcardId String
  memoryLevel Int
  score       Int
  reviewTime  DateTime @default(now())
  createdAt   DateTime @default(now())

  flashcard   Flashcard @relation(fields: [flashcardId], references: [id], onDelete: Cascade)

  @@index([flashcardId])
}
```

---

## 6. Ghi Chú Kỹ Thuật (Technical Notes)

- **Single-User Architecture**: Không cần truyền Token hay đính kèm Header `Authorization` trong các yêu cầu API từ client gửi lên backend. Mọi thao tác đều mặc định ghi xuống database dùng chung.
- **UI & Content Separation**: Giao diện hiển thị, nhãn, nút nhấn, menu hướng dẫn được duy trì hoàn toàn bằng tiếng Việt để tăng tính thân thiện, trực quan. Nội dung học thuật bao gồm từ vựng chữ Kanji/Kana tiếng Nhật kết hợp với giải thích nghĩa và dịch thuật câu ví dụ bằng tiếng Việt.
- **Khởi tạo dữ liệu mẫu (Seeding)**: Có sẵn file seed dữ liệu [seed.ts](file:///d:/Bach%20Khoa/Nam%204%20Ki%202/ITSS%202/Project/be/prisma/seed.ts) chứa các từ vựng tiếng Nhật mẫu thông dụng thuộc các cấp độ JLPT khác nhau kèm cấu trúc ví dụ hoàn chỉnh để chạy thử nghiệm dự án ngay sau khi cài đặt.

---

## 7. Định Hướng Phát Triển Tương Lai (Future Extensions)

Khi có nhu cầu nâng cấp sản phẩm từ phiên bản MVP lên phiên bản thương mại hóa hoặc phát hành rộng rãi:
1. **Furigana / Ruby Characters**: Hỗ trợ hiển thị chữ Kana nhỏ phía trên chữ Kanji trực tiếp ở giao diện Frontend để người dùng dễ tra cứu cách đọc câu ví dụ.
2. **Audio Pronunciation**: Tích hợp các bộ thư viện Text-to-Speech (TTS) hoặc API phát âm âm thanh bản xứ của từ vựng tiếng Nhật.
3. **AI Quiz Generation**: Ứng dụng mô hình ngôn ngữ lớn (LLM) để sinh câu ví dụ ngẫu nhiên thực tế hoặc sinh câu hỏi trắc nghiệm thông minh dựa trên ngữ cảnh thực tế của từ vựng.
4. **Hệ Thống Đa Người Dùng (Multi-User & Cloud Sync)**: Bổ sung thực thể bảng `User`, triển khai cơ chế xác thực JWT, định vị liên kết các mối quan hệ một-nhiều từ `User` đến `Flashcard` và `LearningHistory` để triển khai mô hình đa tài khoản đồng bộ đám mây.
