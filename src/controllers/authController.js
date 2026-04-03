const authService = require("../services/authService");
const userService = require("../services/userService");
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    console.log("Dữ liệu từ Service trả về:", result);

    if (!result || !result.token) {
      return res.render("login", {
        error: "Không lấy được Token từ hệ thống!",
      });
    }
    res.cookie("token", result.token, {
      httpOnly: true,
      maxAge: 3600000,
    });

    const role = result.data.role;
    console.log("Đang điều hướng cho quyền:", role);
    switch (role) {
      case "admin":
        return res.redirect("/admin");
      case "manager":
        return res.redirect("/manager");
      case "editor":
        return res.redirect("/editor");
      default:
        return res.redirect("/user");
    }
  } catch (error) {
    res.render("login", { error: error.message });
  }
};
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // Phải có role ở đây
    const existingUser = await userService.getByEmail(email);
    if (existingUser) return res.status(400).send("Email này đã được sử dụng!");

    // Ép kiểu role về chữ thường để khớp với DB
    await userService.create({
      name,
      email,
      password,
      role: role ? role.toLowerCase() : "user",
    });

    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Lỗi đăng ký: " + error.message);
  }
};
exports.logout = (req, res) => {
  res.clearCookie("token"); // Xóa sạch vé khi đăng xuất
  res.redirect("/login");
};
