const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const commentRoutes = require("./src/routes/commentRoutes");
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
require("./src/config/db");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  console.log(`🚀 Có yêu cầu: ${req.method} ${req.url}`);
  next();
});
app.use("/", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/posts", postRoutes);
app.use("/comments", commentRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(` Server đang chạy tại: http://localhost:${PORT}`);
});
