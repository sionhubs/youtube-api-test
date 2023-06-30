// 주 실행 파일입니다
const express = require("express");
// 파일 경로를 불러오는 패키지
const path = require("path");
const cookieParser = require('cookie-parser');  // 쿠키 처리 미들웨어를 추가합니다.
const app = express();
const bodyParser = require('body-parser');


// 웹페이지의 라우트(경로)를 정의하는 파일을 불러옴
const defaultRoutes = require("./routes/default");
const videosRoutes = require("./routes/video");


// ejs 템플릿(html에 자바스크립트 문법을 사용할 수 있는 파일)을 쉽게 가져오기 위한 코드
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 혹시나 사이트에서 불러오는 데이터가 있을 경우를 대비해 만들어 놓은 코드
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Express 앱이 쿠키를 파싱하도록 설정합니다.
// public 폴더 안의 데이터들을 구체적인 경로 지정 없이도 가져올 수 있게 함
// "../public/styles/style.css" 이렇게 불러오지 않고 "/styles/style.css" 이렇게 불러오는게 가능
app.use(express.static("public"));

app.use(bodyParser.json());

// 쿠키를 설정하는 미들웨어
app.use((req, res, next) => {
  res.cookie('key', 'value', { SameSite: 'None', secure: false }); // 쿠키를 설정합니다.
  next();
});

// 라우트 사용하는 미들웨어 함수, url에 http://localhost:8080/경로 에 따라 렌더링되는 페이지가 달라짐
app.use("/", defaultRoutes);
app.use("/", videosRoutes);


// 클라이언트에서 문제가 발생했을 때 404오류 창을 띄움
app.use(function (req, res) {
  res.status(404).render("404");
});

// 서버에서 문제가 발생했을 때 500오류 창을 띄움
app.use(function (error, req, res, next) {
  res.status(500).render("500");
});


// http://localhost:8080로 접속하면 됩니다
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
