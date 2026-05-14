const cloudinary = require("cloudinary").v2;
const path = require("node:path");
const stream = require("node:stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(file) {
  const isVideo = file.mimetype.startsWith("video/");
  const publicId = `${Date.now()}-${path.parse(file.originalname).name}`;

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "my_blog_assets",
        resource_type: isVideo ? "video" : "image",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "mkv", "avi"],
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );

    stream.Readable.from(file.buffer).pipe(upload);
  });
}

const storage = {
  _handleFile(req, file, cb) {
    const chunks = [];

    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", cb);
    file.stream.on("end", async () => {
      try {
        file.buffer = Buffer.concat(chunks);
        const result = await uploadToCloudinary(file);
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
          mimetype: file.mimetype,
        });
      } catch (error) {
        cb(error);
      }
    });
  },
  _removeFile(req, file, cb) {
    cb(null);
  },
};

module.exports = { cloudinary, storage };
