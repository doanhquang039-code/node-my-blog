const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("❌ [Middleware]: Không thấy Token trong Cookie!");
    return res.redirect("/login");
  }

  try {
    // ✅ Dùng chung một secret với authService
    const secret = process.env.JWT_SECRET || "SECRET_KEY_CUA_SEP";
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    console.log(`✅ [Middleware]: Auth OK! Role: ${req.user.role}`);
    next();
  } catch (err) {
    console.log("❌ [Middleware]: Token lỗi hoặc hết hạn:", err.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

module.exports = authMiddleware;
