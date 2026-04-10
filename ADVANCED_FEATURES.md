# Advanced Features - API Documentation

## 📚 Danh sách tất cả API mới

### 1. **Search API** - Tìm kiếm nâng cao

#### Tìm kiếm bài viết
```
GET /search?q=keyword&category=1&tag=2&sort=latest&page=1&limit=10
GET /api/search?q=keyword&category=1&tag=2&sort=latest&page=1&limit=10
```

**Parameters:**
- `q` (string): Từ khóa tìm kiếm
- `category` (number, optional): ID danh mục
- `tag` (number, optional): ID thẻ
- `sort` (string, optional): `latest`, `oldest`, `popular`, `trending` (mặc định: `latest`)
- `page` (number, optional): Trang (mặc định: 1)
- `limit` (number, optional): Số bài mỗi trang (mặc định: 10)

**Response:**
```json
{
  "posts": [...],
  "total": 15,
  "page": 1,
  "pages": 2
}
```

#### Lấy bài viết xu hướng
```
GET /search/trending?days=7
```

#### Thống kê tìm kiếm
```
GET /search/stats?q=keyword
```

---

### 2. **Analytics API** - Phân tích chi tiết

#### Dashboard overview
```
GET /analytics/dashboard
```

**Response:**
```json
{
  "totalPosts": 50,
  "totalComments": 200,
  "totalViews": 5000,
  "totalLikes": 150,
  "postsCreatedWeek": 3,
  "commentsWeek": 15
}
```

#### Analytics bài viết
```
GET /api/analytics/post/:postId
```

#### Báo cáo theo khoảng thời gian
```
GET /api/analytics/report?startDate=2026-04-01&endDate=2026-04-10
```

#### Analytics người dùng
```
GET /api/analytics/user/:userId
```

---

### 3. **SEO API**

#### Hướng dẫn SEO
```
GET /api/seo/guide/:postId
```

**Response:**
```json
{
  "readingTime": 5,
  "description": "...",
  "keywords": ["tag1", "tag2"],
  "seoScore": {
    "score": 85,
    "issues": []
  },
  "ogTags": {...}
}
```

#### Kiểm tra SEO
```
GET /api/seo/check/:postId
```

#### Tạo Sitemap
```
GET /api/seo/sitemap.xml
```

#### Thời gian đọc
```
GET /api/seo/reading-time/:postId
```

---

### 4. **Schedule API** - Lên lịch bài viết

#### Lên lịch bài viết
```
POST /api/schedule
Content-Type: application/json

{
  "postId": 1,
  "scheduledAt": "2026-04-15T10:00:00Z"
}
```

#### Lấy danh sách bài lên lịch
```
GET /api/schedule?limit=10
```

#### Cập nhật lịch
```
PUT /api/schedule/:scheduleId
Content-Type: application/json

{
  "scheduledAt": "2026-04-16T10:00:00Z"
}
```

#### Hủy lịch
```
DELETE /api/schedule/:scheduleId
```

#### Xuất bản bài viết lên lịch (chạy định kỳ)
```
POST /api/schedule/publish
```

---

### 5. **Related Posts API**

#### Bài viết liên quan
```
GET /api/related-posts/post/:postId?limit=5
```

#### Bài viết được đề xuất
```
GET /api/related-posts/recommended/:userId?limit=6
```

#### Bài viết xu hướng trong danh mục
```
GET /api/related-posts/trending/:categoryId?limit=5
```

---

### 6. **Comment Rating API**

#### Đánh giá bình luận
```
POST /api/comment-ratings/:commentId/rate
Content-Type: application/json
Authorization: Bearer <token>

{
  "rating": "helpful"  // "helpful" hoặc "unhelpful"
}
```

#### Lấy đánh giá bình luận
```
GET /api/comment-ratings/:commentId/ratings
```

**Response:**
```json
{
  "helpful": 15,
  "unhelpful": 2,
  "total": 17,
  "score": 88
}
```

#### Lấy bình luận được đánh giá cao
```
GET /api/comment-ratings/top-rated?limit=10
```

