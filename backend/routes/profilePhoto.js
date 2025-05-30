const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");

router.get("/profile-photo/:id", async (req, res) => {
  try {
    const photo = await Photo.findOne({ id: req.params.id });
    if (!photo) return res.status(404).send("Rasm topilmadi");

    res.set("Content-Type", photo.contentType);
    res.send(photo.data);
  } catch (error) {
    console.error("Rasmni olishda xatolik:", error);
    res.status(500).send("Ichki xatolik");
  }
});

module.exports = router;
