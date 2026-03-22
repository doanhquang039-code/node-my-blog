const postService = require("../services/postService");
const categoryService = require("../services/categoryService");
const { Tag } = require("../models");
const reportService = require("../services/reportService");
const slugify = require("slugify");
const axios = require("axios");
exports.getAll = async (req, res) => {
  try {
    let posts;
    if (
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      req.user.role === "editor" ||
      req.user.role === "user"
    ) {
      posts = await postService.getAll();
    } else {
      posts = await postService.getPostsByUser(req.user.id);
    }
    res.render("dashboards/admin_posts", { posts, user: req.user });
  } catch (error) {
    res.status(500).send("Lỗi: " + error.message);
  }
};
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 req.body nhận được:", req.body);
    console.log("📁 req.file:", req.file);
    const { title, content, category_id, tags } = req.body;

    // 1. Tìm bài viết cũ (Nạp luôn tags để xử lý so sánh nếu cần)
    const post = await postService.getById(id);
    if (!post) {
      return res
        .status(404)
        .render("errors/404", { message: "Bài viết không tồn tại sếp ơi!" });
    }

    // 2. Xử lý File (Ảnh/Video) - Nếu không upload mới thì giữ nguyên cái cũ
    let imagePath = post.image;
    let videoPath = post.video;

    if (req.file) {
      const cloudUrl = req.file.path;
      // Phân loại nhanh dựa trên URL của Cloudinary
      if (cloudUrl.includes("/video/upload/")) {
        videoPath = cloudUrl;
        imagePath = ""; // Nếu đổi sang video thì xóa link ảnh
      } else {
        imagePath = cloudUrl;
        videoPath = ""; // Nếu đổi sang ảnh thì xóa link video
      }
    }
    const updatedData = {
      title: title !== undefined && title !== "" ? title : post.title,
      content: content !== undefined && content !== "" ? content : post.content,
      image: imagePath,
      video: videoPath,
      categoryId: category_id || post.categoryId,
    };
    if (title && title !== post.title) {
      updatedData.slug = slugify(title, { lower: true }) + "-" + Date.now();
    }

    // 4. Thực thi cập nhật vào Database
    await post.update(updatedData);

    // 5. Cập nhật mối quan hệ Tags (N-N)
    if (typeof tags !== "undefined") {
      // Kiểm tra nếu có gửi field tags lên
      const tagNames = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");

      const tagInstances = [];
      for (const name of tagNames) {
        // findOrCreate giúp không bị tạo trùng Tag đã có trong hệ thống
        const [tag] = await Tag.findOrCreate({ where: { name: name } });
        tagInstances.push(tag);
      }
      // Hàm setTags của Sequelize sẽ tự động xóa các liên kết cũ và thêm cái mới vào bảng post_tag
      await post.setTags(tagInstances);
    }

    console.log(`✅ Đã cập nhật thành công bài viết ID: ${id}`);
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("❌ LỖI UPDATE POST:", error.message);
    res.status(500).send("Lỗi hệ thống khi cập nhật: " + error.message);
  }
};
exports.getCreateForm = async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    res.render("dashboards/createPost", { categories, user: req.user });
  } catch (error) {
    res.status(500).send("Lỗi Server: " + error.message);
  }
};
exports.create = async (req, res) => {
  try {
    const { title, content, category_id, tags } = req.body;
    let imagePath = "";
    let videoPath = "";
    if (req.file) {
      const cloudUrl = req.file.path;
      if (cloudUrl.includes("/video/upload/")) {
        videoPath = cloudUrl;
        imagePath = "";
      } else {
        imagePath = cloudUrl;
        videoPath = "";
      }
    }
    const postData = {
      title,
      content,
      image: imagePath,
      video: videoPath,
      slug: slugify(title, { lower: true }) + "-" + Date.now(),
      categoryId: category_id,
      userId: req.user.id,
      status: "pending",
    };
    const post = await postService.create(postData);
    if (tags && tags.trim() !== "") {
      const tagNames = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");
      const tagInstances = [];
      for (const name of tagNames) {
        const [tag] = await Tag.findOrCreate({ where: { name: name } });
        tagInstances.push(tag);
      }
      await post.setTags(tagInstances);
      console.log(
        `✅ Đã lưu ${tagInstances.length} tags cho bài ID: ${post.id}`,
      );
    }
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("❌ LỖI LƯU TAG:", error.message);
    const categories = await categoryService.getAll();
    res.render("dashboards/createPost", {
      categories,
      user: req.user,
      error: "Lỗi: " + error.message,
    });
  }
};
exports.approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    await postService.updateStatus(id, action);
    res.redirect("/admin/posts");
  } catch (error) {
    res.status(400).send("Lỗi khi duyệt bài: " + error.message);
  }
};
exports.delete = async (req, res) => {
  try {
    await postService.delete(req.params.id);
    res.redirect("/admin/posts");
  } catch (error) {
    res.status(400).send("Lỗi xóa bài: " + error.message);
  }
};
exports.exportPostsExcel = async (req, res) => {
  try {
    const reportService = require("../services/reportService");
    const axios = require("axios");
    const ExcelJS = require("exceljs");
    const posts = await postService.getAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách bài viết");

    // 1. Định nghĩa cột (Thêm cột Ảnh ở đầu)
    worksheet.columns = [
      { header: "Hình ảnh", key: "image_display", width: 20 },
      { header: "ID", key: "id", width: 10 },
      { header: "Tiêu đề", key: "title", width: 30 },
      { header: "Trạng thái", key: "status", width: 15 },
      // Ép định dạng Ngày + Giờ cho Excel
      {
        header: "Ngày tạo",
        key: "createdAt",
        width: 25,
        style: { numFmt: "dd/mm/yyyy hh:mm:ss" },
      },
      { header: "Người tạo", key: "author_name", width: 20 },
      { header: "Danh mục", key: "category_name", width: 20 },
      { header: "Views", key: "views", width: 10 },
      { header: "Link Video", key: "video", width: 40 },
    ];
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      const rowIndex = i + 2;

      worksheet.addRow({
        id: p.id,
        title: p.title,
        status: p.status,
        createdAt: new Date(p.createdAt),
        author_name: p.author ? p.author.name : "N/A",
        category_name: p.category ? p.category.name : "N/A",
        views: p.stats ? p.stats.view_count : 0,
        video: p.video || "Không",
      });

      worksheet.getRow(rowIndex).height = 80;

      // XỬ LÝ ẢNH NÂNG CAO
      if (p.image && p.image.startsWith("http")) {
        try {
          const response = await axios.get(p.image, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data);

          // Tự động nhận diện đuôi file từ link hoặc mặc định là png
          let extension = "png";
          if (
            p.image.toLowerCase().endsWith(".jpg") ||
            p.image.toLowerCase().endsWith(".jpeg")
          )
            extension = "jpeg";
          if (p.image.toLowerCase().endsWith(".gif")) extension = "gif";

          const imageId = workbook.addImage({
            buffer: buffer,
            extension: extension,
          });

          worksheet.addImage(imageId, {
            tl: { col: 0, row: rowIndex - 1 },
            ext: { width: 90, height: 90 },
            editAs: "oneCell", // Giữ ảnh nằm gọn trong ô kể cả khi resize
          });
          console.log(`✅ Đã chèn ảnh bài ID: ${p.id}`);
        } catch (imgError) {
          console.error(`❌ Lỗi tải ảnh bài ${p.id}:`, imgError.message);
        }
      }
    }
    // Định dạng Header bold
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Bao_cao_bai_viet.xlsx",
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Lỗi xuất Excel: " + error.message);
  }
};
exports.getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("==> Bước 1: Đang tìm bài viết ID:", id);
    const post = await postService.getById(id);
    console.log(
      "==> Bước 2: Kết quả tìm kiếm:",
      post ? "Tìm thấy" : "KHÔNG thấy",
    );
    if (!post) {
      return res
        .status(404)
        .send("Lỗi: Không tìm thấy bài viết trong database!");
    }
    console.log("==> Bước 3: Đang render giao diện...");
    res.render("dashboards/postDetail", { post, user: req.user });
  } catch (error) {
    console.error("==> LỖI CỰC NẶNG:", error.message);
    res.status(500).send("Lỗi Server: " + error.message);
  }
};
exports.exportPostsPDF = async (req, res) => {
  try {
    const reportService = require("../services/reportService");
    const posts = await postService.getAll();

    let html = `
        <html>
        <head>
            <style>
                body { font-family: DejaVu Sans, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #198754; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
                th { background-color: #f8f9fa; }
                .img-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 5px; }
                .status-approved { color: green; font-weight: bold; }
                .status-pending { color: orange; }
            </style>
        </head>
        <body>
            <h1>BÁO CÁO CHI TIẾT BÀI VIẾT</h1>
            <p>Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}</p>
            <table>
                <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo (Full Time)</th>
                </tr>`;

    posts.forEach((p) => {
      const fullTime = new Date(p.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const imgTag = p.image
        ? `<img src="${p.image}" class="img-thumb">`
        : "No Image";

      html += `
            <tr>
                <td>${imgTag}</td>
                <td><b>${p.title}</b></td>
                <td>${p.author ? p.author.name : "N/A"}</td>
                <td class="status-${p.status}">${p.status}</td>
                <td>${fullTime}</td>
            </tr>`;
    });
    html += `</table></body></html>`;
    const buffer = await reportService.exportPDF(html);
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Bao_cao_bai_viet.pdf",
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Lỗi xuất PDF: " + error.message);
  }
};
exports.getEditForm = async (req, res) => {
  const post = await postService.getById(req.params.id);
  const categories = await categoryService.getAll();
  res.render("dashboards/editPost", { post, categories, user: req.user });
};
