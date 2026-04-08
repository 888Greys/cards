const activeButtonClasses = [
  "bg-primary",
  "text-on-primary",
  "font-semibold",
];

const inactiveButtonClasses = [
  "bg-surface-container-lowest",
  "border",
  "border-outline-variant/20",
  "text-on-surface-variant",
  "font-medium",
];

function setButtonState(button, active) {
  button.classList.remove(...activeButtonClasses, ...inactiveButtonClasses);
  if (active) {
    button.classList.add(...activeButtonClasses);
  } else {
    button.classList.add(...inactiveButtonClasses);
  }
}

function initCheckBalance() {
  const form = document.querySelector("#balance-form");
  if (!form) return;

  const brandButtons = Array.from(document.querySelectorAll("[data-brand]"));
  const brandInput = document.querySelector("#selected_brand");
  const result = document.querySelector("#balance-result");
  const resultTitle = document.querySelector("#balance-result-title");
  const resultCopy = document.querySelector("#balance-result-copy");
  const resultAmount = document.querySelector("#balance-result-amount");
  let selectedBrand = brandInput?.value || "iTunes";

  const selectBrand = (button) => {
    selectedBrand = button.dataset.brand || selectedBrand;
    if (brandInput) brandInput.value = selectedBrand;
    brandButtons.forEach((item) => {
      const active = item === button;
      item.setAttribute("aria-pressed", String(active));
      item.classList.toggle("border-primary", active);
      item.classList.toggle("border-2", active);
      item.classList.toggle("bg-primary-fixed/30", active);
      item.classList.toggle("bg-surface-container-low", !active);
      item.classList.toggle("border-outline-variant/20", !active);
      const label = item.querySelector("[data-brand-label]");
      if (label) {
        label.classList.toggle("text-primary", active);
        label.classList.toggle("text-on-surface-variant", !active);
      }
      const image = item.querySelector("img");
      if (image) {
        image.classList.toggle("grayscale", !active);
      }
    });
  };

  brandButtons.forEach((button) => {
    button.addEventListener("click", () => selectBrand(button));
  });

  const initiallySelected =
    brandButtons.find((button) => button.dataset.brand === selectedBrand) ||
    brandButtons[0];
  if (initiallySelected) selectBrand(initiallySelected);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const cardNumberInput = document.querySelector("#card_number");
    const pinInput = document.querySelector("#pin");
    const digits = (cardNumberInput?.value || "").replace(/\D/g, "");
    const pin = (pinInput?.value || "").trim();

    if (digits.length < 8 || pin.length < 4) {
      result.hidden = false;
      result.className =
        "rounded-xl border border-error/20 bg-error-container p-6 text-on-error-container";
      resultTitle.textContent = "More details needed";
      resultCopy.textContent =
        "Enter at least 8 card digits and a 4-digit security code to run a balance check.";
      resultAmount.textContent = "Check input";
      return;
    }

    const brandOffsets = {
      Amazon: 34,
      iTunes: 28,
      "Google Play": 41,
      Netflix: 19,
      Others: 12,
    };
    const lastFour = Number(digits.slice(-4));
    const computedBalance = ((lastFour % 375) + (brandOffsets[selectedBrand] || 20)) / 1.37;
    const maskedNumber = digits.slice(-4).padStart(4, "0");

    result.hidden = false;
    result.className =
      "rounded-xl border border-primary/10 bg-primary-fixed/40 p-6 text-on-surface";
    resultTitle.textContent = `${selectedBrand} card verified`;
    resultCopy.textContent =
      `Card ending in ${maskedNumber} is active and ready for trade or redemption.`;
    resultAmount.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(computedBalance);
  });
}

function initMarketplace() {
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  if (!cards.length) return;

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const modeButtons = Array.from(document.querySelectorAll("[data-market-mode]"));
  const searchInput = document.querySelector("#market-search");
  const emptyState = document.querySelector("#market-empty");
  const featuredRateLabel = document.querySelector("#featured-rate-label");
  const featuredCta = document.querySelector("#featured-cta");
  let currentFilter = "all";
  let currentMode = "buy";

  const updateModeButtons = () => {
    modeButtons.forEach((button) => {
      const active = button.dataset.marketMode === currentMode;
      button.classList.toggle("bg-surface-container-lowest", active);
      button.classList.toggle("text-primary", active);
      button.classList.toggle("font-bold", active);
      button.classList.toggle("shadow-sm", active);
      button.classList.toggle("text-on-surface-variant", !active);
      button.classList.toggle("font-semibold", !active);
      button.classList.toggle("hover:bg-surface-container-high", !active);
    });
  };

  const updateFilterButtons = () => {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === currentFilter;
      setButtonState(button, active);
    });
  };

  const updateFeaturedCard = () => {
    if (!featuredRateLabel || !featuredCta) return;
    if (currentMode === "buy") {
      featuredRateLabel.innerHTML = "$100 <span class=\"text-xl font-normal opacity-70\">for</span> $88.50";
      featuredCta.textContent = "Trade Now";
      featuredCta.href = "account.html";
    } else {
      featuredRateLabel.innerHTML = "$100 <span class=\"text-xl font-normal opacity-70\">for</span> $91.20";
      featuredCta.textContent = "Sell This Card";
      featuredCta.href = "checkbalance.html";
    }
  };

  const renderCards = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const name = card.dataset.name || "";
      const searchable = `${category} ${name}`.toLowerCase();
      const matchesFilter = currentFilter === "all" || currentFilter === category;
      const matchesQuery = !query || searchable.includes(query);
      const visible = matchesFilter && matchesQuery;

      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;

      const rateLabel = card.querySelector("[data-rate-label]");
      const cta = card.querySelector("[data-card-cta]");
      const denomination = card.dataset.denomination || "";
      const nextValue = currentMode === "buy" ? card.dataset.buy : card.dataset.sell;
      if (rateLabel && denomination && nextValue) {
        rateLabel.innerHTML = `$${denomination} &rarr; $${nextValue}`;
      }
      if (cta) {
        cta.textContent = currentMode === "buy" ? "View Offers" : "Sell Now";
        cta.href = currentMode === "buy" ? "account.html" : "checkbalance.html";
      }
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
    updateFeaturedCard();
  };

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentMode = button.dataset.marketMode || currentMode;
      updateModeButtons();
      renderCards();
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";
      updateFilterButtons();
      renderCards();
    });
  });

  searchInput?.addEventListener("input", renderCards);
  updateModeButtons();
  updateFilterButtons();
  renderCards();
}

initCheckBalance();
initMarketplace();
