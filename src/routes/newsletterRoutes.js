const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");

// Newsletter routes
router.post("/subscribe", newsletterController.subscribeNewsletter);
router.get("/unsubscribe", newsletterController.unsubscribeNewsletter);
router.post("/send", newsletterController.sendNewsletterEmail);

module.exports = router;
