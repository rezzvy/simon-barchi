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

const sequences = [];
let isGameStarted = false;
let playerMoveLength = 0;
let stage = 1;

let timeoutStart = "";
let timeoutEnd = "";

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
    timeoutEnd = setTimeout(() => {
      sequenceElement.classList.remove("active");
      playSequences(i + 1);
    }, 500);
  }, 500);
}

function startGame() {
  mainMenuStartGameButton.textContent = "Stop Game";
  mainMenuStartGameButton.classList.replace("btn-dark", "btn-danger");
  isGameStarted = true;

  mainMenuModal.hide();
  generateSequence();
  playSequences();

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

  mainMenuCloseButton.classList.replace("d-block", "d-none");
  stageCompletionBar.style.width = "0%";
  currentStageElement.textContent = "1";
 
}

sequenceButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (!isGameStarted) return;

    const target = e.currentTarget;
    const targetColor = target.dataset.color;

    if (targetColor === sequences[playerMoveLength]) {
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
