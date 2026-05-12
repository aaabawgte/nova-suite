let brandDatabase = [];

const searchInput = document.querySelector("#searchInput");
const resultsDiv = document.querySelector("#results");
const loaderEl = document.querySelector("#loader");
const appEl = document.querySelector("#app");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatContact(contact) {
  const safeContact = escapeHtml(contact);
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

  return safeContact.replace(emailRegex, (email) => {
    return `<a href="mailto:${email}" class="email-link">${email}</a>`;
  });
}

function normalizeSearch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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


function toggleEmailForm() {
  const formContainer = document.querySelector("#emailFormContainer");
  const emailButton = document.querySelector("#emailBtn");

  if (!formContainer || !emailButton) {
    return;
  }

  const isHidden = formContainer.style.display === "none" || !formContainer.style.display;
  formContainer.style.display = isHidden ? "block" : "none";
  emailButton.style.display = isHidden ? "none" : "flex";
}

function resetForm() {
  const formContent = document.querySelector("#formContent");
  const successMessage = document.querySelector("#successMessage");
  const contactForm = document.querySelector("#contactForm");

  if (formContent) {
    formContent.style.display = "block";
  }

  if (successMessage) {
    successMessage.style.display = "none";
  }

  if (contactForm) {
    contactForm.reset();
  }
}

function initializeEmailWidget() {
  const emailButton = document.querySelector("#emailBtn");
  const closeButton = document.querySelector(".close-btn");
  const newMessageButton = document.querySelector(".new-message-btn");
  const contactForm = document.querySelector("#contactForm");

  if (emailButton) {
    emailButton.addEventListener("click", toggleEmailForm);
  }

  if (closeButton) {
    closeButton.addEventListener("click", toggleEmailForm);
  }

  if (newMessageButton) {
    newMessageButton.addEventListener("click", resetForm);
  }

  if (!contactForm) {
    return;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = document.querySelector("#submitBtn");
    const buttonText = document.querySelector("#btnText");
    const buttonLoader = document.querySelector("#btnLoader");

    if (submitButton) {
      submitButton.disabled = true;
    }

    if (buttonText) {
      buttonText.style.display = "none";
    }

    if (buttonLoader) {
      buttonLoader.style.display = "inline";
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error("Submission failed");
      }

      const formContent = document.querySelector("#formContent");
      const successMessage = document.querySelector("#successMessage");

      if (formContent) {
        formContent.style.display = "none";
      }

      if (successMessage) {
        successMessage.style.display = "block";
      }
    } catch (error) {
      alert("Greška pri slanju poruke. Molimo pokušajte ponovno.");

      if (submitButton) {
        submitButton.disabled = false;
      }

      if (buttonText) {
        buttonText.style.display = "inline";
      }

      if (buttonLoader) {
        buttonLoader.style.display = "none";
      }
    }
  });
}

function showNoResults() {
  resultsDiv.innerHTML = `
    <div class="no-results">
      <h3>Nema rezultata</h3>
      <p>Nismo pronašli brand koji ste tražili. Pokušajte s drugim nazivom.</p>
    </div>
  `;
  resultsDiv.classList.add("show");
}

function showLoadError() {
  resultsDiv.innerHTML = `
    <div class="no-results">
      <h3>Greška pri učitavanju podataka</h3>
      <p>Molimo osvježite stranicu ili pokušajte kasnije.</p>
    </div>
  `;
  resultsDiv.classList.add("show");
}

function renderServiceRows(serviceItem) {
  return `
    <div class="info-row">
      <div class="info-label">
        <span class="icon">🏢</span> Servis:
      </div>
      <div class="info-value">${escapeHtml(serviceItem.service)}</div>
    </div>

    <div class="info-row">
      <div class="info-label">
        <span class="icon">📍</span> Adresa:
      </div>
      <div class="info-value">${escapeHtml(serviceItem.address)}</div>
    </div>

    <div class="info-row">
      <div class="info-label">
        <span class="icon">✉️</span> Kontakt:
      </div>
      <div class="info-value">${formatContact(serviceItem.kontakt)}</div>
    </div>

    <div class="info-row">
      <div class="info-label">
        <span class="icon">💬</span> Napomena:
      </div>
      <div class="info-value">${escapeHtml(serviceItem.napomena)}</div>
    </div>
  `;
}

function renderDocuments(documents = []) {
  if (!documents.length) {
    return "";
  }

  const documentLinks = documents.map((documentItem) => {
    return `
      <a href="${escapeHtml(documentItem.url)}" class="download-btn" download="${escapeHtml(documentItem.name)}">
        📥 ${escapeHtml(documentItem.name)}
      </a>
    `;
  }).join("");

  return `
    <div class="info-row">
      <div class="info-label">
        <span class="icon">📄</span> Dokumenti:
      </div>
      <div class="info-value">${documentLinks}</div>
    </div>
  `;
}

function renderWebsite(website) {
  if (!website) {
    return "";
  }

  return `
    <div class="info-row">
      <div class="info-label">
        <span class="icon">🔗</span> Link:
      </div>
      <div class="info-value">
        <a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer" class="web-link">
          ${escapeHtml(website)}
        </a>
      </div>
    </div>
  `;
}

function renderBrandCard(item) {
  const services = Array.isArray(item.servisi) && item.servisi.length > 0
    ? item.servisi
    : [item];

  const serviceRows = services.map((serviceItem, index) => {
    const divider = index > 0 ? '<hr class="service-divider">' : "";
    return `${divider}${renderServiceRows(serviceItem)}`;
  }).join("");

  return `
    <article class="result-card">
      <div class="brand-name">${escapeHtml(item.brand)}</div>
      ${serviceRows}
      ${renderDocuments(item.documents)}
      ${renderWebsite(item.website)}
    </article>
  `;
}

function displayResults(matches) {
  if (!matches.length) {
    showNoResults();
    return;
  }

  resultsDiv.innerHTML = matches.map(renderBrandCard).join("");
  resultsDiv.classList.add("show");
}

function handleSearchInput() {
  const searchTerm = normalizeSearch(searchInput.value);

  if (!searchTerm) {
    resultsDiv.classList.remove("show");
    resultsDiv.innerHTML = "";
    return;
  }

  const matches = brandDatabase.filter((item) => {
    return normalizeSearch(item.brand).includes(searchTerm);
  });

  displayResults(matches);
}

async function loadBrandDatabase() {
  try {
    const response = await fetch("brandDatabase.json");

    if (!response.ok) {
      throw new Error("Nije moguće učitati bazu podataka");
    }

    brandDatabase = await response.json();
    console.log(`Učitano ${brandDatabase.length} brandova`);
  } catch (error) {
    console.error("Greška pri učitavanju baze:", error);
    showLoadError();
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("Service Worker registriran"))
      .catch((error) => console.log("Service Worker greška:", error));
  });
}

async function initializeServiceProcedures() {
  initializeReactiveBackground();
  initializeEmailWidget();
  runIntroLoader();

  await loadBrandDatabase();

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);

    window.addEventListener("load", () => {
      searchInput.focus();
    });
  }

  registerServiceWorker();
}

initializeServiceProcedures();
