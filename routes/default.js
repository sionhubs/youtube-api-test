// 사이트 안의 많은 경로들을 정의해놓은 파일입니다

const express = require("express");
// 구글 api 서비스를 불러오는 패키지
const router = express.Router();

// scrapeRecommendedVideos 함수를 가져옵니다.
const { scrapeRecommendedVideos } = require("../public/scripts/scraper");

// 로그인 창 렌더링, url이 http://localhost:8080/ 일 때 렌더링 됨
router.get("/", function (req, res) {
  res.render("login");
});

// 로그인 이후의 페이지 경로들 입니다
// 영상 창 렌더링, url이 http://localhost:8080/home 일 때 렌더링 됨
router.get("/home", async (req, res) => {
  try {
    // 크롤링하여 추출한 영상 배열
    const videos = await scrapeRecommendedVideos();
    videos.length = 10;
    res.render("videos", { videos });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});

// 분석 창 렌더링, url이 http://localhost:8080/analysis 일 때 렌더링 됨
router.get("/analysis", function (req, res) {
  res.render("analysis");
});

// 시간종료 창 렌더링, url이 http://localhost:8080/end 일 때 렌더링 됨
router.get("/end", function (req, res) {
  res.render("end");
});

module.exports = router;
