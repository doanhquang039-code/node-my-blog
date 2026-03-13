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

// Hàm register và logout
exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: "Đăng ký thành công", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token"); // Xóa sạch vé khi đăng xuất
  res.redirect("/login");
};
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userService.getByEmail(email); // Sếp cần viết thêm hàm getByEmail trong service
    if (existingUser)
      return res.status(400).send("Email này đã được sử dụng rồi sếp ơi!");

    await userService.create({ name, email, password });

    // Đăng ký xong cho sếp về trang Login luôn
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Lỗi đăng ký: " + error.message);
  }
};
