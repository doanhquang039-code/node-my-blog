const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // ✅ Redirect về trang đúng role thay vì render error
      const role = req.user?.role;
      switch (role) {
        case "admin":
          return res.redirect("/admin");
        case "manager":
          return res.redirect("/manager");
        case "editor":
          return res.redirect("/editor");
        case "user":
          return res.redirect("/user");
        default:
          return res.redirect("/login");
      }
    }
    next();
  };
};

module.exports = roleMiddleware;
