export default class Model {
  constructor() {
    // Initializes the model with default game data
    this.data = {
      sequences: [], // List of colors for the sequence
      stage: 1, // Current stage of the game
      playerMoveLength: 0, // Number of moves made by the player
      sequenceDelay: 600, // Delay between sequence colors in milliseconds
      isGameStarted: false, // Game start status

      voiceVolume: 0.3, // Initial voice volume level
      bgmVolume: 0.6, // Initial background music volume level
    };
  }

  // Getter for the sequence array
  get sequences() {
    return this.data.sequences;
  }

  // Getter for the current stage
  get stage() {
    return this.data.stage;
  }

  // Getter for the number of player moves
  get playerMoveLength() {
    return this.data.playerMoveLength;
  }

  // Getter for the delay between sequence colors
  get sequenceDelay() {
    return this.data.sequenceDelay;
  }

  // Getter for game start status
  get isGameStarted() {
    return this.data.isGameStarted;
  }

  // Getter for the voice volume level
  get voiceVolume() {
    return this.data.voiceVolume;
  }

  // Getter for the background music volume level
  get bgmVolume() {
    return this.data.bgmVolume;
  }

  // Setter for the current stage
  set stage(value) {
    this.data.stage = value;
  }

  // Setter for the number of player moves
  set playerMoveLength(value) {
    this.data.playerMoveLength = value;
  }

  // Setter for the delay between sequence colors
  set sequenceDelay(value) {
    this.data.sequenceDelay = value;
  }

  // Setter for game start status
  set isGameStarted(boolean) {
    this.data.isGameStarted = boolean;
  }

  // Determines if the game should move to the next stage
  isMoveToNextStage() {
    return this.playerMoveLength > this.data.sequences.length - 1;
  }

  // Sets the game to its start state or resets it
  setToGameStartState(boolean) {
    if (boolean) {
      this.isGameStarted = true;
      this.generateSequence(); // Generate an initial sequence when starting
    } else {
      this.isGameStarted = false;
      this.stage = 1;
      this.playerMoveLength = 0;
      this.data.sequences.length = 0; // Clear the sequence array
    }
  }

  // Generates a random sequence of colors
  generateSequence() {
    const colors = ["yellow", "blue", "red", "green"];
    const randIndex = Math.floor(Math.random() * colors.length);

    this.data.sequences.push(colors[randIndex]);
  }

  // Checks if the provided color matches the expected color in the sequence
  checkSequenceColor(color) {
    return this.data.sequences[this.data.playerMoveLength] === color;
  }
}
