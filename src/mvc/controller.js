export default class Controller {
  // Initializes the Controller with the model and view
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Internal variables for managing timeouts
    this.timeoutStart = "";
    this.timeoutEnd = "";
  }

  // Sets up the initial state and event listeners for the view
  init() {
    // Show the main menu modal and set initial volume levels
    this.view.showMainMenuModal(true);
    this.view.setVoiceVolume(this.model.voiceVolume);
    this.view.setBgmVolume(this.model.bgmVolume);

    // Adjust height of the screen for devices without DVH support
    if (!this.#isDvhUnitSupported()) {
      document.documentElement.style.setProperty("--height-screen", window.innerHeight + "px");
      window.addEventListener("resize", () => {
        document.documentElement.style.setProperty("--height-screen", window.innerHeight + "px");
      });
    }

    // Add click event listeners for sequence buttons
    this.view.sequenceButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.sequenceButtonHandler(e);
      });
    });

    // Start or stop the game based on the current state
    this.view.mainMenuStartGameButton.addEventListener("click", (e) => {
      if (this.model.isGameStarted) {
        this.stopGame();
      } else {
        this.startGame();
      }
    });

    // Navigate back to the main menu
    this.view.goToMainMenuButton.addEventListener("click", (e) => {
      this.view.showResultModal(false);
      this.view.showMainMenuModal(true);
    });

    // Retry the game after showing the result modal
    this.view.retryButton.addEventListener("click", (e) => {
      this.view.showResultModal(false);
      this.startGame();
    });

    // Update voice volume based on user input
    this.view.voiceVolumeConfigInput.addEventListener("input", (e) => {
      this.view.setRangeInputIndicator("voiceVolumeConfig", e.currentTarget.value);
      this.view.setVoiceVolume(e.currentTarget.value);
    });

    // Update BGM volume based on user input
    this.view.bgmVolumeConfigInput.addEventListener("input", (e) => {
      this.view.setRangeInputIndicator("bgmVolumeConfig", e.currentTarget.value);
      this.view.setBgmVolume(e.currentTarget.value);
    });

    // Update sequence delay based on user input
    this.view.sequenceDelayConfigInput.addEventListener("input", (e) => {
      this.model.sequenceDelay = parseInt(e.currentTarget.value);
      this.view.setRangeInputIndicator("sequenceDelayConfig", e.currentTarget.value + "ms");
      this.view.setRootVariable("--sequence-delay-transition", e.currentTarget.value + "ms");
    });

    // Update sequence timing function based on user selection
    this.view.sequenceTransitionSelection.addEventListener("change", (e) => {
      this.view.setRootVariable("--sequence-timing-function", e.currentTarget.value);
    });

    // Toggle fullscreen mode based on checkbox state
    this.view.fullScreenModeCheckbox.addEventListener("change", (e) => {
      const target = e.target;
      if (target.checked) {
        this.view.goFullScreen(true);
      } else {
        this.view.goFullScreen(false);
      }
    });
  }

  // Handles button clicks in the sequence
  sequenceButtonHandler(event) {
    if (!this.model.isGameStarted) return;

    const target = event.currentTarget;
    const targetColor = target.dataset.color;
    const isCorrect = this.model.checkSequenceColor(targetColor);

    // Provide audio feedback and update game state based on correctness
    this.view.playsequenceStatePlayback(isCorrect);

    if (isCorrect) {
      this.model.playerMoveLength += 1;
      this.view.updateStageCompletionBar(this.model.playerMoveLength, this.model.stage);

      if (this.model.isMoveToNextStage()) {
        this.view.resetStageCompletionBar();
        this.model.playerMoveLength = 0;
        this.model.stage += 1;
        this.view.setCurrentStage(this.model.stage);

        this.model.generateSequence();
        this.playSequence();
      }
      return;
    }

    // Handle incorrect sequence
    this.view.setStageReached(this.model.stage);
    this.view.clearGeneratedMovesItem();
    this.view.setMovesResult("expectedMoves", this.model.sequences);
    this.view.setMovesResult("playerMoves", this.model.sequences, this.model.playerMoveLength, targetColor);

    this.stopGame();
    this.view.showResultModal(true);
  }

  // Starts the game and begins the sequence playback
  startGame() {
    this.view.setToGameStartState(true);
    this.model.setToGameStartState(true);
    this.playSequence();
  }

  // Stops the game and clears any active timeouts
  stopGame() {
    this.view.setToGameStartState(false);
    this.model.setToGameStartState(false);
    if (this.timeoutStart && this.timeoutEnd) {
      clearTimeout(this.timeoutStart);
      clearTimeout(this.timeoutEnd);
    }
  }

  // Plays the sequence of colors with delay
  playSequence(i = 0) {
    if (i > this.model.sequences.length - 1) {
      this.view.sequenceOnPlay(false);
      return;
    }

    this.view.sequenceOnPlay(true);

    this.timeoutStart = setTimeout(() => {
      this.view.highlightSequence(true, this.model.sequences[i]);
      this.timeoutEnd = setTimeout(() => {
        this.view.highlightSequence(false, this.model.sequences[i]);
        this.playSequence(i + 1);
      }, this.model.sequenceDelay);
    }, this.model.sequenceDelay);
  }

  // Checks if the DVH unit is supported
  #isDvhUnitSupported() {
    return CSS.supports("height", "100dvh");
  }

  // Previous approach to detect if DVH unit is supported, which was a manual method
  /* #dvhUnitTest() {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.opacity = "0";
    div.style.height = "100dvh";
  
    document.body.appendChild(div);
    const isSupported = div.offsetHeight > 0;
    document.body.removeChild(div);
    return isSupported;
  }*/
}
