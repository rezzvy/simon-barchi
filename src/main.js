const mainMenuModal = new bootstrap.Modal(document.getElementById("main-menu-modal"));
const resultModal = new bootstrap.Modal(document.getElementById("result-modal"));

const mainMenuStartGameButton = document.getElementById("main-menu-start-game-btn");

const mainElement = document.querySelector("main");

const sequenceButtons = document.querySelectorAll(".sequence-col");

const stageReachedElement = document.querySelector("#stage-reached").lastElementChild;

const expectedMovesElement = document.getElementById("expected-moves");
const playerMovesElement = document.getElementById("player-moves");

const retryButton = document.getElementById("retry-btn");
const goToMainMenuButton = document.getElementById("go-to-main-menu-btn");

const mainMenuCloseButton = document.getElementById("main-menu-close-btn");

const currentStageElement = document.getElementById("current-stage");
const stageCompletionBar = document.querySelector("#stage-completion-bar").firstElementChild;

const voiceVolumeConfigContainer = document.getElementById("voice-vol-config");
const voiceVolumeConfigInputIndicator = voiceVolumeConfigContainer.querySelector(".badge");
const voiceVolumeConfigInput = voiceVolumeConfigContainer.querySelector("input");

const bgmVolumeConfigContainer = document.getElementById("bgm-vol-config");
const bgmVolumeConfigInputIndicator = bgmVolumeConfigContainer.querySelector(".badge");
const bgmVolumeConfigInput = bgmVolumeConfigContainer.querySelector("input");

const sequenceDelayConfigContainer = document.getElementById("sequence-delay-config");
const sequenceDelayConfigInputIndicator = sequenceDelayConfigContainer.querySelector(".badge");
const sequenceDelayConfigInput = sequenceDelayConfigContainer.querySelector("input");

const sequenceTransitionSelection = document.getElementById("sequence-transition-selection");

const fullScreenModeCheckbox = document.getElementById("full-screen-mode");

const voiceElements = {
  yellow: document.querySelector('audio[data-audio="yellow"]'),
  blue: document.querySelector('audio[data-audio="blue"]'),
  red: document.querySelector('audio[data-audio="red"]'),
  green: document.querySelector('audio[data-audio="green"]'),
};

const sequenceStatePlaybackElements = {
  true: document.querySelector('audio[data-audio="correct"]'),
  false: document.querySelector('audio[data-audio="wrong"]'),
};

const bgmElement = document.querySelector('audio[data-audio="bgm"]');

const sequences = [];
let isGameStarted = false;
let playerMoveLength = 0;
let stage = 1;

let timeoutStart = "";
let timeoutEnd = "";

let currentPlayingVoice = "";
let currentPlayingSequenceStatePlayback = "";

let sequenceDelay = 600;

setVoiceVolume(0.3);
bgmElement.volume = 0.6;

function setVoiceVolume(vol) {
  Object.keys(voiceElements).forEach((key) => {
    voiceElements[key].volume = vol;
  });
}

function playAudio(audio, prev) {
  if (prev && !prev.paused) {
    prev.pause();
    prev.currentTime = 0;
  }

  audio.play();
  return audio;
}

function playVoice(color) {
  const audio = voiceElements[color];
  currentPlayingVoice = playAudio(audio, currentPlayingVoice);
}

function playsequenceStatePlayback(boolean) {
  const audio = sequenceStatePlaybackElements[boolean];
  currentPlayingSequenceStatePlayback = playAudio(audio, currentPlayingSequenceStatePlayback);
}

function playBgm(boolean) {
  if (boolean) {
    bgmElement.play();
  } else {
    if (!bgmElement.paused) {
      bgmElement.pause();
      bgmElement.currentTime = 0;
    }
  }
}

function generateMovesSpan(array) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < array.length; i++) {
    const span = document.createElement("span");
    span.style.setProperty("--color", array[i]);

    fragment.appendChild(span);
  }

  return fragment;
}

function generateSequence() {
  const colors = ["yellow", "blue", "red", "green"];
  const randIndex = Math.floor(Math.random() * colors.length);

  sequences.push(colors[randIndex]);
}

function playSequences(i = 0) {
  if (i > sequences.length - 1) {
    mainElement.classList.remove("sequence-playing");
    return;
  }

  const sequenceElement = document.querySelector(`.sequence-col[data-color="${sequences[i]}"]`);

  timeoutStart = setTimeout(() => {
    sequenceElement.classList.add("active");
    mainElement.classList.add("sequence-playing");
    playVoice(sequences[i]);
    timeoutEnd = setTimeout(() => {
      sequenceElement.classList.remove("active");
      playSequences(i + 1);
    }, sequenceDelay);
  }, sequenceDelay);
}

