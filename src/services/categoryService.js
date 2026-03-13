const { Category } = require("../models");
class CategoryService {
  async create(data) {
    const existing = await Category.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new Error("Slug này đã tồn tại, vui lòng chọn tên khác!");
    }
    return await Category.create(data);
  }
  async getAll() {
    return await Category.findAll();
  }
  async delete(id) {
    return await Category.destroy({
      where: { id: id },
    });
  }
  async update(id, data) {
    return await Category.update(data, {
      where: { id: id },
    });
  }
  async getById(id) {
    return await Category.findByPk(id);
  }
}

module.exports = new CategoryService();
