const jwt = require("jsonwebtoken");

// Đặt tên hàm là authMiddleware ở đây
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Đọc token từ cookie đã cài đặt

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key_123",
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("token");
    res.redirect("/login");
  }
};

// Bây giờ dòng này mới có giá trị để export
module.exports = authMiddleware;
