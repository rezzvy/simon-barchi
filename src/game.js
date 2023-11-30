class GameModel {
  constructor() {
    this.isPlayingCompleted = false;
    this.moves = [];

    this.isGameOver = false;
    this.isGameStarted = false;

    this.playerMoveCount = 0;
    this.currentStage = 1;

    this.latestCheck = {};
  }

  getMovesInformation() {
    const playerMoveArray = this.moves.slice(0, this.playerMoveCount + 1);
    playerMoveArray.pop();
    playerMoveArray.push(this.latestCheck.selectedColor);

    return {
      currentStage: this.currentStage,
      expected: this.moves.join(" "),
      playerMove: playerMoveArray.join(" "),
    };
  }

  getRandomColor() {
    return ["🔵", "🔴", "🟡", "🟢"][Math.floor(Math.random() * 4)];
  }

  generateRandomMove() {
    if (this.moves.length <= 4) {
      const latestItem = this.moves[this.moves.length - 1];
      let randomColor = this.getRandomColor();

      for (let i = 0; i < 100; i++) {
        if (latestItem === randomColor) {
          console.log(i);
          randomColor = this.getRandomColor();
          continue;
        }

        break;
      }

      this.moves.push(randomColor);
      return;
    }

    this.moves.push(this.getRandomColor());
  }

  checkCorrect(move) {
    this.latestCheck.currentColor = this.moves[this.playerMoveCount];
    this.latestCheck.selectedColor = move;
    return this.moves[this.playerMoveCount] === move ? true : false;
  }
}

class GameView {
  constructor() {
    this.gameBoardElements = document.querySelectorAll(".game-board");

    this.gameCurrentStageElement = document.querySelector("._stage-count");
    this.gameStageProgressElement = document.querySelector(".game-stage-progress");

    this.gameModalFailedElement = document.querySelector("#modal-failed");
    this.gameGeneratedMovesElement = document.querySelector(".generated-moves");
    this.gamePlayerMadeMoveElement = document.querySelector(".player-moves");
    this.gameScoreCurrentStageElement = document.querySelector(".score-stage-reached");

    this.modalCloseBtnElement = document.querySelector("#modal-close");
    this.modalReplayBtnElement = document.querySelector("#replay");

    this.gameStartBtnElement = document.querySelector("#start-btn");

    this.waitingIndicatorElement = document.querySelector(".waiting");

    this.getAudio("bg").volume = 0.45;
  }

  setWait(bool) {
    if (bool) {
      this.waitingIndicatorElement.classList.remove("none");
      return;
    }
    this.waitingIndicatorElement.classList.add("none");
  }

  updateStage(length) {
    this.gameCurrentStageElement.textContent = length;
  }

  updateStageProgress(playerMoveCount, currentStage) {
    this.gameStageProgressElement.style.setProperty("--game-stage-progress-length", (playerMoveCount / currentStage) * 100 + "%");
  }

  resetStageProgress() {
    this.gameStageProgressElement.style.setProperty("--game-stage-progress-length", "0%");
  }

  getAudio(keyword) {
    return document.querySelector(`[data-audio="${keyword}"`);
  }

