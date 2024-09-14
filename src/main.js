import Model from "./mvc/model.js";
import View from "./mvc/view.js";
import Controller from "./mvc/controller.js";

document.addEventListener("DOMContentLoaded", (e) => {
  const model = new Model();
  const view = new View();
  const controller = new Controller(model, view);

  controller.init();
});
