const { uploadImage } = require("../services/storageService");

exports.uploadFile = async (req, res) => {
  try {
    const imageUrl = await uploadImage(req.file);
    res.status(200).json({ success: 1, image_url: imageUrl });
  } catch (error) {
    res.status(500).json({ error });
  }
};
