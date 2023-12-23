import GameModel from "./mvc/model.js";
import GameView from "./mvc/view.js";
import GameController from "./mvc/controller.js";

const model = new GameModel();
const view = new GameView();
const controller = new GameController(model, view);

document.addEventListener("DOMContentLoaded", () => {
  controller.init();
});
