// // 안 쓰임
// let player;
// let timer;
// let remainingTime = null; // 초기 상태를 null로 설정
// let timeLimit = null; // timeLimit을 전역 변수로 설정

// window.onYouTubeIframeAPIReady = function () {
//   window.playVideo = function (videoId) {
//     if (player) {
//       player.destroy();
//     }

//     player = new YT.Player("player", {
//       height: "360",
//       width: "640",
//       videoId: videoId,
//       events: {
//         onReady: onPlayerReady,
//         onStateChange: onPlayerStateChange,
//       },
//     });

//     function onPlayerReady(event) {
//       if (remainingTime === null) {
//         // 처음 비디오 재생을 위한 시간 설정
//         timeLimit = document.getElementById("timeLimit").value;
//         remainingTime = timeLimit * 60;
//       }

//       if (remainingTime > 0 && !timer) {
//         startTimer();
//       }

//       if (remainingTime <= 0) {
//         event.target.stopVideo();
//         clearInterval(timer);
//         setTimeout(() => {
//           // setTimeout 내부에 alert를 넣어 비디오가 중지된 후에 alert가 표시되도록 합니다.
//           alert(`시간 제한 (${timeLimit}분) 도달! 동영상이 중지되었습니다.`);
//         }, 100);
//       } else {
//         event.target.playVideo();
//       }
//     }
//   };
// };

// function startTimer() {
//   updateRemainingTime();
//   timer = setInterval(() => {
//     remainingTime--;
//     if (remainingTime <= 0) {
//       if (player) {
//         player.stopVideo(); // player.stopVideo()를 호출하여 동영상을 중지합니다.
//       }
//       clearInterval(timer); // 타이머를 정지합니다.
//       updateRemainingTime(); // remainingTime이 0 이하가 될 때 updateRemainingTime 함수를 호출합니다.
//       setTimeout(() => {
//         // setTimeout 내부에 alert를 넣어 비디오가 중지된 후에 alert가 표시되도록 합니다.
//         alert(`시간 제한 (${timeLimit}분) 도달! 동영상이 중지되었습니다.`);
//       }, 100);
//     } else {
//       updateRemainingTime();
//     }
//   }, 1000);
// }

// function updateRemainingTime() {
//   if (remainingTime >= 0) {
//     const minutes = Math.floor(remainingTime / 60);
//     const seconds = remainingTime % 60;
//     document.getElementById(
//       "remainingTime"
//     ).innerText = `남은 시간: ${minutes}:${seconds
//       .toString()
//       .padStart(2, "0")}`;
//   }
// }

// function onPlayerStateChange(event) {
//   if (event.data === YT.PlayerState.ENDED) {
//     player = null;
//     clearInterval(timer); // 비디오가 끝나면 타이머를 정지합니다.
//     document.getElementById("remainingTime").innerText = "";
//   }
// }
