const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

// 유튜브 웹사이트에서 추천된 영상 크롤링
async function scrapeRecommendedVideos() {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto("https://www.youtube.com", { waitUntil: "networkidle2" });

    // 추천된 영상 요소 선택 및 정보 추출
    let recommendedVideos = await page.evaluate(() => {
      const videoElements = Array.from(
        document.querySelectorAll("ytd-rich-item-renderer")
      );
      return videoElements.map((element) => {
        const titleElement = element.querySelector("#video-title-link");
        const thumbnailElement = element.querySelector(
          "#thumbnail > yt-image > img"
        );

        const title = titleElement ? titleElement.textContent.trim() : null;
        const videoId = titleElement ? titleElement.href.split("=")[1] : null;
        const thumbnail = thumbnailElement ? thumbnailElement.src : null;

        return {
          title,
          videoId,
          thumbnail,
        };
      });
    });

    recommendedVideos = recommendedVideos.filter(
      (video) => video.title !== null && video.videoId !== null
    );

    console.log(recommendedVideos); // 크롤링한 데이터를 콘솔에 출력

    await browser.close();

    return recommendedVideos;
  } catch (error) {
    console.error("Error scraping recommended videos:", error);
    throw error;
  }
}

module.exports = {
  scrapeRecommendedVideos,
};
