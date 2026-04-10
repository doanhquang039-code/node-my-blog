# Advanced Blog Features - Implementation Guide

## 🎯 Tổng quan các tính năng mới

Đã thêm **10 tính năng nâng cao** vào hệ thống blog của bạn:

1. **Full-Text Search** - Tìm kiếm toàn văn bản với filters
2. **Advanced Analytics** - Dashboard phân tích chi tiết
3. **SEO Optimization** - Tools SEO tối ưu hóa
4. **Post Scheduling** - Lên lịch xuất bản bài viết
5. **Related Posts** - Đề xuất bài viết liên quan
6. **Comment Rating** - Hệ thống đánh giá bình luận
7. **Activity Tracking** - Ghi lại hoạt động người dùng
8. **Newsletter System** - Hệ thống gửi tin tức
9. **Reading Time Estimation** - Ước tính thời gian đọc
10. **Trending Posts** - Bài viết xu hướng

---

## 📁 Cấu trúc tệp mới

```
src/
├── models/
│   ├── newsletterModel.js         # Model đăng ký newsletter
│   ├── commentRatingModel.js       # Model đánh giá bình luận
│   ├── userActivityModel.js        # Model hoạt động người dùng
│   └── scheduledPostModel.js       # Model bài lên lịch
├── services/
│   ├── searchService.js            # Tìm kiếm
│   ├── emailService.js             # Gửi email
│   ├── seoService.js               # SEO optimization
│   ├── analyticsService.js         # Analytics
│   ├── relatedPostsService.js      # Bài liên quan
│   ├── scheduleService.js          # Lên lịch
│   ├── activityTrackingService.js  # Ghi hoạt động
│   ├── commentRatingService.js     # Đánh giá bình luận
│   └── enhancedPostService.js      # Post service nâng cao
├── controllers/
│   ├── searchController.js         # Tìm kiếm
│   ├── analyticsController.js      # Analytics
│   ├── seoController.js            # SEO
│   ├── scheduleController.js       # Lên lịch
│   ├── relatedPostsController.js   # Bài liên quan
│   ├── commentRatingController.js  # Đánh giá
│   ├── activityController.js       # Hoạt động
│   └── newsletterController.js     # Newsletter
├── routes/
│   ├── searchRoutes.js
│   ├── analyticsRoutes.js
│   ├── seoRoutes.js
│   ├── scheduleRoutes.js
│   ├── relatedPostsRoutes.js
│   ├── commentRatingRoutes.js
│   ├── activityRoutes.js
│   └── newsletterRoutes.js
├── middlewares/
│   └── activityMiddleware.js       # Middleware ghi hoạt động
└── utils/
    ├── scheduler.js                # Scheduler xuất bản
    └── apiResponse.js              # Standardized responses
```

---

## 🔧 Cài đặt và Cấu hình

### 1. **Cập nhật Dependencies**

Cần thêm một số packages (nếu chưa có):

```bash
npm install node-schedule     # For scheduled posts
npm install nodemailer        # For email
```

### 2. **Cấu hình Environment**

Cập nhật `.env` file:

```env
# Database
DB_NAME=node_blog_db
DB_USER=root
DB_PASS=123456
DB_HOST=localhost

# Server
PORT=8080
APP_URL=http://localhost:8080

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT
JWT_SECRET=your-secret-key

# Schedule
SCHEDULE_CHECK_INTERVAL=60000
```

### 3. **Chạy Database Migrations**

```bash
npm run db:migrate
```

Điều này sẽ tạo ra 4 bảng mới:
- `newsletters` - lưu người đăng ký
- `comment_ratings` - lưu đánh giá bình luận
- `user_activities` - lưu hoạt động
- `scheduled_posts` - lưu bài lên lịch

### 4. **Khởi động Server**

```bash
npm run dev
```

---

## 📚 Hướng dẫn sử dụng từng tính năng

### 1. 🔍 **Full-Text Search**

```javascript
// Frontend
fetch('/api/search?q=javascript&sort=popular&limit=10')
  .then(r => r.json())
  .then(data => console.log(data.posts))

// Search với filter
fetch('/api/search?q=blog&category=1&sort=trending')
  .then(r => r.json())
  .then(data => console.log(data))
```

**Sort options:** `latest`, `oldest`, `popular`, `trending`

---

### 2. 📊 **Advanced Analytics**

```javascript
// Lấy dashboard overview
fetch('/analytics/dashboard')
  .then(r => r.json())
  .then(data => {
    console.log('Tổng bài viết:', data.overview.totalPosts)
    console.log('Tổng lượt xem:', data.overview.totalViews)
    console.log('Dữ liệu theo tháng:', data.monthlyData)
  })

// Analytics bài viết
fetch('/api/analytics/post/1')
  .then(r => r.json())
  .then(data => {
    console.log('Lượt xem:', data.view_count)
    console.log('Lượt like:', data.like_count)
  })
```

---

### 3. 📝 **SEO Optimization**

```javascript
// Kiểm tra SEO của bài
fetch('/api/seo/check/1')
  .then(r => r.json())
  .then(data => {
    console.log('SEO score:', data.score)  // 0-100
    console.log('Issues:', data.issues)    // Danh sách cần cải thiện
  })

// Lấy thời gian đọc
fetch('/api/seo/reading-time/1')
  .then(r => r.json())
  .then(data => console.log('Thời gian đọc:', data.readingTime + ' phút'))

// Tạo Sitemap
// Truy cập: /api/seo/sitemap.xml
```

