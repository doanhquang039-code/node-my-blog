# 🚀 CHẠY NGAY MY-BLOG-NODE

## ✅ ĐÃ HOÀN THÀNH

```
✅ WebSocket Server - Real-time communication
✅ Notification System - Full CRUD + WebSocket push
✅ Theme System - Presets + Custom themes
✅ Routes, Controllers, Services đã tạo
✅ app.js đã cập nhật
```

---

## 📋 BƯỚC 1: CẤU HÌNH .ENV

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Hoặc tạo thủ công với nội dung:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_blog_db

# Server
PORT=8080
NODE_ENV=development

# JWT
JWT_SECRET=my_super_secret_jwt_key_2026

# WebSocket
WS_PORT=8081
WS_PATH=/ws

# Web Push (Optional - generate later)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:your@email.com

# Media Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,application/pdf

# Search
SEARCH_RESULTS_LIMIT=20
SEARCH_HISTORY_LIMIT=50

# Draft Auto-save
DRAFT_AUTOSAVE_INTERVAL=30000

# Language
DEFAULT_LANGUAGE=vi
FALLBACK_LANGUAGE=en
```

---

## 📊 BƯỚC 2: TẠO DATABASE

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE my_blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Thoát
exit
```

---

## 🔄 BƯỚC 3: CHẠY MIGRATIONS

```bash
# Chạy migration script
node run-phase2-migration.js
```

Hoặc import SQL thủ công:

```bash
mysql -u root -p my_blog_db < src/migrations/20260427_advanced_features_phase2.sql
```

---

## ▶️ BƯỚC 4: CHẠY SERVER

```bash
npm start
```

Hoặc với nodemon (auto-reload):

```bash
npm run dev
```

Bạn sẽ thấy:

```
✅ Server đang chạy tại: http://localhost:8080
✅ WebSocket available at ws://localhost:8080/ws
✅ WebSocket server initialized on /ws

🎨 UI Pages available:
   - Notifications: http://localhost:8080/notifications
   - Themes: http://localhost:8080/themes
   - Messaging: http://localhost:8080/messaging
   - Achievements: http://localhost:8080/achievements
   - Dashboard: http://localhost:8080/dashboard
   - Media Gallery: http://localhost:8080/media-gallery
   - Search: http://localhost:8080/search-advanced
   - Drafts: http://localhost:8080/drafts
   - Settings: http://localhost:8080/settings

📡 API Endpoints:
   - Notifications: http://localhost:8080/api/notifications
   - Themes: http://localhost:8080/api/themes
```

---

## 🧪 BƯỚC 5: TEST FEATURES

### Test Notification API:

```bash
# Get notifications (requires JWT token)
curl http://localhost:8080/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get unread count
curl http://localhost:8080/api/notifications/unread/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Theme API:

```bash
# Get theme presets
curl http://localhost:8080/api/themes/presets

# Get user theme (requires JWT token)
curl http://localhost:8080/api/themes/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test WebSocket:

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8080/ws

# Authenticate (replace with your JWT token)
{"type":"auth","token":"YOUR_JWT_TOKEN"}

# Send ping
{"type":"ping"}

# You should receive pong response
```

---

## 🎯 TÍNH NĂNG MỚI ĐÃ THÊM

### 1. **WebSocket Server** ✅
- Real-time bidirectional communication
- JWT authentication
- Ping/pong heartbeat
- Private messaging
- Broadcast messages
- Notification push

**File:** `src/utils/websocketServer.js`

### 2. **Notification System** ✅
- Create notifications
- Get user notifications (paginated)
- Unread count
- Mark as read / Mark all as read
- Delete notifications
- Notification settings (email, push, etc.)
- Real-time push via WebSocket

**Files:**
- `src/routes/notificationRoutes.js`
- `src/controllers/notificationController.js`
- `src/services/notificationService.js`

**API Endpoints:**
```
GET    /api/notifications              - Get user notifications
GET    /api/notifications/unread/count - Get unread count
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
GET    /api/notifications/settings     - Get settings
PUT    /api/notifications/settings     - Update settings
```

### 3. **Theme System** ✅
- Theme presets (Light, Dark, Blue, etc.)
- Custom themes
- User theme preferences
- Colors, fonts, custom CSS

**Files:**
- `src/routes/themeRoutes.js`
- `src/controllers/themeController.js`
- `src/services/themeService.js`

**API Endpoints:**
```
GET    /api/themes/presets                - Get all presets
GET    /api/themes/user                   - Get user theme
POST   /api/themes/apply-preset/:presetId - Apply preset
POST   /api/themes/custom                 - Create custom theme
PUT    /api/themes/custom/:id             - Update custom theme
DELETE /api/themes/custom/:id             - Delete custom theme
GET    /api/themes/custom                 - Get user custom themes
```

---

## 📊 DATABASE TABLES

Các bảng mới cần có trong database:

```sql
-- Notifications
realtime_notifications
notification_settings

-- Themes
theme_presets
user_themes
custom_themes

-- Messaging (coming soon)
conversations
conversation_participants
messages

-- Achievements (coming soon)
achievements
user_achievements
achievement_progress
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: Cannot find module 'ws'
```bash
npm install ws
```

### Lỗi: Database connection failed
- Kiểm tra MySQL đang chạy: `mysql -u root -p`
- Kiểm tra thông tin trong `.env`
- Kiểm tra database đã tạo: `SHOW DATABASES;`

### Lỗi: WebSocket connection failed
- Kiểm tra port 8080 không bị chiếm
- Kiểm tra firewall
- Thử browser khác

### Lỗi: JWT token invalid
- Đăng nhập lại để lấy token mới
- Kiểm tra JWT_SECRET trong `.env`

---

## 📚 NEXT STEPS

### Còn thiếu (sẽ thêm tiếp):

1. **Messaging System** 🔄
   - Private conversations
   - Group chats
   - Message history
   - Typing indicators
   - Read receipts

2. **Achievement System** 🔄
   - Achievement definitions
   - User progress tracking
   - Unlock achievements
   - Badges & rewards

3. **Frontend JavaScript** 🔄
   - Notification UI interactions
   - Theme switcher
   - WebSocket client
   - Real-time updates

4. **Push Notifications** 🔄
   - Service Worker
   - VAPID keys
   - Push subscription
   - Browser notifications

---

## 🎉 SUMMARY

**Đã hoàn thành:**
- ✅ WebSocket Server (real-time)
- ✅ Notification System (full CRUD + push)
- ✅ Theme System (presets + custom)
- ✅ Routes, Controllers, Services
- ✅ app.js integration

**Tổng số files mới:** 7 files
- 1 WebSocket utility
- 2 Routes
- 2 Controllers
- 2 Services

**Sẵn sàng chạy:** ✅ YES!

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Kiểm tra database connection
3. Kiểm tra `.env` configuration
4. Xem `QUICK_START_GUIDE.md` để biết thêm chi tiết

---

**Created by: Kiro AI**  
**Date: May 2, 2026**  
**Status: ✅ READY TO RUN!**  
**Version: 2.1.0**

🚀 **Happy Coding!**

