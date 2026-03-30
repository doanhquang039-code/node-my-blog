const categoryService = require("../services/categoryService");
const reportService = require("../services/reportService");
const ExcelJS = require("exceljs");
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
exports.exportExcel = async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Categories");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Tên Danh Mục", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 30 },
    ];

    categories.forEach((cat) => {
      sheet.addRow({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=categories.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send("Lỗi xuất Excel: " + error.message);
  }
};

exports.exportPDF = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ Service (Quan trọng: Phải await)
    const categories = await categoryService.getAll();

    if (!categories || categories.length === 0) {
      return res.status(404).send("Không có danh mục nào để xuất sếp ơi!");
    }

    // 2. Xây dựng nội dung HTML (Sếp nhớ dùng thẻ backtick ` để bao quanh)
    const html = `
            <html>
            <head>
                <style>
                    body { font-family: DejaVu Sans, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #dc3545; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .footer { margin-top: 30px; text-align: right; font-style: italic; }
                </style>
            </head>
            <body>
                <h1>DANH SÁCH DANH MỤC BÀI VIẾT</h1>
                <p>Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}</p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 10%">ID</th>
                            <th style="width: 45%">Tên Danh Mục</th>
                            <th style="width: 45%">Slug (Đường dẫn)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories
                          .map(
                            (cat) => `
                            <tr>
                                <td>${cat.id}</td>
                                <td>${cat.name}</td>
                                <td>/${cat.slug}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
                <div class="footer">Người xuất: ${req.user.name}</div>
            </body>
            </html>`;

    // 3. Gọi service chuyển HTML thành Buffer PDF
    const buffer = await reportService.exportPDF(html);

    // 4. Trả về cho trình duyệt
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=danh-sach-danh-muc.pdf",
    );
    res.send(buffer);
  } catch (error) {
    console.error("Lỗi xuất PDF Category:", error.message);
    res.status(500).send("Lỗi hệ thống: " + error.message);
  }
};
