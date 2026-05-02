# 📝 MY-BLOG-NODE

> Modern Blog Platform with Real-time Features

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-8.20.0-yellow.svg)](https://github.com/websockets/ws)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)

A feature-rich blog platform built with Node.js, Express, MySQL, and WebSocket for real-time communication.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration & login
- JWT-based authentication
- Role-based access control (Admin, Author, User, Manager)
- Password hashing with bcrypt

### 📝 Blog Management
- Create, read, update, delete posts
- Rich text editor support
- Featured images
- Categories & tags
- Post scheduling
- Draft system
- SEO optimization

### 💬 Comments System
- Nested comments
- Comment ratings (helpful/unhelpful)
- Moderation tools

### 🔍 Search & Analytics
- Full-text search
- Advanced filters
- Search history
- Post analytics
- User activity tracking
- Dashboard with statistics

### 🔔 Real-time Notifications (NEW!)
- WebSocket-based push notifications
- Email notifications
- Notification preferences
- Unread count
- Mark as read/unread

### 🎨 Theme System (NEW!)
- Multiple theme presets
- Custom themes
- Color customization
- Font customization
- Custom CSS support

### 🔌 WebSocket Server (NEW!)
- Real-time bidirectional communication
- JWT authentication
- Private messaging
- Broadcast messages
- Ping/pong heartbeat

### 📧 Newsletter System
- Email subscriptions
- Newsletter campaigns
- Unsubscribe management

### 🤖 Chatbot
- AI-powered assistance
- FAQ responses
- User support

### 📊 Role-Based Dashboards
- Admin dashboard
- Author dashboard
- User dashboard
- Manager dashboard

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/my-blog-node.git
cd my-blog-node
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Create database**
```bash
mysql -u root -p
CREATE DATABASE my_blog_db;
exit
```

5. **Run migrations**
```bash
node run-phase2-migration.js
```

6. **Start the server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

7. **Access the application**
```
🌐 Website: http://localhost:8080
🔌 WebSocket: ws://localhost:8080/ws
```

---

## 📚 Documentation

- **[START_NOW.md](START_NOW.md)** - Quick start guide
- **[BUILD_COMPLETE_SUMMARY.md](BUILD_COMPLETE_SUMMARY.md)** - Complete project summary
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Detailed setup guide
- **[FEATURES_SUMMARY.md](FEATURES_SUMMARY.md)** - Feature overview
- **[ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)** - API documentation
- **[MIGRATION_TO_NESTJS_REACT_PLAN.md](MIGRATION_TO_NESTJS_REACT_PLAN.md)** - Future migration plan

---

## 🏗️ Project Structure

```
my-blog-node/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── views/           # EJS templates
├── public/              # Static files
│   ├── css/
│   ├── js/
│   └── uploads/
├── migrations/          # Database migrations
├── app.js               # Main application
├── package.json
└── .env                 # Environment variables
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
```

### Posts
```
GET    /admin/posts          - Get all posts
POST   /admin/posts          - Create post
PUT    /admin/posts/:id      - Update post
DELETE /admin/posts/:id      - Delete post
GET    /admin/posts/:id      - Get post by ID
```

### Notifications (NEW!)
```
GET    /api/notifications              - Get user notifications
GET    /api/notifications/unread/count - Get unread count
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
GET    /api/notifications/settings     - Get settings
PUT    /api/notifications/settings     - Update settings
```

### Themes (NEW!)
```
GET    /api/themes/presets                - Get all presets
GET    /api/themes/user                   - Get user theme
POST   /api/themes/apply-preset/:presetId - Apply preset
POST   /api/themes/custom                 - Create custom theme
PUT    /api/themes/custom/:id             - Update custom theme
DELETE /api/themes/custom/:id             - Delete custom theme
GET    /api/themes/custom                 - Get user custom themes
```

### WebSocket (NEW!)
```
WS     ws://localhost:8080/ws

Message Types:
- auth: {"type":"auth","token":"JWT_TOKEN"}
- ping: {"type":"ping"}
- message: {"type":"message","content":"Hello"}
- private_message: {"type":"private_message","to":userId,"content":"Hi"}
```

[See ADVANCED_FEATURES.md for complete API documentation]

---

## 🔌 WebSocket Usage

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'YOUR_JWT_TOKEN'
}));

// Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Send message
ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello World!'
}));
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **WebSocket (ws)** - Real-time communication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Puppeteer** - PDF generation

### Frontend
- **EJS** - Template engine
- **Vanilla JavaScript** - Client-side scripting
- **CSS3** - Styling

---

## 🔐 Environment Variables

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
JWT_SECRET=your_super_secret_jwt_key

# WebSocket
WS_PORT=8081
WS_PATH=/ws

# Web Push (Optional)
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your@email.com
```

---

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Run with coverage
npm run test:coverage
```

---

## 📦 Deployment

### Docker (Recommended)
```bash
# Build image
docker build -t my-blog-node .

# Run container
docker run -p 8080:8080 my-blog-node
```

### Manual Deployment
1. Set `NODE_ENV=production` in `.env`
2. Configure production database
3. Run migrations
4. Start with PM2:
```bash
npm install -g pm2
pm2 start app.js --name my-blog
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kiro AI**

---

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MySQL team for the robust database
- WebSocket (ws) team for real-time capabilities
- All contributors and supporters

---

## 📞 Support

For support, email support@myblog.com or join our Slack channel.

---

## 🗺️ Roadmap

### Phase 3 (Upcoming)
- [ ] Messaging system
- [ ] Achievement system
- [ ] Advanced media gallery
- [ ] Elasticsearch integration
- [ ] i18n support
- [ ] React.js frontend
- [ ] Progressive Web App (PWA)
- [ ] Mobile app

### Phase 4 (Future)
- [ ] AI content generation
- [ ] Advanced analytics
- [ ] Social media integration
- [ ] Multi-tenant support
- [ ] GraphQL API
- [ ] Microservices architecture

---

## 📊 Project Stats

- **Version:** 2.1.0
- **API Endpoints:** 100+
- **Database Tables:** 30+
- **Lines of Code:** 10,000+
- **Documentation Pages:** 10+

---

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ by Kiro AI**

**Last Updated:** May 2, 2026

