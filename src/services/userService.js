const { User } = require("../models");
const bcrypt = require("bcrypt");
class UserService {
  async getAll() {
    // Phải viết đúng getAll, không phải getall hay GetAll
    return await User.findAll({
      attributes: { exclude: ["password"] },
    });
  }
  async getById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
  }
  async getByEmail(email) {
    return await User.findOne({
      where: { email: email },
    });
  }
  // src/services/userService.js
  async create(data) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    if (!data.role) data.role = "user";

    return await User.create(data);
  }
  async delete(id) {
    return await User.destroy({
      where: { id: id },
    });
  }
  async update(id, data) {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, 10);
    }
    return await User.update(data, {
      where: { id: id },
    });
  }
}

module.exports = new UserService();
