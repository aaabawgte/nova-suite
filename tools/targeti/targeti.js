const salesTargetInput = document.querySelector("#salesTarget");
const sdTargetInput = document.querySelector("#sdTarget");
const crossTargetInput = document.querySelector("#crossTarget");
const workingDaysInput = document.querySelector("#workingDays");

const calculateBtn = document.querySelector("#calculateBtn");
const resetBtn = document.querySelector("#resetBtn");
const errorEl = document.querySelector("#error");
const resultsEl = document.querySelector("#results");

const salesDailyEl = document.querySelector("#salesDaily");
const sdDailyEl = document.querySelector("#sdDaily");
const crossDailyEl = document.querySelector("#crossDaily");
const salesWeeklyEl = document.querySelector("#salesWeekly");
const sdWeeklyEl = document.querySelector("#sdWeekly");
const crossWeeklyEl = document.querySelector("#crossWeekly");

const loaderEl = document.querySelector("#loader");
const appEl = document.querySelector("#app");

const animationDuration = 650;
const workingDaysPerWeek = 5;

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

  window.addEventListener("pointerleave", () => {
    mouseX = 50;
    mouseY = 35;

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

function formatEuro(value) {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function parseNumber(value) {
  const normalizedValue = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalizedValue);
}

function formatInputValue(input) {
  const value = parseNumber(input.value);

  if (!Number.isFinite(value) || value < 0) {
    return;
  }

  input.value = new Intl.NumberFormat("hr-HR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function revealSection(section) {
  section.classList.remove("hidden");
  restartAnimation(section, "is-revealing");
}

function markInvalidInput(element) {
  restartAnimation(element, "input-error");
}

function clearInvalidState(element) {
  element.classList.remove("input-error");
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  errorEl.classList.add("error");
  restartAnimation(errorEl, "error-shake");
}

function hideError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

function setButtonLoading(button, isLoading) {
  button.classList.toggle("is-loading", isLoading);
  button.disabled = isLoading;
}

function addRipple(event) {
  const button = event.currentTarget;

  if (button.disabled) {
    return;
  }

  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);

  ripple.className = "ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function animateEuro(element, endValue) {
  if (prefersReducedMotion()) {
    element.textContent = formatEuro(endValue);
    return;
  }

  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = endValue * easedProgress;

    element.textContent = formatEuro(currentValue);

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = formatEuro(endValue);
    }
  }

  requestAnimationFrame(updateNumber);
}

function calculateTargets() {
  hideError();
  setButtonLoading(calculateBtn, true);

  const salesTarget = parseNumber(salesTargetInput.value || "0");
  const sdTarget = parseNumber(sdTargetInput.value || "0");
  const crossTarget = parseNumber(crossTargetInput.value || "0");
  const workingDays = Number(workingDaysInput.value);

  [salesTargetInput, sdTargetInput, crossTargetInput, workingDaysInput].forEach(clearInvalidState);

  if (!Number.isInteger(workingDays) || workingDays <= 0) {
    showError("Unesi ispravan broj radnih dana.");
    markInvalidInput(workingDaysInput);
    resultsEl.classList.add("hidden");
    setButtonLoading(calculateBtn, false);
    return;
  }

  if (salesTarget < 0 || sdTarget < 0 || crossTarget < 0) {
    showError("Targeti ne mogu biti negativni.");
    resultsEl.classList.add("hidden");
    setButtonLoading(calculateBtn, false);
    return;
  }

  const salesDaily = salesTarget / workingDays;
  const sdDaily = sdTarget / workingDays;
  const crossDaily = crossTarget / workingDays;

  const salesWeekly = salesDaily * workingDaysPerWeek;
  const sdWeekly = sdDaily * workingDaysPerWeek;
  const crossWeekly = crossDaily * workingDaysPerWeek;

  window.setTimeout(() => {
    animateEuro(salesDailyEl, salesDaily);
    animateEuro(sdDailyEl, sdDaily);
    animateEuro(crossDailyEl, crossDaily);
    animateEuro(salesWeeklyEl, salesWeekly);
    animateEuro(sdWeeklyEl, sdWeekly);
    animateEuro(crossWeeklyEl, crossWeekly);

    revealSection(resultsEl);
    setButtonLoading(calculateBtn, false);
  }, prefersReducedMotion() ? 0 : 180);
}

function resetCalculator() {
  salesTargetInput.value = "";
  sdTargetInput.value = "";
  crossTargetInput.value = "";
  workingDaysInput.value = "";

  hideError();
  resultsEl.classList.add("hidden");

  [salesTargetInput, sdTargetInput, crossTargetInput, workingDaysInput].forEach(clearInvalidState);
  [salesDailyEl, sdDailyEl, crossDailyEl, salesWeeklyEl, sdWeeklyEl, crossWeeklyEl].forEach((element) => {
    element.textContent = formatEuro(0);
  });
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    calculateTargets();
  }
}

function initializeTargetCalculator() {
  runIntroLoader();
  initializeReactiveBackground();

  [salesTargetInput, sdTargetInput, crossTargetInput].forEach((input) => {
    input.addEventListener("input", () => clearInvalidState(input));
    input.addEventListener("blur", () => formatInputValue(input));
    input.addEventListener("keydown", handleEnterKey);
  });

  workingDaysInput.addEventListener("input", () => clearInvalidState(workingDaysInput));
  workingDaysInput.addEventListener("keydown", handleEnterKey);

  calculateBtn.addEventListener("click", calculateTargets);
  resetBtn.addEventListener("click", resetCalculator);

  [calculateBtn, resetBtn].forEach((button) => {
    button.addEventListener("click", addRipple);
  });
}

initializeTargetCalculator();