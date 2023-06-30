// 사이트 안의 많은 경로들을 정의해놓은 파일입니다
const express = require("express");
// 구글 api 서비스를 불러오는 패키지
const router = express.Router();

const fs = require("fs");
const path = require("path");

// JSON 파일의 경로를 정의합니다.
const jsonPath = path.resolve("./watchTime.json");

// scrapeRecommendedVideos 함수를 가져옵니다.
const { scrapeRecommendedVideos } = require("../public/scripts/scraper");

function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${hours}hr ${minutes}min ${seconds}sec`;
}

// 시청 제한시간, 일단은 1분으로 설정해둠
var timeSet = 600;

// 로그인 창 렌더링, url이 http://localhost:8080/ 일 때 렌더링 됨
router.get("/", function (req, res) {
  res.render("login");
});

// 시간 제한 설정 버튼을 누를때
router.post("/timeset", function (req, res) {
  timeset = req.body;
  res.redirect("/home");
});

// 로그인 이후의 페이지 경로들 입니다
// 영상 창 렌더링, url이 http://localhost:8080/home 일 때 렌더링 됨
router.get("/home", async (req, res) => {
  try {
    // 크롤링하여 추출한 영상 배열
    const videos = await scrapeRecommendedVideos();
    videos.length = 10;

    var remainingTime;
    var currentDate = new Date().toISOString().split("T")[0]; // get current date
    // JSON 파일 읽기
    fs.readFile(jsonPath, "utf8", (err, data) => {
      if (err) {
        console.log(`Error reading file from disk: ${err}`);
      } else {
        // 파싱하여 JavaScript 객체로 변환
        const database = JSON.parse(data);

        // 오늘의 시청 시간이 이미 있는지 확인
        let todayWatchTime = database.watchTime.find(
          (wt) => wt.date === currentDate
        );

        if (todayWatchTime) {
          elapsedTime = todayWatchTime.time;
          if (todayWatchTime.cal) {
            todayWatchTime.time +=
              Math.floor(Date.now() / 1000) - todayWatchTime.current;
            todayWatchTime.cal = false;
            elapsedTime = todayWatchTime.time;
          }
        } else {
          elapsedTime = 0;
        }

        // 남은 시간을 video.ejs에 띄우기 위함
        remainingTime = timeSet - elapsedTime;
        if (remainingTime <= 0) {
          res.redirect("/end");
        } else {
          remainingTime = formatTime(remainingTime);
          res.render("videos", { videos, remainingTime });
        }

        console.log(remainingTime);
        // // ////////////////////////////////////////////////////////////////////////
        // console.log("videotime////////////////////////");
        // console.log(todayWatchTime);

        // 다시 JSON으로 변환하고 파일에 저장
        fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
          if (err) {
            console.log(`Error writing file: ${err}`);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});

// 비디오로 들어가는 링크입니다
// 각 영상에 id를 정해 놓습니다
router.get("/video/:id", async function (req, res) {
  try {
    const video = req.params.id;
    res.render("video-detail", { video, timeSet });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});

router.get("/analysis", async function (req, res) {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, "../watchTime.json"),
      "utf8"
    );
    const watchTimeData = JSON.parse(data);
    const watchTime = watchTimeData.watchTime;

    const watchTimeFormatted = formatTime(watchTime);

    res.render("analysis", { watchTime: watchTimeFormatted });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});

// 시간종료 창 렌더링, url이 http://localhost:8080/end 일 때 렌더링 됨
router.get("/end", (req, res) => {
  res.render("end");
});

router.get("/watchTime", (req, res) => {
  fs.readFile("watchTime.json", "utf8", (err, data) => {
    if (err) {
      console.log(err); // 에러 로깅
      res.json({ time: 0 }); // 기본값 반환
    } else {
      res.json(JSON.parse(data));
    }
  });
});

router.post("/watchTime", (req, res) => {
  const time = req.body.time;
  console.log("Received Time: ", time);
  var currentDate = new Date().toISOString().split("T")[0]; // get current date

  // JSON 파일 읽기
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) {
      console.log(`Error reading file from disk: ${err}`);
    } else {
      // 파싱하여 JavaScript 객체로 변환
      const database = JSON.parse(data);

      // 오늘의 시청 시간이 이미 있는지 확인
      let todayWatchTime = database.watchTime.find(
        (wt) => wt.date === currentDate
      );

      if (!todayWatchTime) {
        // 오늘의 시청 시간이 없으면 새 항목을 추가합니다.
        todayWatchTime = {
          date: currentDate,
          cal: false,
          current: Math.floor(Date.now() / 1000),
          time: 0,
        };
        database.watchTime.push(todayWatchTime);
      }

      // 시청 시간 추가
      todayWatchTime.time = time;
      todayWatchTime.cal = false;

      // // ////////////////////////////////////////////////////////////////////////
      // console.log("watchtime////////////////////////");
      // console.log(todayWatchTime);

      // 다시 JSON으로 변환하고 파일에 저장
      fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        }
      });
    }
  });

  res.sendStatus(200);
});

router.post("/currentTime", (req, res) => {
  console.log("Received Time:");
  var currentDate = new Date().toISOString().split("T")[0]; // get current date

  // JSON 파일 읽기
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) {
      console.log(`Error reading file from disk: ${err}`);
    } else {
      // 파싱하여 JavaScript 객체로 변환
      const database = JSON.parse(data);

      // 오늘의 시청 시간이 이미 있는지 확인
      let todayWatchTime = database.watchTime.find(
        (wt) => wt.date === currentDate
      );
      if (!todayWatchTime) {
        // 오늘의 시청 시간이 없으면 새 항목을 추가합니다.
        todayWatchTime = {
          date: currentDate,
          cal: true,
          current: Math.floor(Date.now() / 1000),
          time: 0,
        };
        database.watchTime.push(todayWatchTime);
      }

      // cal 을 true로
      todayWatchTime.cal = true;
      todayWatchTime.current = Math.floor(Date.now() / 1000);
      // // ////////////////////////////////////////////////////////////////////////
      // console.log("currenttime////////////////////////");
      // console.log(todayWatchTime);

      // 다시 JSON으로 변환하고 파일에 저장
      fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        }
      });
    }
  });

  res.sendStatus(200);
});

module.exports = router;
