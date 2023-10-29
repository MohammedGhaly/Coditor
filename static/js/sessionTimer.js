var startTime;
var timerInterval;
var isRunning = false;

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
  }
}

function resetTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
    $(".up-time-title").text("time:");
  }
}

function updateTimer() {
  const currentTime = new Date() - startTime;

  const hours = Math.floor(currentTime / 3600000);
  const minutes = Math.floor((currentTime % 3600000) / 60000);
  const seconds = Math.floor((currentTime % 60000) / 1000);

  const formattedTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  $(".up-time-title").text(`time:\t${formattedTime}`);
}
