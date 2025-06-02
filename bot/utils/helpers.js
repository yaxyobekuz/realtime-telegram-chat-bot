const bot = require("../bot");
const axios = require("axios");
const { objectDB } = require("../../backend/app");
const { botToken, objectDBConfig } = require("../../config");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const getUserProfilePhotoId = async (userId) => {
  try {
    const { total_count, photos } = await bot.getUserProfilePhotos(userId);
    if (total_count === 0) return null;
    return photos[0][0].file_id;
  } catch (err) {
    console.log(
      "Foydalanuvchining 1-profil rasm ID raqamini olishda xatolik: ",
      err
    );
    return null;
  }
};

const getFile = async (fileId) => {
  try {
    const file = await bot.getFile(fileId);
    if (!file) return;
    const { file_id: id, file_size: size, file_path: path } = file;
    const url = `https://api.telegram.org/file/bot${botToken}/${path}`;
    return { id, size, url, path };
  } catch (err) {
    console.log("Telegram fayl havolasini (URL) olishda xatolik: ", err);
    return null;
  }
};

const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (err) {
    console.log("Rasmni buffer ko'rinishida yuklab olishda xatolik: ", err);
    return null;
  }
};

const uploadImageToObjectDB = async (buffer, fileName) => {
  try {
    const params = {
      Body: buffer,
      Key: fileName,
      ACL: "public-read",
      Bucket: "arzon-umra",
    };

    const command = new PutObjectCommand(params);
    await objectDB.send(command); // Upload image to objectDB

    const { endpoint, bucketName } = objectDBConfig;

    const fileUrl = `${endpoint}/${bucketName}/${fileName}`;
    return { url: fileUrl, path: fileName };
  } catch (err) {
    console.error("Fayl paqirga rasm yuklashda xatolik:", err);
    return null;
  }
};

const deleteImageFromObjectDB = async (fileName) => {
  const { bucketName } = objectDBConfig;

  try {
    const params = { Key: fileName, Bucket: bucketName };

    const command = new DeleteObjectCommand(params);
    await objectDB.send(command); // Delete image from objectDB
    console.log("Rasm muvaffaqiyatli o'chirildi:", fileName);
    return true;
  } catch (err) {
    console.log("Rasmni o'chirishda xatolik:", err);
    return false;
  }
};

const downloadAndUploadImage = async (photo) => {
  // Get photo buffer
  const imageBuffer = await downloadImage(photo.url);
  if (!imageBuffer) return null;

  // Upload image to object data base
  const uploaded = await uploadImageToObjectDB(imageBuffer, photo.path);
  if (!uploaded) return null;

  return uploaded; // Return upload image url & path
};

const getUserProfilePhotoUrl = async (userId) => {
  // Get user first profile photo image id
  const photoId = await getUserProfilePhotoId(userId);
  if (!photoId) return null;

  // Get user profile photo file url
  const file = await getFile(photoId);
  if (!file) return null;

  return await downloadAndUploadImage(file);
};

module.exports = {
  getFile,
  downloadImage,
  uploadImageToObjectDB,
  getUserProfilePhotoUrl,
  downloadAndUploadImage,
};
