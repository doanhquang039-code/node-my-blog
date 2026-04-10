const emailService = require("../services/emailService");

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email là bắt buộc" });
    }

    await emailService.subscribeNewsletter(email);
    res.json({ message: "Đã đăng ký nhận tin tức" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email là bắt buộc" });
    }

    await emailService.unsubscribeNewsletter(email);
    res.json({ message: "Đã hủy đăng ký" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.sendNewsletterEmail = async (req, res) => {
  try {
    const { subject, htmlContent } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({
        error: "subject và htmlContent là bắt buộc",
      });
    }

    const count = await emailService.sendNewsletterEmail(subject, htmlContent);
    res.json({ message: `Đã gửi đến ${count} người đăng ký` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
