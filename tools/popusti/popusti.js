

let discountData = [];

const searchInput = document.querySelector("#searchInput");
const resultsEl = document.querySelector("#results");
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeSearch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseCsv(csvText) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  if (currentValue || currentRow.length) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => String(cell).trim() !== ""));
}

function csvRowsToObjects(rows) {
  const [headers, ...dataRows] = rows;

  if (!headers || !headers.length) {
    return [];
  }

  return dataRows.map((row) => {
    return headers.reduce((item, header, index) => {
      item[header.trim()] = String(row[index] ?? "").trim();
      return item;
    }, {});
  });
}

function getItemValue(item, keys) {
  const foundKey = keys.find((key) => Object.prototype.hasOwnProperty.call(item, key));
  return foundKey ? item[foundKey] : "";
}

function renderDiscountCard(item) {
  const group = getItemValue(item, ["Nadgrupa", "nadgrupa"]);
  const brand = getItemValue(item, ["Brand", "brand"]);
  const name = getItemValue(item, ["Naziv artikla", "Naziv", "Artikl", "naziv artikla"]);
  const discount = getItemValue(item, ["Popust", "popust"]);

  return `
    <article class="result-card discount-card">
      <div class="brand-name">${escapeHtml(name || "Artikl")}</div>

      <div class="info-row">
        <div class="info-label"><span class="icon">🏷️</span> Popust:</div>
        <div class="info-value discount-value">${escapeHtml(discount || "—")}</div>
      </div>

      <div class="info-row">
        <div class="info-label"><span class="icon">🏢</span> Brand:</div>
        <div class="info-value">${escapeHtml(brand || "—")}</div>
      </div>

      <div class="info-row">
        <div class="info-label"><span class="icon">📦</span> Nadgrupa:</div>
        <div class="info-value">${escapeHtml(group || "—")}</div>
      </div>
    </article>
  `;
}

function showInitialState() {
  resultsEl.innerHTML = `
    <div class="no-results">
      <h3>Upiši artikl za pretragu</h3>
      <p>Možeš tražiti po nazivu artikla, brandu ili nadgrupi.</p>
    </div>
  `;
  resultsEl.classList.add("show");
}

function showNoResults() {
  resultsEl.innerHTML = `
    <div class="no-results">
      <h3>Nema pronađenog popusta</h3>
      <p>Provjeri naziv artikla ili pokušaj pretragu po brandu.</p>
    </div>
  `;
  resultsEl.classList.add("show");
}

function showLoadError() {
  resultsEl.innerHTML = `
    <div class="no-results">
      <h3>Greška pri učitavanju popusta</h3>
      <p>Provjeri da je datoteka <strong>popusti.csv</strong> u folderu ovog alata.</p>
    </div>
  `;
  resultsEl.classList.add("show");
}

function displayResults(matches) {
  if (!matches.length) {
    showNoResults();
    return;
  }

  resultsEl.innerHTML = matches.slice(0, 80).map(renderDiscountCard).join("");
  resultsEl.classList.add("show");
}

function handleSearch() {
  const searchTerm = normalizeSearch(searchInput.value);

  if (!searchTerm) {
    showInitialState();
    return;
  }

  const matches = discountData.filter((item) => {
    const searchableText = normalizeSearch(Object.values(item).join(" "));
    return searchableText.includes(searchTerm);
  });

  displayResults(matches);
}

async function loadDiscountData() {
  try {
    const response = await fetch("popusti.csv");

    if (!response.ok) {
      throw new Error("CSV nije pronađen");
    }

    const csvText = await response.text();
    discountData = csvRowsToObjects(parseCsv(csvText));
    showInitialState();
  } catch (error) {
    console.error("Greška pri učitavanju CSV-a:", error);
    showLoadError();
  }
}

async function initializeDiscountSearch() {
  initializeReactiveBackground();
  runIntroLoader();
  await loadDiscountData();

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);

    window.addEventListener("load", () => {
      searchInput.focus();
    });
  }
}

initializeDiscountSearch();