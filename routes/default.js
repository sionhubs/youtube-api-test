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

// 시청 제한시간
let timeSet = 600;
// 오늘의 시청시간이 존재하는가?
var existTime = false;

// 로그인 창 렌더링, url이 http://localhost:8080/ 일 때 렌더링 됨
router.get("/", function (req, res) {
  var currentDate = new Date().toISOString().split("T")[0]; // get current date
  // JSON 파일 읽기
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) {
      res.render("500");
    } else {
      // 파싱하여 JavaScript 객체로 변환
      const database = JSON.parse(data);

      // 오늘의 시청 시간이 이미 있는지 확인
      let todayWatchTime = database.watchTime.find(
        (wt) => wt.date === currentDate
      );
      if (!todayWatchTime) {
        existTime = false;
      } else {
        existTime = todayWatchTime.time;
      }

      // 다시 JSON으로 변환하고 파일에 저장
      fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
        if (err) {
          res.render("500");
        }
      });
    }
  });
  res.render("main", { existTime });
});

router.post("/timeset", function (req, res) {
  timeSet = parseInt(req.body.numberInput, 10) * 60; // Parse the input as an integer
  if (isNaN(timeSet) || timeSet <= 0) {
    // Check if the input is not a number or less than or equal to zero
    timeSet = 600;
  }
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
        res.render("500");
      } else {
        // 파싱하여 JavaScript 객체로 변환
        const database = JSON.parse(data);
        // 오늘의 시청 시간이 이미 있는지 확인
        let todayWatchTime = database.watchTime.find(
          (wt) => wt.date === currentDate
        );

        // 남은시간
        if (todayWatchTime) {
          elapsedTime = todayWatchTime.time;
          if (todayWatchTime.cal) {
            todayWatchTime.time +=
              Math.floor(Date.now() / 1000) - todayWatchTime.current;
            todayWatchTime.cal = false;
            elapsedTime = todayWatchTime.time;
          }
        } else {
          // 오늘의 시청 시간이 없으면 새 항목을 추가합니다.
          todayWatchTime = {
            date: currentDate,
            cal: false,
            current: Date.now(),
            time: timeSet,
          };
          database.watchTime.push(todayWatchTime);
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

        // 다시 JSON으로 변환하고 파일에 저장
        fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
          if (err) {
            res.render("500");
          }
        });
      }
    });
  } catch (error) {
    res.render("500");
  }
});

// 비디오로 들어가는 링크입니다
// 각 영상에 id를 정해 놓습니다
router.get("/video/:id", async function (req, res) {
  try {
    const video = req.params.id;
    res.render("video-detail", { video, timeSet });
  } catch (error) {
    res.render("500");
  }
});

router.get("/analysis", async function (req, res) {
  try {
    var currentDate = new Date().toISOString().split("T")[0]; // get current date

    // JSON 파일 동기적으로 읽기
    let data;
    try {
      data = fs.readFileSync(jsonPath, "utf8");
    } catch (err) {
      res.render("500");
    }

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
        current: Date.now(),
        time: 0,
      };
      database.watchTime.push(todayWatchTime);
    } else {
      elapsedTime = todayWatchTime.time;
      if (todayWatchTime.cal) {
        todayWatchTime.time +=
          Math.floor(Date.now() / 1000) - todayWatchTime.current;
        todayWatchTime.cal = false;
        elapsedTime = todayWatchTime.time;
      }
    }

    // 다시 JSON으로 변환하고 파일에 저장
    fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
      if (err) {
        res.render("500");
      }
    });

    const watchTimeFormatted = formatTime(todayWatchTime.time);

    res.render("analysis", {
      watchTime: watchTimeFormatted,
      wholeData: database.watchTime,
    });
  } catch (error) {
    res.render("500");
  }
});

// 시간종료 창 렌더링, url이 http://localhost:8080/end 일 때 렌더링 됨
router.get("/end", (req, res) => {
  res.render("end");
});

// 비디오가 시작될때 타이머에 json데이터를 주는 함수
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

// 영상이 멈춘 후 json데이터를 다루는 함수
router.post("/watchTime", (req, res) => {
  const time = req.body.time;
  console.log("Received Time: ", time);
  var currentDate = new Date().toISOString().split("T")[0]; // get current date

  // JSON 파일 읽기
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) {
      res.render("500");
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

      // 다시 JSON으로 변환하고 파일에 저장
      fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
        if (err) {
          res.render("500");
        }
      });
    }
  });

  res.sendStatus(200);
});

// 영상이 재생될 때 json데이터를 다루는 함수
router.post("/currentTime", (req, res) => {
  console.log("Received Time:");
  var currentDate = new Date().toISOString().split("T")[0]; // get current date

  // JSON 파일 읽기
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) {
      res.render("500");
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

      // 다시 JSON으로 변환하고 파일에 저장
      fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
        if (err) {
          res.render("500");
        }
      });
    }
  });

  res.sendStatus(200);
});

module.exports = router;
