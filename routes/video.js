const express = require("express");

const uuid = require("uuid");

const router = express.Router();

router.get("/videos/:id", function (req, res) {
  const videoId = req.params.id;

  for (const video of storedvideos) {
    if (video.id === videoId) {
      return res.render("video-detail", { video: video });
    }
  }

  res.status(404).render("404");
});

module.exports = router;
