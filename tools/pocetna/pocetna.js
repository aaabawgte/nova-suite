const loaderEl = document.querySelector("#loader");
const appEl = document.querySelector("#app");

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initializeReactiveBackground() {
  if (prefersReducedMotion()) {
    return;
  }

  let animationFrame = null;
  let mouseX = 50;
  let mouseY = 35;

  function updateMouseGlow() {
    document.documentElement.style.setProperty("--mouse-x", `${mouseX}%`);
    document.documentElement.style.setProperty("--mouse-y", `${mouseY}%`);
    animationFrame = null;
  }

  window.addEventListener("pointermove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 100;
    mouseY = (event.clientY / window.innerHeight) * 100;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(updateMouseGlow);
    }
  });
}

function runIntroLoader() {
  if (!loaderEl || !appEl) {
    return;
  }

  if (prefersReducedMotion()) {
    loaderEl.remove();
    appEl.classList.remove("app-hidden");
    appEl.classList.add("app-visible");
    return;
  }

  window.setTimeout(() => {
    loaderEl.classList.add("loader-exit");
  }, 950);

  window.setTimeout(() => {
    appEl.classList.remove("app-hidden");
    appEl.classList.add("app-visible");
  }, 1450);

  window.setTimeout(() => {
    loaderEl.remove();
  }, 2850);
}

initializeReactiveBackground();
runIntroLoader();
