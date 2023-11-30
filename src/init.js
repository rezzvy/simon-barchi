const gameHeaderElement = document.getElementById("game-header");
const gameFooterElement = document.getElementById("game-footer");
const modalChildElement = document.getElementById("modal-failed").firstElementChild;
const freeZoneElement = document.querySelector(".free-zone");
const pointerElement = document.querySelector(".pointer");

function _pointer(bool) {
  bool ? pointerElement.classList.add("hide") : pointerElement.classList.remove("hide");
}

modalChildElement.addEventListener("mouseover", (e) => {
  _pointer(true);
});

modalChildElement.addEventListener("mouseout", (e) => {
  _pointer(false);
});

gameHeaderElement.addEventListener("mouseover", (e) => {
  _pointer(true);
});

gameHeaderElement.addEventListener("mouseout", (e) => {
  _pointer(false);
});

gameFooterElement.addEventListener("mouseover", (e) => {
  _pointer(true);
});

gameFooterElement.addEventListener("mouseout", (e) => {
  _pointer(false);
});

freeZoneElement.addEventListener("mouseover", (e) => {
  pointerElement.classList.add("gray-filter");
});

freeZoneElement.addEventListener("mouseout", (e) => {
  pointerElement.classList.remove("gray-filter");
});

window.addEventListener("mousemove", (e) => {
  pointerElement.style.top = e.clientY - 50 + "px";
  pointerElement.style.left = e.clientX - 50 + "px";
});