function startGame() {
  mainMenuStartGameButton.textContent = "Stop Game";
  mainMenuStartGameButton.classList.replace("btn-dark", "btn-danger");
  isGameStarted = true;

  mainMenuModal.hide();
  generateSequence();
  playSequences();

  playBgm(true);

  mainMenuCloseButton.classList.replace("d-none", "d-block");
}

function stopGame() {
  mainMenuStartGameButton.textContent = "Start Game";
  mainMenuStartGameButton.classList.replace("btn-danger", "btn-dark");
  isGameStarted = false;
  playerMoveLength = 0;
  sequences.length = 0;
  stage = 1;

  if (timeoutStart && timeoutEnd) {
    clearTimeout(timeoutStart);
    clearTimeout(timeoutEnd);
  }

  const activeElement = document.querySelector(".sequence-col.active");
  if (activeElement) {
    activeElement.classList.remove("active");
  }

  if (mainElement.classList.contains("sequence-playing")) {
    mainElement.classList.remove("sequence-playing");
  }

  if (currentPlayingVoice) {
    currentPlayingVoice.pause();
    currentPlayingVoice.currentTime = 0;
  }

  mainMenuCloseButton.classList.replace("d-block", "d-none");
  stageCompletionBar.style.width = "0%";
  currentStageElement.textContent = "1";

  playBgm(false);
}

sequenceButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (!isGameStarted) return;

    const target = e.currentTarget;
    const targetColor = target.dataset.color;

    const isCorrect = targetColor === sequences[playerMoveLength];

    playsequenceStatePlayback(isCorrect);

    if (isCorrect) {
      console.log("Correct!");
      playerMoveLength += 1;

      stageCompletionBar.style.width = (playerMoveLength / stage) * 100 + "%";

      if (playerMoveLength > sequences.length - 1) {
        setTimeout(() => {
          stageCompletionBar.style.width = "0%";
        }, 250);

        playerMoveLength = 0;
        generateSequence();
        playSequences();
        stage++;
        currentStageElement.textContent = stage;
      }
    } else {
      console.log("Wrong!");

      expectedMovesElement.innerHTML = "";
      playerMovesElement.innerHTML = "";

      const playerMovesArray = sequences.slice(0, playerMoveLength);
      playerMovesArray.push(targetColor);
      stageReachedElement.textContent = stage;

      expectedMovesElement.appendChild(generateMovesSpan(sequences));
      playerMovesElement.appendChild(generateMovesSpan(playerMovesArray));

      stopGame();

      resultModal.show();
    }
  });
});

mainMenuStartGameButton.addEventListener("click", (e) => {
  if (isGameStarted) {
    stopGame();
  } else {
    startGame();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  mainMenuModal.show();
});

goToMainMenuButton.addEventListener("click", () => {
  resultModal.hide();
  mainMenuModal.show();
});

retryButton.addEventListener("click", () => {
  resultModal.hide();
  startGame();
});

voiceVolumeConfigInput.addEventListener("input", (e) => {
  const val = parseFloat(e.currentTarget.value);
  voiceVolumeConfigInputIndicator.textContent = val;

  setVoiceVolume(val);
});

bgmVolumeConfigInput.addEventListener("input", (e) => {
  const val = parseFloat(e.currentTarget.value);
  bgmVolumeConfigInputIndicator.textContent = val;
  bgmElement.volume = val;
});

sequenceDelayConfigInput.addEventListener("input", (e) => {
  const val = parseInt(e.currentTarget.value);
  sequenceDelayConfigInputIndicator.textContent = val + "ms";

  sequenceDelay = val;
  document.documentElement.style.setProperty("--sequence-delay-transition", val + "ms");
});

sequenceTransitionSelection.addEventListener("change", (e) => {
  const val = e.currentTarget.value;

  document.documentElement.style.setProperty("--sequence-timing-function", val);
});
fullScreenModeCheckbox.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

function dvhUnitTest() {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.opacity = "0";
  div.style.height = "100dvh";

  document.body.appendChild(div);
  const isSupported = div.offsetHeight > 0;
  document.body.removeChild(div);
  return isSupported;
}

const isSupportDvh = dvhUnitTest();

if (!isSupportDvh) {
  console.log('this run and should be work!')
  document.documentElement.style.setProperty("--height-screen", window.innerHeight + "px");

  window.addEventListener("resize", () => {
    document.documentElement.style.setProperty("--height-screen", window.innerHeight + "px");
  });
}

console.log(isSupportDvh);
