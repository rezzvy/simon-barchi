class GameView {
  constructor() {
    this.boardElements = document.querySelectorAll(".game-board");
    this.currentStageElement = document.querySelector("._stage-count");
    this.currentStageProgressElement = document.querySelector(".game-stage-progress");
    this.modalFailedElement = document.querySelector("#modal-failed");
    this.modalFailedCloseButton = document.querySelector("#modal-close");
    this.modalFailedReplayButton = document.querySelector("#replay");
    this.expectedSequenceBoxElement = document.querySelector(".generated-moves");
    this.selectedSequenceBoxElement = document.querySelector(".player-moves");
    this.reachedStageElement = document.querySelector(".score-stage-reached");
    this.startGameButton = document.querySelector("#start-btn");
    this.waitSequenceIndicatorElement = document.querySelector(".waiting");
  }

  disableBoard(boolean) {
    if (boolean) {
      return this.boardElements.forEach((board) => {
        board.classList.add("no-events");
      });
    }

    this.boardElements.forEach((board) => {
      board.classList.remove("no-events");
    });
  }

  clearBoard() {
    this.boardElements.forEach((board) => {
      board.classList.remove("selected");
    });
  }

  playAudioElement(keyword) {
    const currentAudio = this.getAudioElement(keyword);

    if (!currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio.play();
  }

  gameReset() {
    this.startGameButton.textContent = "Start";

    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    this.updateCurrentStageLength(1);
    this.resetCurrentProgressIndicator();
    this.showElement(this.waitSequenceIndicatorElement, false);
    this.disableBoard(true);
    this.clearBoard();
  }

  setScoreBoard(stage, expected, selected) {
    this.reachedStageElement.textContent = stage;
    this.expectedSequenceBoxElement.textContent = expected;
    this.selectedSequenceBoxElement.textContent = selected;
  }

  updateCurrentProgressIndicator(playerMoveLength, currentStage) {
    const calculation = (playerMoveLength / currentStage) * 100;
    this.currentStageProgressElement.style.setProperty("--game-stage-progress-length", `${calculation}%`);
  }

  resetCurrentProgressIndicator() {
    this.currentStageProgressElement.style.setProperty("--game-stage-progress-length", "0%");
  }

  updateCurrentStageLength(stage) {
    this.currentStageElement.textContent = stage;
  }

  getAudioElement(keyword) {
    return document.querySelector(`[data-audio="${keyword}"`);
  }

  showElement(element, boolean) {
    boolean ? element.classList.remove("none") : element.classList.add("none");
  }

  showHighlightedBoard(board, boolean) {
    boolean ? board.classList.add("selected") : board.classList.remove("selected");
  }
}

export default GameView;
