const userService = require("../services/userService");
const bcrypt = require("bcryptjs");
const reportService = require("../services/reportService");
exports.getAll = async (req, res) => {
  try {
    const allUsers = await userService.getAll();
    //
    res.render("dashboards/admin_users", {
      users: allUsers,
      user: req.user,
    });
  } catch (error) {
    console.log("Lỗi tại Controller:", error.message);
    res.status(500).send("Lỗi tải danh sách");
  }
};
// Trích đoạn logic gợi ý cho sếp trong userController.js
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Tạo object chứa các thông tin cơ bản
    let updateData = { name, email, role };
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await userService.update(id, updateData);
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).send("Lỗi cập nhật: " + error.message);
  }
};
exports.getById = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).send("Không tìm thấy user");
    res.render("dashboards/editUser", { user });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.create = async (req, res) => {
  try {
    await userService.create(req.body);
    res.redirect("/admin/users");
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
};
// Thêm hàm này để xử lý yêu cầu xóa user
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.delete(id); // Gọi service để thực hiện xóa
    res.redirect("/admin/users"); // Xóa xong thì quay về danh sách
  } catch (error) {
    console.log("Lỗi xóa User:", error.message);
    res.status(500).send("Không thể xóa user này sếp ơi!");
  }
};
// Đảm bảo sếp cũng có hàm này để hiện Form
exports.getCreateForm = (req, res) => {
  res.render("dashboards/createUser", { user: req.user });
};
exports.exportUsersPDF = async (req, res) => {
  try {
    const users = await userService.getAll(); // Đảm bảo sếp có userService.getAll()
    const html = `
            <html>
            <head>
                <style>
                    body { font-family: DejaVu Sans, sans-serif; }
                    h1 { text-align: center; color: #0d6efd; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f8f9fa; }
                </style>
            </head>
            <body>
                <h1>DANH SÁCH NGƯỜI DÙNG</h1>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Quyền</th>
                        <th>Ngày tham gia</th>
                    </tr>
                    ${users
                      .map(
                        (u) => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>${u.role}</td>
                            <td>${new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </table>
            </body>
            </html>`;

    const buffer = await reportService.exportPDF(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_report.pdf",
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Lỗi xuất PDF người dùng: " + error.message);
  }
};
