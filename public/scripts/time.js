let player;
let timer;
let remainingTime = 0;

function playVideo(videoId) {
  if (player) {
    player.destroy();
  }

  if (timer) {
    clearInterval(timer);
  }

  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: videoId,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });

  function onPlayerReady(event) {
    const timeLimit = document.getElementById("timeLimit").value;
    remainingTime = timeLimit * 60;
    if (remainingTime > 0) {
      startTimer(remainingTime);
      setTimeout(() => {
        event.target.stopVideo();
        clearInterval(timer);
        alert(`시간 제한 (${timeLimit}분) 도달! 동영상이 중지되었습니다.`);
      }, remainingTime * 1000);
    } else {
      event.target.playVideo();
    }
  }
}

function startTimer(remainingTime) {
  if (remainingTime <= 0) return;

  updateRemainingTime(remainingTime);

  timer = setInterval(() => {
    remainingTime--;
    if (remainingTime <= 0) {
      clearInterval(timer);
      window.close();
    } else {
      updateRemainingTime(remainingTime);
    }
  }, 1000);
}

function updateRemainingTime(remainingTime) {
  if (remainingTime >= 0) {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById(
      "remainingTime"
    ).innerText = `남은 시간: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    player = null;
    clearInterval(timer);
    document.getElementById("remainingTime").innerText = "";
  }
}
