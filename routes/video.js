// 구체적인 영상을 선택해서 영상 시청화면으로 넘어갈 때를 정의하기 위한 경로입니다
// 아직 미완성 입니다 프론트 쪽에서 영상재생 화면을 보내주시면 그때 작성할까 합니다

const express = require("express");
// 임의의 난수를 불러오기 위한 패키지 입니다
const uuid = require("uuid");
const router = express.Router();

// scrapeRecommendedVideos 함수를 가져옵니다.
const { scrapeRecommendedVideos } = require("../public/scripts/scraper");

// 각 영상에 id를 정해 놓습니다
router.get("/video/:id", async function (req, res) {
  try {
    const video = req.params.id;
    res.render("video-detail", { video });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});

module.exports = router;