**SEO Checker:**
- ✅ Độ dài tiêu đề (30-60 ký tự)
- ✅ Mô tả (120-160 ký tự)
- ✅ Nội dung tối thiểu (300 từ)
- ✅ Hình ảnh đặc trưng
- ✅ Ít nhất 3 tags

---

### 4. ⏰ **Post Scheduling**

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

// Lấy danh sách bài lên lịch
fetch('/api/schedule')
  .then(r => r.json())
  .then(data => console.log(data))

// Cập nhật thời gian
fetch('/api/schedule/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scheduledAt: '2026-04-16T15:00:00Z'
  })
})
```

---

### 5. 🔗 **Related Posts**

```javascript
// Lấy bài liên quan
fetch('/api/related-posts/post/1?limit=5')
  .then(r => r.json())
  .then(data => console.log('Bài liên quan:', data))

// Bài được đề xuất cho user
fetch('/api/related-posts/recommended/1?limit=6')
  .then(r => r.json())
  .then(data => console.log('Đề xuất:', data))

// Bài xu hướng trong danh mục
fetch('/api/related-posts/trending/1?limit=5')
  .then(r => r.json())
  .then(data => console.log('Xu hướng:', data))
```

---

### 6. 👍 **Comment Rating**

```javascript
// Đánh giá bình luận (cần login)
fetch('/api/comment-ratings/1/rate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    rating: 'helpful'  // hoặc 'unhelpful'
  })
})

// Lấy thống kê đánh giá
fetch('/api/comment-ratings/1/ratings')
  .then(r => r.json())
  .then(data => {
    console.log('Hữu ích:', data.helpful)
    console.log('Không hữu ích:', data.unhelpful)
    console.log('Score:', data.score + '%')
  })

// Top bình luận được đánh giá cao
fetch('/api/comment-ratings/top-rated?limit=10')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

### 7. 📱 **Activity Tracking**

```javascript
// Ghi lại hoạt động (cần login)
fetch('/api/activity/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    activityType: 'view_post',
    postId: 1,
    details: { source: 'search' }
  })
})

// Loại hoạt động: view_post, like_post, comment, create_post, login

// Lịch sử hoạt động
fetch('/api/activity/user/1/history?limit=20')
  .then(r => r.json())
  .then(data => console.log(data))

// Thống kê hoạt động
fetch('/api/activity/user/1/stats?days=30')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

### 8. 📮 **Newsletter**

```javascript
// Đăng ký
fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})

// Hủy đăng ký
fetch('/api/newsletter/unsubscribe?email=user@example.com')

// Gửi newsletter (admin)
fetch('/api/newsletter/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    subject: 'Weekly Digest',
    htmlContent: '<h1>Hello</h1><p>Weekly digest content</p>'
  })
})
```

---

## 🤖 Tự động xuất bản bài lên lịch

Thêm vào `app.js` sau khi tạo server:

```javascript
const { startScheduler } = require("./src/utils/scheduler");

// Khác động scheduler sau khi server khởi động
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
  
  // Bắt đầu scheduler để xuất bản bài lên lịch
  startScheduler(process.env.SCHEDULE_CHECK_INTERVAL || 60000);
});
```

---

## 🧪 Testing API

### Sử dụng Postman hoặc cURL

```bash
# Search
curl "http://localhost:8080/api/search?q=javascript&sort=popular"

# Analytics
curl "http://localhost:8080/api/analytics/dashboard"

# SEO Check
curl "http://localhost:8080/api/seo/check/1"

# Related Posts
curl "http://localhost:8080/api/related-posts/post/1"

# Newsletter Subscribe
curl -X POST "http://localhost:8080/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

## 🔒 Security Notes

- ✅ Authentication: Hầu hết endpoints cần JWT token
- ✅ Authorization: Kiểm tra role user (admin, manager, etc.)
- ✅ Input Validation: Sanitize tất cả user input
- ✅ Rate Limiting: Cần thêm để chống brute force
- ✅ HTTPS: Sử dụng trong production

---

## 📈 Performance Tips

1. **Thêm Caching** (Redis)
```javascript
// Thêm redis package
npm install redis
```

2. **Thêm Pagination** - Tất cả list endpoints đều support

3. **Thêm Indexing** - Tối ưu SQL queries

4. **CDN** - Cho media files

---

## 🐛 Troubleshooting

### Email không gửi được
- Kiểm tra `.env` EMAIL_USER và EMAIL_PASS
- Với Gmail, cần bật "Less secure app access" hoặc dùng App Password
- Sử dụng provider khác nếu cần (SendGrid, AWS SES, etc.)

### Scheduler không chạy
- Kiểm tra SCHEDULE_CHECK_INTERVAL trong `.env`
- Đảm bảo `startScheduler()` được gọi trong app.js

### Database migration failed
```bash
# Undo migrations
npm run db:undo

# Run lại
npm run db:migrate
```

---

## 📞 Support

- Tham khảo [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) cho API docs đầy đủ
- Kiểm tra [Sequelize docs](https://sequelize.org/) cho query help
- Node.js [Official docs](https://nodejs.org/docs/)

---

## 📝 Next Steps

1. ✅ Database migrations
2. ✅ Environment setup
3. ✅ Start server
4. ✅ Test APIs
5. ✅ Thêm authentication middleware cho endpoints cần thiết
6. ⭐ Thêm error handling chi tiết
7. ⭐ Thêm input validation
8. ⭐ Thêm unit tests
9. ⭐ Deploy to production

---

**Chúc bạn thành công! 🚀**