#### Xóa đánh giá
```
DELETE /api/comment-ratings/:commentId/rating
Authorization: Bearer <token>
```

---

### 7. **Activity Tracking API**

#### Ghi lại hoạt động
```
POST /api/activity/log
Content-Type: application/json
Authorization: Bearer <token>

{
  "activityType": "view_post",  // view_post, like_post, comment, create_post, login
  "postId": 1,
  "details": {...}
}
```

#### Lịch sử hoạt động
```
GET /api/activity/user/:userId/history?limit=20
```

#### Thống kê hoạt động
```
GET /api/activity/user/:userId/stats?days=30
```

**Response:**
```json
{
  "total": 50,
  "byType": {
    "view_post": 30,
    "like_post": 10,
    "comment": 8,
    "create_post": 2
  }
}
```

#### Hoạt động toàn nền tảng
```
GET /api/activity/platform?hours=24
```

---

### 8. **Newsletter API**

#### Đăng ký nhận tin
```
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Hủy đăng ký
```
GET /api/newsletter/unsubscribe?email=user@example.com
```

#### Gửi newsletter
```
POST /api/newsletter/send
Content-Type: application/json

{
  "subject": "Weekly Digest",
  "htmlContent": "<h1>Hello</h1><p>Weekly digest content</p>"
}
```

---

## 🎯 Ví dụ sử dụng thực tế

### 1. Tương tác blog cơ bản
```javascript
// Tìm kiếm bài viết
fetch('/api/search?q=javascript&sort=popular&limit=10')
  .then(r => r.json())
  .then(data => console.log(data.posts))

// Lấy bài viết liên quan
fetch('/api/related-posts/post/1?limit=5')
  .then(r => r.json())
  .then(data => console.log(data))

// Ghi lại hoạt động xem
fetch('/api/activity/log', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    activityType: 'view_post',
    postId: 1
  })
})
```

### 2. Quản lý bài viết
```javascript
// Lên lịch bài viết
fetch('/api/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postId: 1,
    scheduledAt: '2026-04-15T10:00:00Z'
  })
})

// Kiểm tra SEO
fetch('/api/seo/check/1')
  .then(r => r.json())
  .then(data => console.log(data))
```

### 3. Analytics
```javascript
// Dashboard
fetch('/analytics/dashboard')
  .then(r => r.json())
  .then(data => console.log(data.overview))

// Báo cáo
fetch('/api/analytics/report?startDate=2026-04-01&endDate=2026-04-10')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## ⚙️ Cấu hình môi trường

Thêm các biến vào `.env`:

```env
# Email configuration for newsletter
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
APP_URL=http://localhost:8080

# Scheduler (cron job)
SCHEDULE_CHECK_INTERVAL=60000  # Check every 60 seconds
```

---

## 📋 Danh sách tính năng

- ✅ Full-text search với filter theo category/tag
- ✅ Advanced analytics dashboard
- ✅ SEO optimization tools
- ✅ Reading time estimation
- ✅ Post scheduling
- ✅ Related posts recommendation
- ✅ Comment rating system
- ✅ Newsletter subscription
- ✅ User activity tracking
- ✅ Trending posts

---

## 🚀 Thiết lập ban đầu

1. Chạy migration:
```bash
npm run db:migrate
```

2. Cập nhật `.env` file

3. Khởi động server:
```bash
npm run dev
```

4. (Optional) Cấu hình cron job để xuất bản bài lên lịch:
```javascript
// Thêm vào app.js
const schedule = require('node-schedule');
const { publishScheduledPosts } = require('./src/services/scheduleService');

// Chạy mỗi phút
schedule.scheduleJob('* * * * *', async () => {
  try {
    const published = await publishScheduledPosts();
    if (published.length > 0) {
      console.log('Published:', published);
    }
  } catch (error) {
    console.error('Schedule error:', error);
  }
});
```

---

## 📖 Một số lưu ý

- Hầu hết endpoints cần authentication sử dụng JWT token
- Có thể config pagination qua `limit` và `page` parameters
- Email gửi yêu cầu cấu hình email service (Gmail, SendGrid, etc.)
- Schedule posts chạy định kỳ, cần cron job hoặc background worker
