// src/middlewares/roleMiddleware.js
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // req.user được gán từ authMiddleware sau khi verify Token
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .render("error", { message: "Bạn không đủ quyền hạn!" });
    }
    next();
  };
};
module.exports = roleMiddleware;
