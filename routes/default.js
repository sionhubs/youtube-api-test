// 사이트 안의 많은 경로들을 정의해놓은 파일입니다

const express = require("express");
// 구글 api 서비스를 불러오는 패키지
const { google } = require("googleapis");
const router = express.Router();
const config = require("../util/key");

// 로그인 창 렌더링, url이 http://localhost:8080/ 일 때 렌더링 됨
router.get("/", function (req, res) {
  res.render("login");
});

// 아래로는 유튜브 사용자 인증을 받기 위한 코드 입니다

/**
 * OAuth2 인증에 사용되는 CLIENT_ID, CLIENT_SECRET 및 REDIRECT_URI에 액세스해야 합니다.
 * 애플리케이션의 이러한 자격 증명을 가져오려면
 * https://console.cloud.google.com/apis/credentials을 방문하십시오.
 */
// YOUR_CLIENT_ID,
//   YOUR_CLIENT_SECRET(클라이언트 보안 비밀번호),
//   YOUR_REDIRECT_URL(승인된 리다이렉션 URL)
const oauth2Client = new google.auth.OAuth2(
  config.CLIENT_ID,
  config.CLIENT_SECRET,
  "http://localhost:8080/oauth2callback"
);

// 읽기 전용 YouTube 활동을 위한 액세스 범위입니다.
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

// YouTube Data API 스코프 권한 요청을 생성합니다.
const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (기본값) 또는 'offline' (refresh_token을 가져옵니다)
  access_type: "offline",
  /** 위에서 정의한 스코프 배열을 전달합니다.
   * 대신 하나의 스코프만 필요한 경우 문자열로 스코프 URL을 전달할 수 있습니다. */
  scope: scopes,
  // 점진적인 권한 부여를 활성화합니다. 모범 사례로 권장됩니다.
  include_granted_scopes: true,
});

/* 이 코드 예제에서 사용자 자격 증명을 저장하는 전역 변수입니다.
 * ACTION ITEM for developers:
 *   이 코드를 실제 앱에 통합하는 경우 사용자의 refresh token을
 *   안전한 영구 데이터 저장소에 저장하도록 합니다.
 *   refresh token 처리에 대한 자세한 내용은
 *   https://github.com/googleapis/google-api-nodejs-client#handling-refresh-tokens을 참조하십시오. */
let userCredential = null;

// 사용자를 Google OAuth 2.0 서버로 리디렉션하는 예제입니다.
router.get("/login-youtube", (req, res) => {
  res.redirect(authorizationUrl);
});

// Google OAuth 2.0 서버로부터 콜백을 수신하는 예제입니다.
// 정상적으로 불러오면 videos.ejs 페이지를 렌더링 합니다
router.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    userCredential = tokens;

    const youtube = google.youtube("v3");
    const response = await youtube.videos.list({
      auth: oauth2Client,
      part: "snippet",
      myRating: "like",
      maxResults: 5,
    });
    const videos = response.data.items;
    res.render("video", { videos, error: null });
  } catch (error) {
    console.log("Error:", error);
    res.render("videoList", {
      videos: [],
      error: "동영상 목록을 가져오는 데 실패했습니다.",
    });
    res.status(500).render("500");
  }
});

// 토큰 취소 예제입니다.
// 취소되면 로그인 화면으로 되돌아 갑니다(login.ejs 페이지를 렌더링 합니다)
router.get("/revoke", (req, res) => {
  if (!userCredential) {
    res.status(400).send("No access token found.").render("404");
    return;
  }

  oauth2Client
    .revokeCredentials()
    .then(() => {
      console.log("Access token revoked.");
      res.status(200).render("login");
    })
    .catch((error) => {
      console.log("Error revoking access token:", error);
      res.status(500).render("500");
    });
});

// 로그인 이후의 페이지 경로들 입니다
// 영상 창 렌더링, url이 http://localhost:8080/home 일 때 렌더링 됨
router.get("/home", function (req, res) {
  res.render("videos");
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
