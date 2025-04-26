const bot = require("../bot");
const { default: axios } = require("axios");
const { botToken } = require("../../config");

const getUserProfilePhotoId = async (userId) => {
  let profilePhotoId = null;

  await bot
    .getUserProfilePhotos(userId)
    .then(async ({ total_count, photos }) => {
      if (total_count === 0) return;
      profilePhotoId = photos[0][0].file_id;
    });

  return profilePhotoId;
};

const getFileUrl = async (fileId) => {
  let fileUrl = null;

  await bot.getFile(fileId).then((file) => {
    fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
  });

  return fileUrl;
};

const getUserProfilePhotoBuffer = async (userId) => {
  const photoId = await getUserProfilePhotoId(userId);
  if (!photoId) return null;
  const fileUrl = await getFileUrl(photoId);
  const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
  return { buffer: res.data, contentType: res.headers["content-type"] };
};

module.exports = { getUserProfilePhotoBuffer };
