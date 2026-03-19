const postService = require("../services/postService");
const categoryService = require("../services/categoryService");
const { Tag } = require("../models");
const slugify = require("slugify");

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
    const imagePath = req.file ? `/uploads/posts/${req.file.filename}` : "";

    const postData = {
      title,
      content,
      slug:
        slugify(String(title), { lower: true, strict: true }) +
        "-" +
        Date.now(),
      image: imagePath,
      categoryId: category_id,
      userId: req.user.id,
      status: "pending",
    };

    // 1. CHỈ GỌI CREATE 1 LẦN DUY NHẤT VÀ HỨNG VÀO BIẾN post
    const post = await postService.create(postData);

    // 2. XỬ LÝ TAGS (Gắn vào đúng cái post vừa tạo bên trên)
    if (tags && tags.trim() !== "") {
      const tagNames = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");
      const tagInstances = [];

      for (const name of tagNames) {
        // findOrCreate giúp không bị trùng tag trong bảng tags
        const [tag] = await Tag.findOrCreate({ where: { name: name } });
        tagInstances.push(tag);
      }

      // Lệnh này sẽ ghi dữ liệu vào bảng post_tag
      await post.setTags(tagInstances);
      console.log(
        `✅ Đã lưu ${tagInstances.length} tags cho bài ID: ${post.id}`,
      );
    }

    // 3. ĐIỀU HƯỚNG VỀ (BẮT BUỘC: Không được gọi await postService.create nữa)
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