  playAudio(keyword) {
    const currentAudio = this.getAudio(keyword);

    if (!currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio.play();
  }

  disableBoard(bool) {
    if (bool) {
      return this.gameBoardElements.forEach((e) => {
        e.blur();
        e.classList.add("no-events");
      });
    }

    this.gameBoardElements.forEach((e) => {
      e.classList.remove("no-events");
    });
  }

  highlightBoard(board, bool) {
    if (bool) {
      board.classList.add("selected");
      return;
    }

    board.classList.remove("selected");
  }
}

class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.current = {};
  }

  init() {
    this.view.disableBoard(true);

    this.view.gameStartBtnElement.addEventListener("click", (e) => {
      this.startGameBtnHandler(e.currentTarget);
    });

    this.view.modalCloseBtnElement.addEventListener("click", (e) => {
      this.view.gameModalFailedElement.classList.add("none");

      this.view.gameScoreCurrentStageElement.textContent = "NULL";
      this.view.gameGeneratedMovesElement.textContent = "NULL";
      this.view.gamePlayerMadeMoveElement.textContent = "NULL";
    });

    this.view.modalReplayBtnElement.addEventListener("click", (e) => {
      this.view.gameModalFailedElement.classList.add("none");

      this.view.gameStartBtnElement.click();
    });

    this.view.gameBoardElements.forEach((board) => {
      if (isTouchDevice) {
        board.addEventListener("touchstart", (e) => {
          this.gameBoardClickHandler(e);
        });
        return;
      }

      board.addEventListener("click", (e) => {
        this.gameBoardClickHandler(e);
      });
    });
  }

  createGame() {
    this.view.disableBoard(false);
    this.model.isGameOver = false;
    this.model.isGameStarted = true;
    this.model.generateRandomMove();
    this.playAvailableMoves();
  }

  destroyGame() {
    this.view.disableBoard(true);
    this.view.gameBoardElements.forEach((e) => {
      e.classList.remove("selected");
    });
    document.querySelectorAll("audio").forEach((e) => {
      e.pause();
      e.currentTime = 0;
    });
    this.view.updateStage(1);
    this.view.resetStageProgress();
    this.model.isGameOver = false;
    this.model.isGameStarted = false;
    this.model.playerMoveCount = 0;
    this.model.currentStage = 1;
    this.model.moves.length = 0;

    clearTimeout(this.current.timeOutStart);
    clearTimeout(this.current.timeOutEnd);
  }

  startGameBtnHandler(e) {
    const flag = e.textContent;

    if (flag === "Start") {
      this.createGame();

      this.view.setWait(true);
      this.view.playAudio("bg");
      e.textContent = "Stop";
      return;
    }

    this.destroyGame();
    this.view.setWait(false);
    e.textContent = "Start";
  }

  playAvailableMoves(i = 0) {
    if (i >= this.model.moves.length) {
      this.view.disableBoard(false);
      this.view.setWait(false);
      return;
    }

    if (i === 0) {
      this.view.disableBoard(true);
    }

    const currentBoard = document.querySelector(`[data-color="${this.model.moves[i]}"]`);
    const currentAudio = this.view.getAudio(this.model.moves[i]);

    console.log(`
      CurrentBoard : ${currentBoard.dataset.color}
      CurrentAudio : ${currentAudio.dataset.audio}
      `);

    this.current.timeOutStart = setTimeout(() => {
      this.view.highlightBoard(currentBoard, true);
      currentAudio.play();
      this.current.timeOutEnd = setTimeout(() => {
        this.view.highlightBoard(currentBoard, false);
        this.playAvailableMoves(i + 1);
      }, currentAudio.duration * 1000);
    }, 500);
  }

  gameBoardClickHandler(e) {
    if (this.model.isGameOver || !this.model.isGameStarted) {
      return console.log("Board is not available!");
    }

    const event = e.currentTarget;
    console.log(`${event.dataset.color} Clicked!`);

    if (this.model.checkCorrect(event.dataset.color)) {
      this.model.playerMoveCount++;
      this.view.playAudio("correct");
      this.view.updateStageProgress(this.model.playerMoveCount, this.model.currentStage);

      if (this.model.playerMoveCount >= this.model.moves.length) {
        setTimeout(() => {
          this.view.resetStageProgress();
        }, 250);
        this.model.playerMoveCount = 0;

        this.model.currentStage++;
        this.view.updateStage(this.model.currentStage);
        this.model.generateRandomMove();
        this.view.setWait(true);
        this.playAvailableMoves();
        return;
      }

      return;
    }

    const info = this.model.getMovesInformation();
    this.destroyGame();

    this.view.playAudio("wrong");
    this.view.gameStartBtnElement.textContent = "Start";
    this.view.gameModalFailedElement.classList.remove("none");
    this.model.isGameOver = true;

    this.view.gameScoreCurrentStageElement.textContent = info.currentStage;
    this.view.gameGeneratedMovesElement.textContent = info.expected;
    this.view.gamePlayerMadeMoveElement.textContent = info.playerMove;
  }
}

const model = new GameModel();
const view = new GameView();
const controller = new GameController(model, view);

document.addEventListener("DOMContentLoaded", () => {
  controller.init();
});
