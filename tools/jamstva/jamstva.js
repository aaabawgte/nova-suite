const warrantyData = {
  "Grupa A": [
    { name: "Produženo održavanje 3+2 god", percent: 9 },
    { name: "Produženo održavanje 2+3 god", percent: 9 },
    { name: "Produženo održavanje 5+2 god", percent: 13 },
    { name: "Produženo održavanje 2+3 god + zaštita od oštećenja 5 god", percent: 18 },
    { name: "Produženo održavanje 3+2 god + zaštita od oštećenja 5 god", percent: 18 },
    { name: "Produženo održavanje 5+2 god + zaštita od oštećenja 7 god", percent: 26 }
  ],
  "Grupa B": [
    { name: "Produženo održavanje 3+2 god", percent: 9 },
    { name: "Produženo održavanje 2+3 god", percent: 9 },
    { name: "Produženo održavanje 5+2 god", percent: 13 },
    { name: "Produženo održavanje 2+3 god + zaštita od oštećenja 5 god", percent: 18 },
    { name: "Produženo održavanje 3+2 god + zaštita od oštećenja 5 god", percent: 18 },
    { name: "Produženo održavanje 5+2 god + zaštita od oštećenja 7 god", percent: 26 }
  ],
  "Mobilni uređaji": [
    { name: "Zaštita od oštećenja i loma 1 god", percent: 12 },
    { name: "Zaštita od oštećenja i loma 2 god", percent: 24 },
    { name: "Produženo održavanje 2+1 god", percent: 8 }
  ],
  "Bicikli i romobili": [
    { name: "Produženo održavanje 2+1 god - električni bicikli i romobili", percent: 14 },
    { name: "Produženo održavanje 2+1 god + zaštita od oštećenja 3 god - električni bicikli i romobili", percent: 27 }
  ]
};

const groupDescriptions = {
  "Grupa A": "Televizori, igraće konzole, perilice rublja, sušilice rublja, perilice posuđa, bojleri",
  "Grupa B": "Laptopi, stolna računala, monitori, printeri, soundbarovi, hladnjaci, pećnice, klime, ploče za kuhanje, nape, zamrzivači, štednjaci",
  "Mobilni uređaji": "Mobiteli, tableti, pametni satovi i pametne narukvice",
  "Bicikli i romobili": "Električni bicikli i električni romobili"
};

const priceInput = document.querySelector("#price");
const groupSelect = document.querySelector("#group");
const warrantySelect = document.querySelector("#warranty");
const warrantyCompareSelect = document.querySelector("#warrantyCompare");
const compareToggle = document.querySelector("#compareToggle");
const compareWarrantyField = document.querySelector("#compareWarrantyField");
const installmentsInput = document.querySelector("#installments");

const calculateBtn = document.querySelector("#calculateBtn");
const resetBtn = document.querySelector("#resetBtn");
const rateBtn = document.querySelector("#rateBtn");
const pdfBtn = document.querySelector("#pdfBtn");

const errorEl = document.querySelector("#error");
const rateErrorEl = document.querySelector("#rateError");
const resultsEl = document.querySelector("#results");
const rateResultsEl = document.querySelector("#rateResults");

