# 🚀 BẮT ĐẦU MIGRATION - HƯỚNG DẪN CHI TIẾT

**Ngày**: 1 Tháng 5, 2026  
**Dự án**: my-blog-node → my-blog-fullstack  

---

## 📋 BƯỚC 1: TẠO CẤU TRÚC DỰ ÁN MỚI

### 1.1 Tạo thư mục chính
```bash
cd d:\
mkdir my-blog-fullstack
cd my-blog-fullstack
```

### 1.2 Tạo Backend (NestJS)
```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create NestJS project
nest new backend

# Chọn npm làm package manager
# Đợi cài đặt hoàn tất
```

### 1.3 Tạo Frontend (React + Vite)
```bash
# Create React project with TypeScript
npm create vite@latest frontend -- --template react-ts

# Enter frontend directory
cd frontend

# Install dependencies
npm install
```

---

## 📦 BƯỚC 2: CÀI ĐẶT DEPENDENCIES

### 2.1 Backend Dependencies
```bash
cd backend

# Core dependencies
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install @nestjs/config
npm install bcrypt
npm install class-validator class-transformer

# Additional features
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/platform-express multer
npm install cloudinary cloudinary-core
npm install @nestjs-modules/mailer nodemailer handlebars
npm install puppeteer
npm install web-push

# Dev dependencies
npm install -D @types/bcrypt @types/passport-jwt @types/multer @types/nodemailer
```

### 2.2 Frontend Dependencies
```bash
cd ../frontend

# Core dependencies
npm install react-router-dom
npm install @reduxjs/toolkit react-redux
npm install axios
npm install @tanstack/react-query

# UI & Forms
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-hook-form yup @hookform/resolvers

# Additional features
npm install socket.io-client
npm install react-quill
npm install recharts
npm install react-toastify
npm install dayjs
npm install react-helmet-async

# Dev dependencies
npm install -D @types/react-router-dom
```

---

## 🗄️ BƯỚC 3: EXPORT DATABASE HIỆN TẠI

### 3.1 Export MySQL Database
```bash
# Export schema và data
mysqldump -u root -p blog > d:\my-blog-fullstack\blog_backup.sql

# Hoặc export chỉ schema
mysqldump -u root -p --no-data blog > d:\my-blog-fullstack\blog_schema.sql
```

### 3.2 Tạo Database mới
```sql
CREATE DATABASE blog_new CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ⚙️ BƯỚC 4: CẤU HÌNH BACKEND (NestJS)

### 4.1 Tạo file .env
```bash
cd backend
```

Tạo file `.env`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=blog_new

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@myblog.com

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Web Push
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

### 4.2 Cấu hình TypeORM
Tạo file `backend/src/config/database.config.ts`:
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  charset: 'utf8mb4',
});
```

### 4.3 Update app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 4.4 Update main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Blog API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

## ⚙️ BƯỚC 5: CẤU HÌNH FRONTEND (React)

### 5.1 Tạo file .env
```bash
cd ../frontend
```

Tạo file `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 5.2 Cấu hình Vite
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 5.3 Cấu hình TypeScript
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🏗️ BƯỚC 6: TẠO CẤU TRÚC THƯ MỤC

### 6.1 Backend Structure
```bash
cd backend/src

# Create modules
nest g module auth
nest g module users
nest g module posts
nest g module categories
nest g module tags
nest g module comments
nest g module analytics
nest g module chatbot
nest g module upload
nest g module notifications

# Create common folder
mkdir common
mkdir common/decorators
mkdir common/guards
mkdir common/interceptors
mkdir common/filters
mkdir common/pipes

# Create config folder
mkdir config

# Create database folder
mkdir database
mkdir database/entities
mkdir database/migrations
```

### 6.2 Frontend Structure
```bash
cd ../../frontend/src

# Create folders
mkdir components
mkdir components/common
mkdir components/layout
mkdir components/posts
mkdir components/comments
mkdir components/admin

mkdir pages
mkdir pages/Home
mkdir pages/Login
mkdir pages/Register
mkdir pages/Posts
mkdir pages/PostDetail
mkdir pages/Dashboard
mkdir pages/Profile

mkdir store
mkdir store/slices

mkdir services

mkdir hooks

mkdir utils

mkdir types

mkdir assets
mkdir assets/images
mkdir assets/styles
```

---

## 🚀 BƯỚC 7: CHẠY DỰ ÁN

### 7.1 Start Backend
```bash
cd backend
npm run start:dev
```

Kiểm tra:
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

### 7.2 Start Frontend
```bash
cd frontend
npm run dev
```

Kiểm tra:
- Frontend: http://localhost:5173

---

## 📝 BƯỚC 8: MIGRATION DATA

### 8.1 Tạo Entities từ Models hiện tại

Ví dụ User Entity:
```typescript
// backend/src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 8.2 Import data từ database cũ
```bash
# Import vào database mới
mysql -u root -p blog_new < d:\my-blog-fullstack\blog_backup.sql
```

---

## ✅ CHECKLIST

### Setup
- [ ] Tạo thư mục my-blog-fullstack
- [ ] Tạo backend với NestJS
- [ ] Tạo frontend với React + Vite
- [ ] Cài đặt dependencies backend
- [ ] Cài đặt dependencies frontend

### Configuration
- [ ] Tạo .env backend
- [ ] Tạo .env frontend
- [ ] Cấu hình TypeORM
- [ ] Cấu hình Vite
- [ ] Cấu hình CORS

### Database
- [ ] Export database hiện tại
- [ ] Tạo database mới
- [ ] Import data

### Structure
- [ ] Tạo modules backend
- [ ] Tạo folders frontend
- [ ] Tạo entities
- [ ] Tạo DTOs

### Testing
- [ ] Backend chạy được
- [ ] Frontend chạy được
- [ ] Database kết nối được
- [ ] Swagger hoạt động

---

## 🎯 NEXT STEPS

Sau khi hoàn thành setup:

1. **Tạo Auth Module** (Login, Register, JWT)
2. **Tạo Users Module** (CRUD users)
3. **Tạo Posts Module** (CRUD posts)
4. **Tạo Frontend Components** (Login, Register, PostList)
5. **Connect Frontend to Backend** (API calls)

---

## 📚 USEFUL COMMANDS

### NestJS
```bash
# Generate module
nest g module <name>

# Generate controller
nest g controller <name>

# Generate service
nest g service <name>

# Generate complete resource
nest g resource <name>
```

### React
```bash
# Create component
# Manually create in src/components/

# Run tests
npm run test

# Build for production
npm run build
```

---

**Status**: ✅ READY TO START  
**Next**: Execute Step 1  
**Estimated Time**: 2-3 hours for setup  

---

*Hướng dẫn tạo: 1 Tháng 5, 2026*  
*By: Kiro AI*  
*Version: 1.0*
