const { Storage } = require('@google-cloud/storage');
const path = require("path");
const { format } = require('util');

const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, 
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID, 
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

// Fungsi untuk mengunggah gambar ke Google Cloud Storage
const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject("No file uploaded");
    }

    const blob = bucket.file(`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => reject("Unable to upload image"));
    blobStream.on("finish", () => {
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { uploadImage };
