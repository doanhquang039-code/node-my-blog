const commentService = require("../services/commentService");
const postService = require("../services/postService");
const ExcelJS = require("exceljs");

exports.addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    await commentService.create({
      postId: postId,
      userId: req.user.id,
      content: content,
    });
    res.redirect(`/admin/posts/view/${postId}`);
  } catch (error) {
    console.error("Lỗi cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await commentService.delete(id);
    const backURL = req.get("Referer") || "/admin/posts";
    res.redirect(backURL);
  } catch (error) {
    console.error("Lỗi xóa cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    console.log("📥 ID:", id, "| content:", content);
    console.log("📥 Toàn bộ req.body:", req.body);
    await commentService.update(id, content);
    res.redirect(req.get("Referer") || "/admin/posts");
  } catch (error) {
    console.error("Lỗi update cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
exports.exportExcel = async (req, res) => {
  try {
    const comments = await commentService.getAll(); // Đảm bảo Service này có hàm getAll

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Comments");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nội dung", key: "content", width: 50 },
      { header: "Người viết", key: "user", width: 20 },
      { header: "Bài viết", key: "post", width: 30 },
      { header: "Ngày tạo", key: "date", width: 20 },
    ];

    comments.forEach((c) => {
      sheet.addRow({
        id: c.id,
        content: c.content,
        user: c.author ? c.author.name : "Ẩn danh",
        post: c.post ? c.post.title : "N/A",
        date: new Date(c.createdAt).toLocaleString("vi-VN"),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=comments_report.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Lỗi xuất Excel Comment:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
