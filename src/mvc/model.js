class GameModel {
  constructor() {
    this.isSequenceCompleted = false;
    this.isGameOver = false;
    this.isGameStarted = false;
    this.sequences = [];

    this.currentStage = 1;
    this.playerMoveLength = 0;

    this.recentSequenceInformation = {
      expected: "",
      selected: "",
    };

    this.sequencePlayType = "";
    this.sequenceSpeed = 0;
  }

  storeUserSettings(obj) {
    localStorage.setItem(
      "simon-barchi-settings",
      JSON.stringify({
        bg: obj.bg,
        "🟢": obj["🟢"],
        "🔴": obj["🔴"],
        "🟡": obj["🟡"],
        "🔵": obj["🔵"],
        correct: obj["correct"],
        wrong: obj["wrong"],
        sequenceSpeed: {
          type: obj.sequenceSpeed.type,
          value: obj.sequenceSpeed.value,
        },
      })
    );
  }

  gameReset() {
    this.isSequenceCompleted = false;
    this.isGameOver = false;
    this.isGameStarted = false;
    this.sequences = [];

    this.currentStage = 1;
    this.playerMoveLength = 0;
  }

  getLatestSequenceInformation() {
    const currentSequence = this.sequences.slice(0, this.playerMoveLength + 1);
    currentSequence.pop();
    currentSequence.push(this.recentSequenceInformation.selected);

    return {
      stage: this.currentStage,
      expected: this.sequences.join(" "),
      selected: currentSequence.join(" "),
    };
  }

  checkSequence(color) {
    this.updateRecentSequenceInformation(color);
    return this.sequences[this.playerMoveLength] === color ? true : false;
  }

  updateRecentSequenceInformation(color) {
    this.recentSequenceInformation.expected = this.sequences[this.playerMoveLength];
    this.recentSequenceInformation.selected = color;
  }

  getRandomSequenceColor() {
    return ["🔵", "🔴", "🟡", "🟢"][Math.floor(Math.random() * 4)];
  }

  generateRandomSequence() {
    if (this.sequences.length < 4) {
      for (let i = 0; i < 50; i++) {
        const randomSequence = this.getRandomSequenceColor();
        if (!this.sequences.includes(randomSequence)) {
          this.sequences.push(randomSequence);
          break;
        }
      }
      return;
    }

    this.sequences.push(this.getRandomSequenceColor());
  }

  getUserSettings() {
    return JSON.parse(localStorage.getItem("simon-barchi-settings"));
  }
}

export default GameModel;
