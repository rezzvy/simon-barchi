export default class View {
  constructor() {
    // Initialize modals and buttons from the DOM
    this.mainMenuModal = new bootstrap.Modal(document.getElementById("main-menu-modal"));
    this.resultModal = new bootstrap.Modal(document.getElementById("result-modal"));
    this.mainMenuStartGameButton = document.getElementById("main-menu-start-game-btn");
    this.mainElement = document.querySelector("main");
    this.sequenceButtons = document.querySelectorAll(".sequence-col");
    this.stageReachedElement = document.querySelector("#stage-reached").lastElementChild;
    this.expectedMovesElement = document.getElementById("expected-moves");
    this.playerMovesElement = document.getElementById("player-moves");
    this.retryButton = document.getElementById("retry-btn");
    this.goToMainMenuButton = document.getElementById("go-to-main-menu-btn");
    this.mainMenuCloseButton = document.getElementById("main-menu-close-btn");
    this.currentStageElement = document.getElementById("current-stage");
    this.stageCompletionBar = document.querySelector("#stage-completion-bar").firstElementChild;
    this.voiceVolumeConfigContainer = document.getElementById("voice-vol-config");
    this.voiceVolumeConfigInputIndicator = this.voiceVolumeConfigContainer.querySelector(".badge");
    this.voiceVolumeConfigInput = this.voiceVolumeConfigContainer.querySelector("input");
    this.bgmVolumeConfigContainer = document.getElementById("bgm-vol-config");
    this.bgmVolumeConfigInputIndicator = this.bgmVolumeConfigContainer.querySelector(".badge");
    this.bgmVolumeConfigInput = this.bgmVolumeConfigContainer.querySelector("input");
    this.sequenceDelayConfigContainer = document.getElementById("sequence-delay-config");
    this.sequenceDelayConfigInputIndicator = this.sequenceDelayConfigContainer.querySelector(".badge");
    this.sequenceDelayConfigInput = this.sequenceDelayConfigContainer.querySelector("input");
    this.sequenceTransitionSelection = document.getElementById("sequence-transition-selection");
    this.fullScreenModeCheckbox = document.getElementById("full-screen-mode");

    // Initialize audio elements
    this.voiceElements = {
      yellow: document.querySelector('audio[data-audio="yellow"]'),
      blue: document.querySelector('audio[data-audio="blue"]'),
      red: document.querySelector('audio[data-audio="red"]'),
      green: document.querySelector('audio[data-audio="green"]'),
    };
    this.sequenceStatePlaybackElements = {
      true: document.querySelector('audio[data-audio="correct"]'),
      false: document.querySelector('audio[data-audio="wrong"]'),
    };
    this.bgmElement = document.querySelector('audio[data-audio="bgm"]');

    this.currentPlayingVoice = ""; // Track the currently playing voice audio
    this.currentPlayingSequenceStatePlayback = ""; // Track the currently playing sequence state audio
  }

  // Private method to play a given audio element, pausing any previous audio
  #playAudio(audio, prev) {
    if (prev !== "" && !prev.paused) {
      prev.pause();
      prev.currentTime = 0;
    }

    audio.play();
    return audio;
  }

  // Play the audio associated with a specific color
  playVoice(color) {
    const audio = this.voiceElements[color];
    this.currentPlayingVoice = this.#playAudio(audio, this.currentPlayingVoice);
  }

  // Play the audio indicating whether the sequence state is correct or wrong
  playsequenceStatePlayback(boolean) {
    const audio = this.sequenceStatePlaybackElements[boolean];
    this.currentPlayingSequenceStatePlayback = this.#playAudio(audio, this.currentPlayingSequenceStatePlayback);
  }

  // Play or stop background music based on the boolean flag
  playBgm(boolean) {
    if (boolean) {
      this.bgmElement.play();
    } else {
      if (!this.bgmElement.paused) {
        this.bgmElement.pause();
        this.bgmElement.currentTime = 0;
      }
    }
  }

  // Set the volume for all voice audio elements
  setVoiceVolume(vol) {
    Object.keys(this.voiceElements).forEach((key) => {
      this.voiceElements[key].volume = parseFloat(vol);
    });
  }

  // Set the volume for the background music
  setBgmVolume(vol) {
    this.bgmElement.volume = parseFloat(vol);
  }

  // Update the stage completion bar width based on player's progress
  updateStageCompletionBar(playerMoveLength, stage) {
    this.stageCompletionBar.style.width = (playerMoveLength / stage) * 100 + "%";
  }

  // Reset the stage completion bar to full width then clear it
  resetStageCompletionBar() {
    this.stageCompletionBar.style.width = "100%";

    setTimeout(() => {
      this.stageCompletionBar.style.width = "0%";
    }, 250);
  }

  // Display the current stage number
  setCurrentStage(stage) {
    this.currentStageElement.textContent = stage;
  }

  // Display the stage number that was reached
  setStageReached(stage) {
    this.stageReachedElement.textContent = stage;
  }

  // Clear any previously generated moves from the UI
  clearGeneratedMovesItem() {
    this.expectedMovesElement.innerHTML = "";
    this.playerMovesElement.innerHTML = "";
  }

  // Display the expected and player moves results
  setMovesResult(moveType, sequences, moveLength = null, latestMove = null) {
    const fragment = document.createDocumentFragment();
    let array = null;

    // Choose the array based on move type
    if (moveType === "expectedMoves") {
      array = sequences;
    } else {
      array = sequences.slice(0, moveLength);
      array.push(latestMove);
    }

    // Create and append span elements for each move
    for (let i = 0; i < sequences.length; i++) {
      const span = document.createElement("span");
      span.style.setProperty("--color", array[i]);

      fragment.appendChild(span);
    }

    const element = moveType === "expectedMoves" ? this.expectedMovesElement : this.playerMovesElement;

    element.appendChild(fragment);
  }

  // Show or hide the result modal
  showResultModal(boolean) {
    boolean ? this.resultModal.show() : this.resultModal.hide();
  }

  // Show or hide the main menu modal
  showMainMenuModal(boolean) {
    boolean ? this.mainMenuModal.show() : this.mainMenuModal.hide();
  }

  // Highlight a sequence button and play the corresponding voice
  highlightSequence(boolean, color) {
    const element = document.querySelector(`.sequence-col[data-color="${color}"]`);

    if (boolean) {
      element.classList.add("active");
      this.playVoice(element.dataset.color);
    } else {
      element.classList.remove("active");
    }
  }

  // Add or remove the "sequence-playing" class from the main element
  sequenceOnPlay(boolean) {
    if (boolean) {
      this.mainElement.classList.add("sequence-playing");
    } else {
      this.mainElement.classList.remove("sequence-playing");
    }
  }

  // Set the game start state and update UI elements accordingly
  setToGameStartState(boolean) {
    if (boolean) {
      this.mainMenuStartGameButton.textContent = "Stop Game";
      this.mainMenuStartGameButton.classList.replace("btn-dark", "btn-danger");
      this.mainMenuCloseButton.classList.replace("d-none", "d-block");

      this.showMainMenuModal(false);
      this.playBgm(true);
    } else {
      this.mainMenuStartGameButton.textContent = "Start Game";
      this.mainMenuStartGameButton.classList.replace("btn-danger", "btn-dark");
      this.mainMenuCloseButton.classList.replace("d-block", "d-none");

      this.stageCompletionBar.style.width = "0%";
      this.currentStageElement.textContent = "1";

      if (this.currentPlayingVoice) {
        this.currentPlayingVoice.pause();
        this.currentPlayingVoice.currentTime = 0;
      }

      this.playBgm(false);
      this.sequenceOnPlay(false);

      const activeElement = document.querySelector(".sequence-col.active");
      if (activeElement) {
        activeElement.classList.remove("active");
      }
    }
  }

  // Toggle fullscreen mode
  goFullScreen(boolean) {
    if (boolean) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Set a CSS variable on the root element
  setRootVariable(property, val) {
    document.documentElement.style.setProperty(property, val);
  }

  // Update the indicator text for range input elements
  setRangeInputIndicator(inputName, value) {
    const key = inputName + "InputIndicator";

    this[key].textContent = value;
  }
}
