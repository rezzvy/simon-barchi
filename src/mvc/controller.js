class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.current = {};
  }

  init() {
    this.view.disableBoard(true);

    this.view.startGameButton.addEventListener("click", (e) => {
      this.startGameClickHandler(e);
    });

    this.view.modalFailedCloseButton.addEventListener("click", (e) => {
      this.view.showElement(this.view.modalFailedElement, false);
    });

    this.view.modalFailedReplayButton.addEventListener("click", (e) => {
      this.view.showElement(this.view.modalFailedElement, false);

      this.__gameStart();
    });

    this.view.boardElements.forEach((board) => {
      if (isTouchDevice) {
        return board.addEventListener("touchstart", (e) => {
          this.boardClickHandler(e);
        });
      }

      board.addEventListener("click", (e) => {
        this.boardClickHandler(e);
      });
    });
  }

  playSequences(i = 0) {
    if (i >= this.model.sequences.length) {
      this.view.showElement(this.view.waitSequenceIndicatorElement, false);
      this.view.disableBoard(false);
      return;
    }

    if (i === 0) {
      this.view.disableBoard(true);
      this.view.showElement(this.view.waitSequenceIndicatorElement, true);
    }

    const currentBoard = document.querySelector(`[data-color="${this.model.sequences[i]}"]`);
    const currentBoardAudio = this.view.getAudioElement(this.model.sequences[i]);

    this.current.sequenceTimeOutStart = setTimeout(() => {
      this.__sequenceShow(currentBoard, currentBoardAudio);

      this.current.sequenceTimeOutEnd = setTimeout(() => {
        this.__sequenceRemove(currentBoard, currentBoardAudio);
        this.playSequences(i + 1);
      }, currentBoardAudio.duration * 1000);
    }, (currentBoardAudio.duration / 2) * 1000);
  }

  __sequenceShow(currentBoard, currentBoardAudio) {
    this.view.showHighlightedBoard(currentBoard, true);
    currentBoardAudio.play();
  }

  __sequenceRemove(currentBoard) {
    this.view.showHighlightedBoard(currentBoard, false);
  }

  startGameClickHandler(e) {
    const flag = e.currentTarget.textContent.toLowerCase();

    if (flag === "start") {
      e.currentTarget.textContent = "Stop";
      this.__gameStart(e);
      return;
    }

    this.__gameStop(e);
  }

  __gameStart() {
    this.view.gameReset();
    this.model.gameReset();
    this.view.startGameButton.textContent = "Stop";

    this.model.isGameStarted = true;
    this.view.disableBoard(false);
    this.view.playAudioElement("bg");
    this.model.generateRandomSequence();
    this.playSequences();
  }

  __gameStop() {
    this.view.gameReset();
    this.model.gameReset();
    this.view.startGameButton.textContent = "Start";

    this.view.setScoreBoard(1, "NULL", "NULL");
    clearTimeout(this.current.sequenceTimeOutStart);
    clearTimeout(this.current.sequenceTimeOutEnd);
  }

  boardClickHandler(e) {
    if (!this.model.isGameStarted || this.model.isGameOver) return;

    const event = e.currentTarget;
    if (this.model.checkSequence(event.dataset.color)) {
      this.__boardClickCorrect();
      if (this.model.playerMoveLength >= this.model.sequences.length) {
        return this.__boardClickMoveToNextStage();
      }
      return;
    }
    this.__boardClickWrong();
  }

  __boardClickCorrect() {
    this.model.playerMoveLength++;
    this.view.playAudioElement("correct");
    this.view.updateCurrentProgressIndicator(this.model.playerMoveLength, this.model.currentStage);
  }

  __boardClickWrong() {
    this.view.gameReset();
    this.model.isGameOver = true;

    this.view.playAudioElement("wrong");
    this.view.showElement(this.view.modalFailedElement, true);

    const scoreInformation = this.model.getLatestSequenceInformation();
    this.view.setScoreBoard(scoreInformation.stage, scoreInformation.expected, scoreInformation.selected);
  }

  __boardClickMoveToNextStage() {
    setTimeout(() => {
      this.view.resetCurrentProgressIndicator();
    }, 250);

    this.model.playerMoveLength = 0;
    this.model.currentStage++;
    this.view.updateCurrentStageLength(this.model.currentStage);

    this.model.generateRandomSequence();
    this.playSequences();
  }
}

export default GameController;
