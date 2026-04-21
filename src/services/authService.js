const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email không tồn tại");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Mật khẩu không đúng");

    const userData = user.toJSON();
    delete userData.password;

    // ✅ Dùng chung một secret với authMiddleware
    const secret = process.env.JWT_SECRET || "SECRET_KEY_CUA_SEP";
    const token = jwt.sign(
      { id: userData.id, role: userData.role, name: userData.name },
      secret,
      { expiresIn: "1h" },
    );

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
