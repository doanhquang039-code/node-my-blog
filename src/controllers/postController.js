// src/controllers/postController.js
const postService = require("../services/postService");
const categoryService = require("../services/categoryService");

exports.getAll = async (req, res) => {
    try {
        let posts;
        if (req.user.role === "admin" || req.user.role === "manager") {
            posts = await postService.getAll();
        } else {
            // Đảm bảo sếp đã viết hàm getPostsByUser trong Service nhé!
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
        res.status(500).send("Lỗi lấy danh mục: " + error.message);
    }
};

exports.create = async (req, res) => {
    try {
        const postData = {
            ...req.body,
            user_id: req.user.id, // Đã khớp với Model
            status: "pending",
        };
        await postService.create(postData);
        res.redirect("/admin/posts");
    } catch (error) {
        // LỖI Ở ĐÂY NÈ SẾP: Nếu lỗi, mình cần lấy lại categories để render lại form
        const categories = await categoryService.getAll();
        res.render("dashboards/createPost", { 
            categories, 
            user: req.user, 
            error: "Lỗi tạo bài: " + error.message 
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