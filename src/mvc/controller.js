class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.current = {};
  }

  init() {
    this.syncUserSettings();
    this.view.disableBoard(true);

    this.view.settingButton.addEventListener("click", (e) => {
      this.view.modalSettingElement.classList.remove("none");
    });

    this.view.saveGameSettingBtn.addEventListener("click", (e) => {
      this.saveGameSettingHandler();
    });

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

    this.view.volumeSetElements.forEach((element) => {
      element.addEventListener("input", (e) => {
        this.setVolumeChangeHandler(e);
      });
    });

    this.view.sequenceSpeedInputRangeElement.addEventListener("input", (e) => {
      this.model.sequenceSpeed = parseInt(e.currentTarget.value);

      document.documentElement.style.setProperty("--transition-pattern", `${e.currentTarget.value}ms cubic-bezier(0.22, 0.68, 0, 1.71)`);
    });

    this.view.sequenceSpeeSetElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        const flag = e.currentTarget.dataset.setting;

        if (flag === "speed-costum") {
          this.model.sequencePlayType = "costum_length";
          this.model.sequenceSpeed = parseInt(this.view.sequenceSpeedInputRangeElement.value);
          this.view.sequenceSpeedInputRangeElement.disabled = false;
          return;
        }

        this.model.sequencePlayType = "audio_length";
        this.view.sequenceSpeedInputRangeElement.disabled = true;
        document.documentElement.style.setProperty("--transition-pattern", "");
      });
    });
  }

  syncUserSettings() {
    const settings = this.model.getUserSettings();

    if (settings) {
      this.view.syncUserSettings(true, settings);
      this.model.sequencePlayType = settings.sequenceSpeed.type;

      if (this.model.sequencePlayType !== "audio_length") {
        this.model.sequenceSpeed = settings.sequenceSpeed.value;
        document.documentElement.style.setProperty("--transition-pattern", `${settings.sequenceSpeed.value}ms cubic-bezier(0.22, 0.68, 0, 1.71)`);
      }

      return;
    }

    this.saveGameSettingHandler();
    this.model.sequencePlayType = "audio_length";
  }

  playSequences(i = 0) {
    if (i >= this.model.sequences.length) {
      this.view.showElement(this.view.waitSequenceIndicatorElement, false);
      this.view.disableBoard(false);
      this.model.isSequenceCompleted = true;
      return;
    }

    if (i === 0) {
      this.model.isSequenceCompleted = false;
      this.view.disableBoard(true);
      this.view.showElement(this.view.waitSequenceIndicatorElement, true);
    }

    const currentBoard = document.querySelector(`[data-color="${this.model.sequences[i]}"]`);
    const currentBoardAudio = this.view.getAudioElement(this.model.sequences[i]);

    const speed = this.model.sequencePlayType === "audio_length" ? currentBoardAudio.duration * 1000 : this.model.sequenceSpeed;

    this.current.sequenceTimeOutStart = setTimeout(() => {
      this.__sequenceShow(currentBoard, currentBoardAudio);

      this.current.sequenceTimeOutEnd = setTimeout(() => {
        this.__sequenceRemove(currentBoard, currentBoardAudio);
        this.playSequences(i + 1);
      }, speed);
    }, speed / 2);
  }

  __sequenceShow(currentBoard, currentBoardAudio) {
    if (this.model.sequencePlayType === "audio_length") {
      currentBoardAudio.play();
    }

    this.view.showHighlightedBoard(currentBoard, true);
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

  setVolumeChangeHandler(e) {
    const event = e.currentTarget;
    this.view.setAudioElementVolume(event.dataset.audio, event.value);
  }

  saveGameSettingHandler() {
    const obj = {};
    this.view.volumeSetElements.forEach((element) => {
      obj[element.dataset.audio] = parseFloat(element.value);
    });

    this.view.sequenceSpeeSetElements.forEach((element) => {
      if (element.dataset.setting === "speed-based" && element.checked) {
        obj.sequenceSpeed = {
          type: "audio_length",
          value: "",
        };
      }

      if (element.dataset.setting === "speed-costum" && element.checked) {
        obj.sequenceSpeed = {
          type: "costum_length",
          value: this.model.sequenceSpeed,
        };
      }
    });

    this.model.storeUserSettings(obj);
  }
}

export default GameController;
