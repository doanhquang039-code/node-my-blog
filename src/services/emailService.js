const nodemailer = require("nodemailer");
const { Newsletter } = require("../models");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendCommentNotification(post, comment, author) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: author.email,
      subject: `Bình luận mới trên bài "${post.title}"`,
      html: `
        <h2>Bình luận mới trên bài viết của bạn</h2>
        <p><strong>Bài viết:</strong> ${post.title}</p>
        <p><strong>Người bình luận:</strong> ${comment.name}</p>
        <p><strong>Nội dung:</strong> ${comment.content}</p>
        <a href="${process.env.APP_URL}/posts/${post.id}">Xem bài viết</a>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPostApprovalNotification(post, author) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: author.email,
      subject: `Bài viết "${post.title}" đã được phê duyệt!`,
      html: `
        <h2>Bài viết của bạn đã được phê duyệt</h2>
        <p><strong>Tiêu đề:</strong> ${post.title}</p>
        <p>Bài viết của bạn giờ đã được công khai.</p>
        <a href="${process.env.APP_URL}/posts/${post.id}">Xem bài viết</a>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendNewsletterEmail(subject, htmlContent) {
    const subscribers = await Newsletter.findAll({
      where: { is_active: true },
    });

    for (const subscriber of subscribers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject,
        html: `
          ${htmlContent}
          <hr>
          <p><small><a href="${process.env.APP_URL}/newsletter/unsubscribe?email=${subscriber.email}">Hủy đăng ký</a></small></p>
        `,
      };

      try {
        await this.transporter.sendMail(mailOptions);
      } catch (error) {
        console.error(`Lỗi gửi email cho ${subscriber.email}:`, error);
      }
    }

    return subscribers.length;
  }

  async subscribeNewsletter(email) {
    const [newsletter, created] = await Newsletter.findOrCreate({
      where: { email },
      defaults: { is_active: true },
    });

    if (!created) {
      newsletter.is_active = true;
      await newsletter.save();
    }

    return newsletter;
  }

  async unsubscribeNewsletter(email) {
    const newsletter = await Newsletter.findOne({ where: { email } });
    if (newsletter) {
      newsletter.is_active = false;
      await newsletter.save();
    }
    return newsletter;
  }
}

module.exports = new EmailService();
