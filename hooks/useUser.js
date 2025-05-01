const users = require("../backend/models/userModel");
const { getUserProfilePhotoUrl } = require("../bot/utils/helpers");

const useUser = (userId) => {
  const buildUserData = async (user) => {
    try {
      const photo = await getUserProfilePhotoUrl(user.id);
      return {
        photo,
        id: user.id,
        username: user.username,
        firstName: user.first_name || null,
      };
    } catch (err) {
      console.log("Profil rasm URL ni olishda xatolik:", err);
      return {
        id: user.id,
        photo: null,
        username: user.username,
        firstName: user.first_name || null,
      };
    }
  };

  const findUserById = async (id = userId) => {
    try {
      return await users.findOne({ id });
    } catch (err) {
      console.log("Foydalanuvchini topishda xatolik:", err);
      return null;
    }
  };

  const registerUser = async (user) => {
    const existingUser = await findUserById(user.id);

    if (existingUser) {
      console.log("Foydalanuvchi allaqachon mavjud! ID:", user.id);
      return;
    }

    const formattedUser = await buildUserData(user);

    try {
      return await users.create(formattedUser);
    } catch (err) {
      console.log("Foydalanuvchini yaratishda xatolik:", err);
      return;
    }
  };

  const isUserInState = (user, state) => {
    if (!user?.state?.trim() || !state?.trim()) return;
    return user?.state?.trim() === state?.trim();
  };

  return { findUserById, registerUser, isUserInState };
};

module.exports = useUser;
