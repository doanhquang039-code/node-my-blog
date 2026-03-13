const categoryService = require("../services/categoryService");

// 1. Lấy tất cả (Dùng cho API hoặc View)
exports.getAll = async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Tạo mới
exports.create = async (req, res) => {
  try {
    await categoryService.create(req.body);
    res.redirect("/admin");
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
};

// 3. Xóa
exports.delete = async (req, res) => {
  try {
    await categoryService.delete(req.params.id);
    res.redirect("/admin");
  } catch (error) {
    res.status(400).send("Lỗi xóa: " + error.message);
  }
};

// 4. Lấy dữ liệu để SỬA (GET)
exports.getById = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) return res.status(404).send("Không tìm thấy danh mục");
    res.render("dashboards/editCategory", { category }); //
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// 5. Cập nhật dữ liệu (POST/PUT)
exports.update = async (req, res) => {
  try {
    await categoryService.update(req.params.id, req.body);
    res.redirect("/admin");
  } catch (error) {
    res.status(400).send("Lỗi cập nhật: " + error.message);
  }
};