const basePriceEl = document.querySelector("#basePrice");
const warrantyPriceEl = document.querySelector("#warrantyPrice");
const totalPriceEl = document.querySelector("#totalPrice");
const monthlyBaseEl = document.querySelector("#monthlyBase");
const monthlyTotalEl = document.querySelector("#monthlyTotal");
const monthlyDiffEl = document.querySelector("#monthlyDiff");
const compareResultsEl = document.querySelector("#compareResults");
const compareWarrantyNameAEl = document.querySelector("#compareWarrantyNameA");
const compareWarrantyNameBEl = document.querySelector("#compareWarrantyNameB");
const compareTotalAEl = document.querySelector("#compareTotalA");
const compareTotalBEl = document.querySelector("#compareTotalB");
const compareDifferenceEl = document.querySelector("#compareDifference");
const installmentValueEl = document.querySelector("#installmentValue");
const loaderEl = document.querySelector("#loader");
const appEl = document.querySelector("#app");
function populateCompareWarranties(groupName) {
  if (!warrantyCompareSelect) {
    return;
  }

  warrantyCompareSelect.innerHTML = "";
  warrantyCompareSelect.disabled = true;

  if (!groupName) {
    warrantyCompareSelect.innerHTML = '<option value="">Prvo odaberi grupu</option>';
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Odaberi drugo jamstvo";
  warrantyCompareSelect.appendChild(placeholder);

  warrantyData[groupName].forEach((warranty, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${warranty.name} (${warranty.percent}%)`;
    warrantyCompareSelect.appendChild(option);
  });

  warrantyCompareSelect.disabled = !compareToggle.checked;
}
function resetCompareResults() {
  if (!compareResultsEl) {
    return;
  }

  compareResultsEl.classList.add("hidden");
  compareWarrantyNameAEl.textContent = "-";
  compareWarrantyNameBEl.textContent = "-";
  compareTotalAEl.textContent = formatEuro(0);
  compareTotalBEl.textContent = formatEuro(0);
  compareDifferenceEl.textContent = formatEuro(0);
}

function updateCompareVisibility() {
  if (!compareToggle || !compareWarrantyField || !warrantyCompareSelect) {
    return;
  }

  const shouldCompare = compareToggle.checked;
  compareWarrantyField.classList.toggle("hidden", !shouldCompare);
  warrantyCompareSelect.disabled = !shouldCompare || !groupSelect.value;

  if (!shouldCompare) {
    warrantyCompareSelect.value = "";
    resetCompareResults();
  }
}

function calculateWarrantyComparison(price, selectedGroup, selectedWarranty) {
  if (!compareToggle || !compareToggle.checked) {
    resetCompareResults();
    return;
  }

  const compareWarrantyIndex = warrantyCompareSelect.value;

  if (compareWarrantyIndex === "") {
    showError(errorEl, "Odaberi drugo jamstvo za usporedbu.");
    markInvalidInput(warrantyCompareSelect);
    resetCompareResults();
    return;
  }

  const compareWarranty = warrantyData[selectedGroup][Number(compareWarrantyIndex)];
  const totalA = price + price * (selectedWarranty.percent / 100);
  const totalB = price + price * (compareWarranty.percent / 100);
  const difference = Math.abs(totalB - totalA);

  compareWarrantyNameAEl.textContent = selectedWarranty.name;
  compareWarrantyNameBEl.textContent = compareWarranty.name;
  animateEuro(compareTotalAEl, totalA);
  animateEuro(compareTotalBEl, totalB);
  animateEuro(compareDifferenceEl, difference);

  revealSection(compareResultsEl);
  pulseElement(compareDifferenceEl.closest(".compare-difference"));
}

let latestCalculation = null;
let latestInstallmentCalculation = null;
const animationDuration = 650;

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

function formatEuro(value) {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function updateInstallmentDisplay() {
  if (!installmentsInput || !installmentValueEl) {
    return;
  }

  installmentValueEl.textContent = installmentsInput.value;

  const min = Number(installmentsInput.min || 1);
  const max = Number(installmentsInput.max || 36);
  const value = Number(installmentsInput.value);
  const progress = ((value - min) / (max - min)) * 100;

  installmentsInput.style.setProperty("--slider-progress", `${progress}%`);
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

function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function revealSection(section) {
  section.classList.remove("hidden");
  restartAnimation(section, "is-revealing");
}

function pulseElement(element) {
  restartAnimation(element, "success-pulse");
}

function markInvalidInput(element) {
  restartAnimation(element, "input-error");
}

function clearInvalidState(element) {
  element.classList.remove("input-error");
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


function parsePrice(value) {
  const normalizedValue = value
    .trim()
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalizedValue);
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
  restartAnimation(element, "error-shake");
}

function hideError(element) {
  element.textContent = "";
  element.classList.add("hidden");
}

function hideAllErrors() {
  hideError(errorEl);
  hideError(rateErrorEl);
}

function populateGroups() {
  Object.keys(warrantyData).forEach((groupName) => {
    const option = document.createElement("option");
    option.value = groupName;
    option.textContent = groupName;
    groupSelect.appendChild(option);
  });
}

function populateWarranties(groupName) {
  warrantySelect.innerHTML = "";
  warrantySelect.disabled = true;
  rateResultsEl.classList.add("hidden");
  latestCalculation = null;

  if (!groupName) {
    warrantySelect.innerHTML = '<option value="">Prvo odaberi grupu</option>';
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Odaberi jamstvo";
  warrantySelect.appendChild(placeholder);

  warrantyData[groupName].forEach((warranty, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${warranty.name} (${warranty.percent}%)`;
    warrantySelect.appendChild(option);
  });

  warrantySelect.disabled = false;
}

function formatPriceInput() {
  const price = parsePrice(priceInput.value);

  if (!Number.isFinite(price) || price <= 0) {
    return;
  }

  priceInput.value = new Intl.NumberFormat("hr-HR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

function calculateWarranty() {
  hideAllErrors();
  setButtonLoading(calculateBtn, true);
  rateResultsEl.classList.add("hidden");
  latestInstallmentCalculation = null;

  const price = parsePrice(priceInput.value);
  const selectedGroup = groupSelect.value;
  const selectedWarrantyIndex = warrantySelect.value;

  if (!Number.isFinite(price) || price <= 0) {
    showError(errorEl, "Unesi ispravnu cijenu veću od 0.");
    resultsEl.classList.add("hidden");
    markInvalidInput(priceInput);
    setButtonLoading(calculateBtn, false);
    return;
  }

  if (!selectedGroup) {
    showError(errorEl, "Odaberi grupu proizvoda.");
    resultsEl.classList.add("hidden");
    markInvalidInput(groupSelect);
    setButtonLoading(calculateBtn, false);
    return;
  }

  if (selectedWarrantyIndex === "") {
    showError(errorEl, "Odaberi jamstvo.");
    resultsEl.classList.add("hidden");
    markInvalidInput(warrantySelect);
    setButtonLoading(calculateBtn, false);
    return;
  }

  const selectedWarranty = warrantyData[selectedGroup][Number(selectedWarrantyIndex)];
  const warrantyPrice = price * (selectedWarranty.percent / 100);
  const totalPrice = price + warrantyPrice;

  latestCalculation = {
    basePrice: price,
    warrantyPrice,
    totalPrice,
    group: selectedGroup,
    groupDescription: groupDescriptions[selectedGroup],
    warranty: selectedWarranty
  };

  window.setTimeout(() => {
    animateEuro(basePriceEl, price);
    animateEuro(warrantyPriceEl, warrantyPrice);
    animateEuro(totalPriceEl, totalPrice);

    revealSection(resultsEl);
    pulseElement(totalPriceEl.closest(".result-box"));
    calculateWarrantyComparison(price, selectedGroup, selectedWarranty);
    setButtonLoading(calculateBtn, false);
  }, prefersReducedMotion() ? 0 : 180);
}

function calculateInstallments() {
  hideError(rateErrorEl);
  setButtonLoading(rateBtn, true);

  if (!latestCalculation) {
    showError(rateErrorEl, "Prvo izračunaj cijenu s jamstvom.");
    rateResultsEl.classList.add("hidden");
    setButtonLoading(rateBtn, false);
    return;
  }

  const installments = Number(installmentsInput.value);
  updateInstallmentDisplay();

  if (!Number.isInteger(installments) || installments <= 0) {
    showError(rateErrorEl, "Unesi ispravan broj rata veći od 0.");
    rateResultsEl.classList.add("hidden");
    markInvalidInput(installmentsInput);
    setButtonLoading(rateBtn, false);
    return;
  }

  const monthlyBase = latestCalculation.basePrice / installments;
  const monthlyTotal = latestCalculation.totalPrice / installments;
  const monthlyDifference = monthlyTotal - monthlyBase;

  latestInstallmentCalculation = {
    installments,
    monthlyBase,
    monthlyTotal,
    monthlyDifference
  };

  window.setTimeout(() => {
    animateEuro(monthlyBaseEl, monthlyBase);
    animateEuro(monthlyTotalEl, monthlyTotal);
    animateEuro(monthlyDiffEl, monthlyDifference);

    revealSection(rateResultsEl);
    pulseElement(monthlyDiffEl.closest(".result-box"));
    setButtonLoading(rateBtn, false);
  }, prefersReducedMotion() ? 0 : 180);
}

function resetCalculator() {
  priceInput.value = "";
  groupSelect.value = "";
  if (compareToggle) {
    compareToggle.checked = false;
  }
  if (warrantyCompareSelect) {
    warrantyCompareSelect.value = "";
  }
  installmentsInput.value = "12";
  updateInstallmentDisplay();
  latestCalculation = null;
  latestInstallmentCalculation = null;

  populateWarranties("");
  populateCompareWarranties("");
  updateCompareVisibility();
  resetCompareResults();
  hideAllErrors();
  resultsEl.classList.add("hidden");
  rateResultsEl.classList.add("hidden");

  [priceInput, groupSelect, warrantySelect, warrantyCompareSelect, installmentsInput].filter(Boolean).forEach(clearInvalidState);
  [basePriceEl, warrantyPriceEl, totalPriceEl, monthlyBaseEl, monthlyTotalEl, monthlyDiffEl].forEach((element) => {
    element.textContent = formatEuro(0);
  });
}

function getNextOfferNumber() {
  const storageKey = "novaSuiteOfferNumber";
  const currentNumber = Number(localStorage.getItem(storageKey) || "0") + 1;
  localStorage.setItem(storageKey, String(currentNumber));
  return String(currentNumber).padStart(4, "0");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadExternalScript(src, globalCheck) {
  return new Promise((resolve, reject) => {
    if (globalCheck()) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensurePdfDependencies() {
  await loadExternalScript(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    () => Boolean(window.html2canvas)
  );
}

async function generatePdfOffer() {
  if (!latestCalculation) {
    showError(errorEl, "Prvo izračunaj cijenu s jamstvom prije izrade PDF ponude.");
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    showError(errorEl, "PDF alat se nije učitao. Provjeri internet vezu i pokušaj ponovno.");
    return;
  }

  setButtonLoading(pdfBtn, true);
  let pdfOverlay = null;

  try {
    await ensurePdfDependencies();

    const offerNumber = getNextOfferNumber();
    const fileDate = new Date().toISOString().slice(0, 10);
    const today = new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date());

    const rows = [
      ["Broj ponude", offerNumber],
      ["Grupa proizvoda", latestCalculation.group],
      ["Opis grupe", latestCalculation.groupDescription],
      ["Odabrano jamstvo", latestCalculation.warranty.name],
      ["Cijena bez jamstva", formatEuro(latestCalculation.basePrice)],
      ["Cijena jamstva", formatEuro(latestCalculation.warrantyPrice)],
      ["Ukupna cijena s jamstvom", formatEuro(latestCalculation.totalPrice), true]
    ];

    const installmentRows = latestInstallmentCalculation
      ? [
          ["Broj rata", `${latestInstallmentCalculation.installments}`],
          ["Mjesečna rata bez jamstva", formatEuro(latestInstallmentCalculation.monthlyBase)],
          ["Mjesečna rata s jamstvom", formatEuro(latestInstallmentCalculation.monthlyTotal)],
          ["Razlika u mjesečnoj rati", formatEuro(latestInstallmentCalculation.monthlyDifference), true]
        ]
      : [];

    const renderRows = (items) => items.map(([label, value, highlighted]) => `
      <div class="pdf-row ${highlighted ? "pdf-row-highlight" : ""}">
        <div class="pdf-label">${escapeHtml(label)}</div>
        <div class="pdf-value">${escapeHtml(value)}</div>
      </div>
    `).join("");

    pdfOverlay = document.createElement("div");
    pdfOverlay.style.position = "fixed";
    pdfOverlay.style.left = "0";
    pdfOverlay.style.top = "0";
    pdfOverlay.style.width = "100vw";
    pdfOverlay.style.height = "100vh";
    pdfOverlay.style.zIndex = "999999";
    pdfOverlay.style.background = "#001b44";
    pdfOverlay.style.display = "flex";
    pdfOverlay.style.alignItems = "flex-start";
    pdfOverlay.style.justifyContent = "center";
    pdfOverlay.style.overflow = "auto";
    pdfOverlay.style.padding = "24px";
    pdfOverlay.style.pointerEvents = "none";
    pdfOverlay.style.opacity = "0.01";

    pdfOverlay.innerHTML = `
      <div id="pdfRenderPage" style="
        position: relative;
        width: 794px;
        min-height: 1123px;
        background: #ffffff;
        color: #102033;
        font-family: Arial, Helvetica, sans-serif;
        box-sizing: border-box;
      ">
        <style>
          #pdfRenderPage,
          #pdfRenderPage * {
            box-sizing: border-box;
          }

          #pdfRenderPage .pdf-header {
            background: #0050a0;
            color: #ffffff;
            padding: 34px 48px 28px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          #pdfRenderPage .pdf-brand {
            font-size: 34px;
            font-weight: 800;
            letter-spacing: -0.5px;
            line-height: 1;
          }

          #pdfRenderPage .pdf-subtitle {
            font-size: 16px;
            margin-top: 10px;
            opacity: 0.92;
          }

          #pdfRenderPage .pdf-meta {
            text-align: right;
            font-size: 14px;
            line-height: 1.55;
            opacity: 0.95;
            padding-top: 2px;
          }

          #pdfRenderPage .pdf-content {
            padding: 42px 48px 84px;
          }

          #pdfRenderPage .pdf-title {
            margin: 0;
            color: #102033;
            font-size: 30px;
            line-height: 1.18;
            letter-spacing: -0.6px;
          }

          #pdfRenderPage .pdf-description {
            margin: 10px 0 30px;
            color: #667085;
            font-size: 15px;
            line-height: 1.5;
          }

          #pdfRenderPage .pdf-table {
            border: 1px solid #d9e7f8;
            border-radius: 18px;
            overflow: hidden;
          }

          #pdfRenderPage .pdf-row {
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 22px;
            padding: 15px 20px;
            border-bottom: 1px solid #e8f2ff;
            background: #ffffff;
            align-items: start;
          }

          #pdfRenderPage .pdf-row:last-child {
            border-bottom: 0;
          }

          #pdfRenderPage .pdf-row-highlight {
            background: #e8f2ff;
          }

          #pdfRenderPage .pdf-label {
            color: #667085;
            font-size: 14px;
            line-height: 1.38;
          }

          #pdfRenderPage .pdf-value {
            color: #102033;
            font-size: 14px;
            line-height: 1.38;
            font-weight: 600;
            text-align: right;
            overflow-wrap: anywhere;
            word-break: normal;
          }

          #pdfRenderPage .pdf-row-highlight .pdf-value {
            font-size: 18px;
            font-weight: 800;
          }

          #pdfRenderPage .pdf-section-title {
            margin: 36px 0 16px;
            color: #0050a0;
            font-size: 22px;
            line-height: 1.2;
          }

          #pdfRenderPage .pdf-note {
            margin-top: 36px;
            background: #f5f9ff;
            border: 1px solid #d9e7f8;
            border-radius: 18px;
            padding: 20px;
          }

          #pdfRenderPage .pdf-note-title {
            color: #0050a0;
            font-weight: 800;
            font-size: 15px;
            margin-bottom: 8px;
          }

          #pdfRenderPage .pdf-note-text {
            color: #667085;
            font-size: 13px;
            line-height: 1.55;
          }

          #pdfRenderPage .pdf-footer {
            position: absolute;
            left: 48px;
            right: 48px;
            bottom: 28px;
            border-top: 1px solid #d9e7f8;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            color: #667085;
            font-size: 12px;
          }
        </style>

        <div class="pdf-header">
          <div>
            <div class="pdf-brand">Nova Suite</div>
            <div class="pdf-subtitle">Ponuda za jamstvo</div>
          </div>
          <div class="pdf-meta">
            <div>Broj ponude: ${escapeHtml(offerNumber)}</div>
            <div>Datum: ${escapeHtml(today)}</div>
          </div>
        </div>

        <div class="pdf-content">
          <h1 class="pdf-title">Kalkulacija jamstva</h1>
          <p class="pdf-description">Informativni izračun cijene proizvoda s odabranim jamstvom.</p>

          <div class="pdf-table">
            ${renderRows(rows)}
          </div>

          ${latestInstallmentCalculation ? `
            <h2 class="pdf-section-title">Izračun mjesečnih rata</h2>
            <div class="pdf-table">
              ${renderRows(installmentRows)}
            </div>
          ` : ""}

          <div class="pdf-note">
            <div class="pdf-note-title">Napomena</div>
            <div class="pdf-note-text">Ova ponuda je informativnog karaktera. Konačni uvjeti ovise o važećim pravilima prodajnog mjesta.</div>
          </div>
        </div>

        <div class="pdf-footer">
          <span>Nova Suite • Automatski kalkulator jamstva</span>
          <span>Internal tool</span>
        </div>
      </div>
    `;

    document.body.appendChild(pdfOverlay);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => window.setTimeout(resolve, 150));

    const pdfPage = pdfOverlay.querySelector("#pdfRenderPage");
    const canvas = await window.html2canvas(pdfPage, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });

    const imageData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
    doc.save(`nova-suite-ponuda-${offerNumber}-${fileDate}.pdf`);
  } catch (error) {
    console.error(error);
    showError(errorEl, "PDF ponuda se nije uspjela izraditi. Pokušaj ponovno.");
  } finally {
    if (pdfOverlay) {
      pdfOverlay.remove();
    }

    setButtonLoading(pdfBtn, false);
  }
}

function handleInstallmentSliderInput() {
  updateInstallmentDisplay();
  clearInvalidState(installmentsInput);

  if (latestCalculation && !rateResultsEl.classList.contains("hidden")) {
    calculateInstallments();
  }
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    calculateWarranty();
  }
}

function initializeCalculator() {
  runIntroLoader();
  initializeReactiveBackground();
  populateGroups();
  populateWarranties("");
  populateCompareWarranties("");
  updateCompareVisibility();
  updateInstallmentDisplay();

  groupSelect.addEventListener("change", (event) => {
    clearInvalidState(groupSelect);
    populateWarranties(event.target.value);
    populateCompareWarranties(event.target.value);
    resetCompareResults();
    updateCompareVisibility();
    resultsEl.classList.add("hidden");
  });

  warrantySelect.addEventListener("change", () => clearInvalidState(warrantySelect));
  if (warrantyCompareSelect) {
    warrantyCompareSelect.addEventListener("change", () => {
      clearInvalidState(warrantyCompareSelect);
      resetCompareResults();
    });
  }

  if (compareToggle) {
    compareToggle.addEventListener("change", () => {
      updateCompareVisibility();
      resetCompareResults();
    });
  }
  installmentsInput.addEventListener("input", handleInstallmentSliderInput);
  priceInput.addEventListener("input", () => clearInvalidState(priceInput));

  priceInput.addEventListener("blur", formatPriceInput);
  priceInput.addEventListener("keydown", handleEnterKey);
  warrantySelect.addEventListener("keydown", handleEnterKey);
  installmentsInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      calculateInstallments();
    }
  });

  calculateBtn.addEventListener("click", calculateWarranty);
  rateBtn.addEventListener("click", calculateInstallments);
  resetBtn.addEventListener("click", resetCalculator);
  pdfBtn.addEventListener("click", generatePdfOffer);

  [calculateBtn, rateBtn, resetBtn, pdfBtn].forEach((button) => {
    button.addEventListener("click", addRipple);
  });
}

initializeCalculator();