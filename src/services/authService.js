const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  async login(email, password) {
    // 1. Tìm user
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email không tồn tại");

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Mật khẩu không đúng");

    // 3. Lấy data user (loại bỏ password)
    const userData = user.toJSON();
    delete userData.password;

    // 4. TẠO TOKEN (Dùng SECRET cố định để test cho chắc)
    const secret = process.env.JWT_SECRET || "secret_key_123";
    const token = jwt.sign(
      { id: userData.id, role: userData.role, name: userData.name },
      secret,
      { expiresIn: "1h" },
    );

    // 5. TRẢ VỀ OBJECT CHỨA CẢ 2
    return { data: userData, token: token };
  }

  async register(userData) {
    const existingUser = await User.findOne({
      where: { email: userData.email },
    });
    if (existingUser) throw new Error("Email đã tồn tại");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || "user",
    });
    return newUser;
  }
}

module.exports = new AuthService();
