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
    this.sequences.push(this.getRandomSequenceColor());
  }
}

export default GameModel;
