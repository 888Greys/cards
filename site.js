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

const BRAND_CATALOG = [
  "Adidas",
  "Airbnb",
  "Aldi",
  "Alo",
  "Amazon",
  "American Eagle",
  "American Express",
  "AMC",
  "Apple",
  "Audible",
  "Barnes & Noble",
  "Best Buy",
  "Google Play",
  "IHOP",
  "iTunes",
  "Minecraft",
  "NBA.com",
  "Netflix",
  "Nike",
  "Nintendo eShop",
  "Nordstrom",
  "Old Navy",
  "One4All",
  "OneVanilla",
  "Pandora",
  "Paramount+",
  "PlayStation",
  "Qantas",
  "Razer Gold",
  "Roblox",
  "Spotify",
  "Starbucks",
  "Steam",
  "Subway",
  "Target",
  "Twitch",
  "Uber",
  "Ulta Beauty",
  "Vanilla Mastercard",
  "Vanilla Visa",
  "Visa Gift Card",
  "Vudu",
  "Walmart",
  "Walmart Visa",
  "Xbox",
];

const SOURCE_LOGOS = {
  Adidas: "./assets/brand-logos/adidas.svg",
  Airbnb: "./assets/brand-logos/airbnb.svg",
  Aldi: "./assets/brand-logos/aldi.svg",
  Alo: "./assets/brand-logos/alo.svg",
  Amazon: "./assets/brand-logos/amazon.svg",
  "American Eagle": "./assets/brand-logos/american-eagle.svg",
  "American Express": "./assets/brand-logos/amex.svg",
  AMC: "./assets/brand-logos/amc.svg",
  Apple: "./assets/brand-logos/apple.svg",
  Audible: "./assets/brand-logos/audible.svg",
  "Barnes & Noble": "./assets/brand-logos/barnes-noble.svg",
  "Best Buy": "./assets/brand-logos/bestbuy.svg",
  "Google Play": "./assets/brand-logos/google-play.svg",
  IHOP: "./assets/brand-logos/ihop.svg",
  iTunes: "./assets/brand-logos/itunes.svg",
  Minecraft: "./assets/brand-logos/minecraft.svg",
  "NBA.com": "./assets/brand-logos/nba.svg",
  Netflix: "./assets/brand-logos/netflix.svg",
  Nike: "./assets/brand-logos/nike.svg",
  "Nintendo eShop": "./assets/brand-logos/nintendo.svg",
  Nordstrom: "./assets/brand-logos/nordstrom.svg",
  "Old Navy": "./assets/brand-logos/oldnavy.svg",
  One4All: "./assets/brand-logos/one4all.svg",
  OneVanilla: "./assets/brand-logos/onevanilla.svg",
  Pandora: "./assets/brand-logos/pandora.svg",
  "Paramount+": "./assets/brand-logos/paramount.svg",
  PlayStation: "./assets/brand-logos/playstation.svg",
  Qantas: "./assets/brand-logos/qantas.svg",
  "Razer Gold": "./assets/brand-logos/razer-gold.svg",
  Roblox: "./assets/brand-logos/roblox.svg",
  Spotify: "./assets/brand-logos/spotify.svg",
  Starbucks: "./assets/brand-logos/starbucks.svg",
  Steam: "./assets/brand-logos/steam.svg",
  Subway: "./assets/brand-logos/subway.svg",
  Target: "./assets/brand-logos/target.svg",
  Twitch: "./assets/brand-logos/twitch.svg",
  Uber: "./assets/brand-logos/uber.svg",
  "Ulta Beauty": "./assets/brand-logos/ulta.svg",
  "Vanilla Mastercard": "./assets/brand-logos/vanilla-mastercard.svg",
  "Vanilla Visa": "./assets/brand-logos/vanilla-visa.svg",
  "Visa Gift Card": "./assets/brand-logos/visa.svg",
  Vudu: "./assets/brand-logos/vudu.svg",
  Walmart: "./assets/brand-logos/walmart.svg",
  "Walmart Visa": "./assets/brand-logos/walmart-visa.svg",
  Xbox: "./assets/brand-logos/xbox.svg",
};

function setButtonState(button, active) {
  button.classList.remove(...activeButtonClasses, ...inactiveButtonClasses);
  if (active) {
    button.classList.add(...activeButtonClasses);
  } else {
    button.classList.add(...inactiveButtonClasses);
  }
}

function ensureSitePopup() {
  let popup = document.getElementById("site-flow-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "site-flow-popup";
    popup.className =
      "fixed inset-0 z-[75] hidden items-end justify-center bg-[#101828]/45 p-4 backdrop-blur-[8px] sm:items-center";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.setAttribute("aria-labelledby", "site-flow-popup-title");
    popup.innerHTML = `
      <div class="absolute inset-0" data-site-popup-close></div>
      <div class="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
        <div class="h-1.5 bg-gradient-to-r from-[#0f9af4] via-[#6b38d4] to-[#141922]" data-site-popup-accent></div>
        <div class="relative px-6 pb-6 pt-7 sm:px-8">
          <button class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f5f9] text-[#4b5563] transition-colors hover:bg-[#e6ebf1]" data-site-popup-close type="button" aria-label="Close popup">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div class="flex items-start gap-4">
            <div class="grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-[#e8fff3] text-[#067647]" data-site-popup-icon-wrap>
              <span class="material-symbols-outlined text-[28px]" data-site-popup-icon>verified</span>
            </div>
            <div class="min-w-0 pt-1">
              <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60758f]" data-site-popup-kicker>Update</p>
              <h3 class="mt-2 text-[1.9rem] font-black leading-none tracking-tight text-[#18212b]" data-site-popup-title id="site-flow-popup-title">Done</h3>
              <p class="mt-3 text-sm leading-relaxed text-[#5b6c80]" data-site-popup-copy>Everything is ready.</p>
            </div>
          </div>
          <div class="mt-6 rounded-[1.5rem] border border-[#e2e8f0] bg-[#f8fafc] px-5 py-5" data-site-popup-amount-card>
            <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60758f]" data-site-popup-amount-label>Summary</p>
            <p class="mt-2 text-[2.4rem] font-black leading-none tracking-tight text-[#18212b]" data-site-popup-amount>$0.00</p>
          </div>
          <div class="mt-6 flex gap-3">
            <button class="flex-1 rounded-full bg-[#23282f] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#171b20]" data-site-popup-primary type="button">
              Continue
            </button>
            <button class="rounded-full border border-[#d7dee8] px-5 py-3.5 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#f8fafc]" data-site-popup-close type="button">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.append(popup);
  }

  const refs = {
    root: popup,
    accent: popup.querySelector("[data-site-popup-accent]"),
    iconWrap: popup.querySelector("[data-site-popup-icon-wrap]"),
    icon: popup.querySelector("[data-site-popup-icon]"),
    kicker: popup.querySelector("[data-site-popup-kicker]"),
    title: popup.querySelector("[data-site-popup-title]"),
    copy: popup.querySelector("[data-site-popup-copy]"),
    amountCard: popup.querySelector("[data-site-popup-amount-card]"),
    amountLabel: popup.querySelector("[data-site-popup-amount-label]"),
    amount: popup.querySelector("[data-site-popup-amount]"),
    primary: popup.querySelector("[data-site-popup-primary]"),
  };

  if (!popup.dataset.bound) {
    const closePopup = () => {
      popup.classList.add("hidden");
      popup.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
      popup._onPrimary = null;
    };

    popup.querySelectorAll("[data-site-popup-close]").forEach((button) => {
      button.addEventListener("click", closePopup);
    });
    refs.primary?.addEventListener("click", () => {
      const action = popup._onPrimary;
      closePopup();
      if (typeof action === "function") action();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !popup.classList.contains("hidden")) {
        closePopup();
      }
    });
    popup.dataset.bound = "true";
  }

  return refs;
}

function openSitePopup({
  variant = "success",
  kicker,
  title,
  copy,
  amount = "",
  amountLabel = "Summary",
  primaryLabel = "Continue",
  onPrimary,
}) {
  const popup = ensureSitePopup();
  const isError = variant === "error";

  popup.kicker.textContent = kicker;
  popup.title.textContent = title;
  popup.copy.textContent = copy;
  popup.amountLabel.textContent = amountLabel;
  popup.amount.textContent = amount;
  popup.primary.textContent = primaryLabel;
  popup.amountCard.classList.toggle("hidden", !amount);

  popup.accent.className = isError
    ? "h-1.5 bg-gradient-to-r from-[#ff9a62] via-[#ff6b57] to-[#8c2c22]"
    : "h-1.5 bg-gradient-to-r from-[#0f9af4] via-[#6b38d4] to-[#141922]";
  popup.iconWrap.className = isError
    ? "grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-[#fff0ea] text-[#c2410c]"
    : "grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-[#e8fff3] text-[#067647]";
  popup.icon.textContent = isError ? "error" : "verified";
  popup.primary.className = isError
    ? "flex-1 rounded-full bg-[#23282f] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#171b20]"
    : "flex-1 rounded-full bg-[#0f172a] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#020617]";

  popup.root._onPrimary = onPrimary || null;
  popup.root.classList.remove("hidden");
  popup.root.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  popup.primary.focus();
}

function initialsFromName(name) {
  const words = String(name || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "GC";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function createBrandOption(brandName) {
  const option = document.createElement("button");
  option.type = "button";
  option.className =
    "w-full px-3 py-2.5 rounded-lg text-left hover:bg-primary-fixed/35 transition-colors flex items-center justify-between gap-3";
  option.setAttribute("data-brand-option", "");
  option.setAttribute("data-brand-value", brandName);
  const logo = SOURCE_LOGOS[brandName] || "";
  option.setAttribute("data-brand-logo", logo);

  const left = document.createElement("span");
  left.className = "flex items-center gap-3 min-w-0";

  if (logo) {
    const image = document.createElement("img");
    image.src = logo;
    image.alt = `${brandName} logo`;
    image.loading = "lazy";
    image.className = "w-4 h-4 object-contain rounded-[3px] bg-white p-[1px] shrink-0";
    left.appendChild(image);
  } else {
    const fallback = document.createElement("span");
    fallback.className =
      "w-4 h-4 rounded-[4px] bg-primary-fixed/70 text-primary text-[9px] font-black grid place-items-center shrink-0";
    fallback.textContent = initialsFromName(brandName);
    left.appendChild(fallback);
  }

  const label = document.createElement("span");
  label.className = "text-sm text-on-surface truncate";
  label.textContent = brandName;
  left.appendChild(label);

  const check = document.createElement("span");
  check.className =
    "material-symbols-outlined text-[17px] text-primary transition-opacity opacity-0";
  check.textContent = "check";
  check.setAttribute("data-brand-option-check", "");

  option.append(left, check);
  return option;
}

function initBrandCombobox({
  combobox,
  hiddenInput,
  nativeSelect,
  trigger,
  menu,
  search,
  optionsRoot,
  emptyState,
  currentLabel,
  currentLogo,
  defaultValue = "",
  placeholderLabel = "Select a brand...",
  allowEmpty = false,
  onChange = () => {},
}) {
  if (
    !combobox ||
    !trigger ||
    !menu ||
    !optionsRoot ||
    !emptyState ||
    !currentLabel ||
    !currentLogo
  ) {
    return null;
  }

  if (!optionsRoot.children.length) {
    const fragment = document.createDocumentFragment();
    BRAND_CATALOG.forEach((brandName) => {
      fragment.appendChild(createBrandOption(brandName));
    });
    optionsRoot.appendChild(fragment);
  }

  const brandOptions = Array.from(optionsRoot.querySelectorAll("[data-brand-option]"));
  const findBrandOption = (brandName) =>
    brandOptions.find((option) => option.dataset.brandValue === brandName);
  const getFallbackValue = () => {
    if (defaultValue && findBrandOption(defaultValue)) return defaultValue;
    return brandOptions[0]?.dataset.brandValue || "";
  };

  let selectedBrand = String(hiddenInput?.value || nativeSelect?.value || defaultValue || "").trim();
  if (!selectedBrand || !findBrandOption(selectedBrand)) {
    selectedBrand = allowEmpty ? "" : getFallbackValue();
  }

  const setBrandMenuOpen = (open) => {
    menu.classList.toggle("hidden", !open);
    trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      search?.focus();
      return;
    }
    search?.blur();
  };

  const filterBrandOptions = (searchTerm) => {
    const normalized = String(searchTerm || "").trim().toLowerCase();
    let visibleCount = 0;
    brandOptions.forEach((option) => {
      const name = (option.dataset.brandValue || "").toLowerCase();
      const visible = !normalized || name.includes(normalized);
      option.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    emptyState.classList.toggle("hidden", visibleCount > 0);
  };

  const setSelectedBrand = (nextBrand) => {
    const normalized = String(nextBrand || "").trim();
    if (normalized && !findBrandOption(normalized)) return;

    if (!normalized) {
      selectedBrand = allowEmpty ? "" : getFallbackValue();
    } else {
      selectedBrand = normalized;
    }

    if (hiddenInput) hiddenInput.value = selectedBrand;
    if (nativeSelect) nativeSelect.value = selectedBrand;
    currentLabel.textContent = selectedBrand || placeholderLabel;

    const activeOption = findBrandOption(selectedBrand);
    const activeLogo = activeOption?.dataset.brandLogo || SOURCE_LOGOS[selectedBrand] || "";
    if (selectedBrand && activeLogo) {
      currentLogo.src = activeLogo;
      currentLogo.alt = `${selectedBrand} logo`;
      currentLogo.hidden = false;
    } else {
      currentLogo.removeAttribute("src");
      currentLogo.alt = "";
      currentLogo.hidden = true;
    }

    brandOptions.forEach((option) => {
      const active = option.dataset.brandValue === selectedBrand;
      option.setAttribute("aria-selected", String(active));
      option.classList.toggle("bg-primary-fixed/55", active);
      const check = option.querySelector("[data-brand-option-check]");
      if (check) {
        check.classList.toggle("opacity-100", active);
        check.classList.toggle("opacity-0", !active);
      }
    });

    onChange(selectedBrand);
  };

  trigger.addEventListener("click", () => {
    const isHidden = menu.classList.contains("hidden");
    setBrandMenuOpen(isHidden);
    if (isHidden && search) {
      search.value = "";
      filterBrandOptions("");
    }
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setBrandMenuOpen(true);
      if (search) {
        search.value = "";
        filterBrandOptions("");
      }
    }
  });

  search?.addEventListener("input", () => {
    filterBrandOptions(search.value);
  });

  search?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    setBrandMenuOpen(false);
    trigger.focus();
  });

  brandOptions.forEach((option) => {
    option.addEventListener("click", () => {
      setSelectedBrand(option.dataset.brandValue || selectedBrand);
      setBrandMenuOpen(false);
      trigger.focus();
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (menu.classList.contains("hidden")) return;
    if (!(event.target instanceof Node)) return;
    if (!combobox.contains(event.target)) {
      setBrandMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setBrandMenuOpen(false);
    }
  });

  setSelectedBrand(selectedBrand);
  filterBrandOptions("");

  return {
    getValue: () => selectedBrand,
    setValue: setSelectedBrand,
  };
}

function initCheckBalance() {
  const form = document.querySelector("#balance-form");
  if (!form) return;
  const isSellFlow = document.body.dataset.page === "sell";

  const brandButtons = Array.from(document.querySelectorAll("[data-brand]"));
  const brandSelect = document.querySelector("#brand_select");
  const brandInput = document.querySelector("#selected_brand");
  const brandCombobox = document.querySelector("[data-brand-combobox]");
  const brandTrigger = document.querySelector("[data-brand-trigger]");
  const brandMenu = document.querySelector("[data-brand-menu]");
  const brandSearch = document.querySelector("[data-brand-search]");
  const brandOptionsRoot = document.querySelector("[data-brand-options]");
  const brandEmptyState = document.querySelector("[data-brand-empty]");
  const brandCurrentLabel = document.querySelector("[data-brand-current]");
  const brandCurrentLogo = document.querySelector("[data-brand-current-logo]");
  const result = document.querySelector("#verify-popup");
  const resultTitle = document.querySelector("#verify-popup-title");
  const resultCopy = document.querySelector("#verify-popup-copy");
  const resultBrand = document.querySelector("#verify-popup-brand");
  const resultBrandLabel = document.querySelector("#verify-popup-brand-label");
  const resultBrandRow = document.querySelector("#verify-popup-brand-row");
  const resultAmount = document.querySelector("#verify-popup-amount");
  const resultAmountLabel = document.querySelector("#verify-popup-amount-label");
  const resultAmountRow = document.querySelector("#verify-popup-amount-row");
  const resultKicker = document.querySelector("#verify-popup-kicker");
  const resultStatus = document.querySelector("#verify-popup-status");
  const resultStatusLabel = document.querySelector("#verify-popup-status-label");
  const resultStatusRow = document.querySelector("#verify-popup-status-row");
  const resultPrimaryButton = document.querySelector("#verify-popup-primary");
  const resultCloseButtons = Array.from(document.querySelectorAll("[data-verify-popup-close]"));
  const cardValueInput = document.querySelector("#card_value");
  const currencyInput = document.querySelector("#card_currency");
  const sellerEmailInput = document.querySelector("#seller_email");
  const sellEstimatedPayout = document.querySelector("#sell-estimated-payout");
  const sellEstimateCopy = document.querySelector("#sell-estimate-copy");
  const cardTypeButtons = Array.from(document.querySelectorAll("[data-card-type-button]"));
  const cardImageSection = document.querySelector("[data-card-image-section]");
  let selectedBrand = brandInput?.value || brandSelect?.value || "Amazon";
  const payoutRates = {
    Amazon: 0.86,
    "Google Play": 0.84,
    iTunes: 0.83,
    Netflix: 0.82,
    PlayStation: 0.85,
    "Razer Gold": 0.86,
    Starbucks: 0.8,
  };
  const parseCurrencyInput = (value) => {
    const parsed = Number.parseFloat(String(value || "").replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed;
  };
  const formatCurrencyAmount = (amount, currency = "USD") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount);
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
  };
  const formatUsd = (amount) => formatCurrencyAmount(amount, "USD");
  const getSellRateForBrand = (brandName) => payoutRates[brandName] || 0.85;

  const closeVerifyPopup = () => {
    if (!result) return;
    result.classList.add("hidden");
    result.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  };

  const openVerifyPopup = ({
    variant = "success",
    kicker,
    title,
    copy,
    brand = selectedBrand,
    brandLabel = "Brand",
    amount = "",
    amountLabel = "Amount",
    status = "",
    statusLabel = "Status",
    primaryLabel = "Close",
  }) => {
    if (
      !result ||
      !resultTitle ||
      !resultCopy ||
      !resultBrand ||
      !resultBrandLabel ||
      !resultBrandRow ||
      !resultAmount ||
      !resultKicker ||
      !resultPrimaryButton ||
      !resultAmountLabel ||
      !resultAmountRow ||
      !resultStatus ||
      !resultStatusLabel ||
      !resultStatusRow
    ) {
      return;
    }

    const isError = variant === "error";
    resultKicker.textContent = kicker;
    resultTitle.textContent = title;
    resultCopy.textContent = copy;
    resultPrimaryButton.textContent = primaryLabel;
    resultBrandLabel.textContent = `${brandLabel}:`;
    resultBrand.textContent = brand;
    resultAmountLabel.textContent = amountLabel;
    resultAmount.textContent = amount;
    resultStatusLabel.textContent = `${statusLabel}:`;
    resultStatus.textContent = status;
    resultBrandRow.classList.toggle("hidden", !brand);
    resultAmountRow.classList.toggle("hidden", !amount);
    resultStatusRow.classList.toggle("hidden", !status);

    resultKicker.className = isError
      ? "text-4xl font-light tracking-tight text-[#d92d20] sm:text-5xl lg:text-6xl"
      : "text-4xl font-light tracking-tight text-[#198754] sm:text-5xl lg:text-6xl";

    resultPrimaryButton.className =
      "mx-auto mt-10 inline-flex rounded-[0.9rem] bg-[#e63946] px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#cf3340]";

    result.classList.remove("hidden");
    result.classList.add("flex");
    document.body.classList.add("overflow-hidden");
    resultPrimaryButton.focus();
  };

  resultPrimaryButton?.addEventListener("click", closeVerifyPopup);
  resultCloseButtons.forEach((button) => {
    button.addEventListener("click", closeVerifyPopup);
  });

  const updateSellEstimate = () => {
    if (!isSellFlow || !sellEstimatedPayout) return;
    const cardValue = parseCurrencyInput(cardValueInput?.value);
    const rate = getSellRateForBrand(selectedBrand);
    const estimated = cardValue > 0 ? cardValue * rate : 0;
    sellEstimatedPayout.textContent = formatUsd(estimated);
    if (sellEstimateCopy) {
      sellEstimateCopy.textContent =
        cardValue > 0
          ? `Up to ${Math.round(rate * 100)}% of your ${selectedBrand} card value`
          : "Up to 85% of card value";
    }
  };

  let selectedCardType =
    cardTypeButtons.find((button) => button.getAttribute("aria-pressed") === "true")?.dataset
      .cardTypeButton || "physical";

  const syncCardTypeUI = () => {
    cardTypeButtons.forEach((button) => {
      const active = button.dataset.cardTypeButton === selectedCardType;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("bg-surface-container-lowest", active);
      button.classList.toggle("bg-surface-container-low", !active);
      button.classList.toggle("border-primary", active);
      button.classList.toggle("border-transparent", !active);
      button.classList.toggle("text-primary", active);
      button.classList.toggle("text-on-surface-variant", !active);
      button.classList.toggle("shadow-sm", active);
      button.classList.toggle("hover:border-outline-variant/30", !active);

      const icon = button.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.classList.toggle("text-primary", active);
        icon.classList.toggle("text-outline", !active);
      }
    });

    if (cardImageSection) {
      cardImageSection.classList.toggle("hidden", selectedCardType === "digital");
    }
  };

  cardTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCardType = button.dataset.cardTypeButton || "physical";
      syncCardTypeUI();
    });
  });

  syncCardTypeUI();

  const syncBrandButtons = () => {
    brandButtons.forEach((item) => {
      const active = item.dataset.brand === selectedBrand;
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

  const brandPicker = initBrandCombobox({
    combobox: brandCombobox,
    hiddenInput: brandInput,
    nativeSelect: brandSelect,
    trigger: brandTrigger,
    menu: brandMenu,
    search: brandSearch,
    optionsRoot: brandOptionsRoot,
    emptyState: brandEmptyState,
    currentLabel: brandCurrentLabel,
    currentLogo: brandCurrentLogo,
    defaultValue: "Amazon",
    onChange: (brandName) => {
      selectedBrand = brandName || "Amazon";
      syncBrandButtons();
      if (isSellFlow) updateSellEstimate();
    },
  });

  if (brandPicker?.getValue()) {
    selectedBrand = brandPicker.getValue();
  }

  if (brandButtons.length) {
    brandButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextBrand = button.dataset.brand || selectedBrand;
        if (brandPicker) {
          brandPicker.setValue(nextBrand);
          return;
        }
        selectedBrand = nextBrand;
        syncBrandButtons();
        if (isSellFlow) updateSellEstimate();
      });
    });
  }

  if (brandInput && !brandInput.value) {
    brandInput.value = selectedBrand;
  }

  if (isSellFlow) {
    updateSellEstimate();
    cardValueInput?.addEventListener("input", updateSellEstimate);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const cardNumberInput = document.querySelector("#card_number");
    const pinInput = document.querySelector("#pin");
    const digits = (cardNumberInput?.value || "").replace(/\D/g, "");
    const pin = (pinInput?.value || "").trim();
    const verifyAmount = parseCurrencyInput(cardValueInput?.value);
    const selectedCurrency = String(currencyInput?.value || "USD").toUpperCase();

    if (isSellFlow) {
      const cardValue = parseCurrencyInput(cardValueInput?.value);
      const sellerEmail = (sellerEmailInput?.value || "").trim();
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail);

      if (digits.length < 8 || cardValue <= 0 || !emailIsValid) {
        openSitePopup({
          variant: "error",
          kicker: "Action Needed",
          title: "More details needed",
          copy: "Enter a valid card number, card value, and email address to get your payout quote.",
          amount: "Review form",
          amountLabel: "What to fix",
          primaryLabel: "Try again",
        });
        updateSellEstimate();
        return;
      }

      const rate = getSellRateForBrand(selectedBrand);
      const estimated = cardValue * rate;
      if (sellEstimatedPayout) {
        sellEstimatedPayout.textContent = formatUsd(estimated);
      }
      if (sellEstimateCopy) {
        sellEstimateCopy.textContent = `Up to ${Math.round(rate * 100)}% of your ${selectedBrand} card value`;
      }
      openSitePopup({
        variant: "success",
        kicker: "Quote Ready",
        title: `${selectedBrand} payout prepared`,
        copy: "Quote request received. Final rate may vary after verification and image review.",
        amount: formatUsd(estimated),
        amountLabel: "Estimated Payout",
        primaryLabel: "Done",
      });
      return;
    }

    const usesAmountVerification = Boolean(cardValueInput && !cardNumberInput);
    if (usesAmountVerification) {
      if (verifyAmount <= 0 || pin.length < 4) {
        openVerifyPopup({
          variant: "error",
          kicker: "ATTENTION",
          title: "We need a few more details to continue",
          copy: "Please review this result",
          brand: selectedBrand,
          amount: "Card amount and redemption code",
          amountLabel: "Required",
          status: "Check your input",
          primaryLabel: "Close",
        });
        return;
      }

      openVerifyPopup({
        variant: "success",
        kicker: "SUCCESS!",
        title: `Your ${selectedBrand} gift card has been verified`,
        copy: "Here's the result",
        brand: selectedBrand,
        amount: formatCurrencyAmount(verifyAmount, selectedCurrency),
        amountLabel: "Amount",
        status: "Ready for review",
        primaryLabel: "Close",
      });
      return;
    }

    if (digits.length < 8 || pin.length < 4) {
      openVerifyPopup({
        variant: "error",
        kicker: "ATTENTION",
        title: "We need a few more details to continue",
        copy: "Please review this result",
        brand: selectedBrand,
        amount: "Card digits and security code",
        amountLabel: "Required",
        status: "Check your input",
        primaryLabel: "Close",
      });
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

    openVerifyPopup({
      variant: "success",
      kicker: "SUCCESS!",
      title: `Your ${selectedBrand} gift card has been verified`,
      copy: "Here's the result",
      brand: selectedBrand,
      amount: formatUsd(computedBalance),
      amountLabel: "Available Balance",
      status: `Active ending in ${maskedNumber}`,
      primaryLabel: "Close",
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && result && !result.classList.contains("hidden")) {
      closeVerifyPopup();
    }
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

function initBuyBrandSelect() {
  initBrandCombobox({
    combobox: document.querySelector("[data-buy-brand-combobox]"),
    hiddenInput: document.querySelector("#buy_selected_brand"),
    trigger: document.querySelector("[data-buy-brand-trigger]"),
    menu: document.querySelector("[data-buy-brand-menu]"),
    search: document.querySelector("[data-buy-brand-search]"),
    optionsRoot: document.querySelector("[data-buy-brand-options]"),
    emptyState: document.querySelector("[data-buy-brand-empty]"),
    currentLabel: document.querySelector("[data-buy-brand-current]"),
    currentLogo: document.querySelector("[data-buy-brand-current-logo]"),
    placeholderLabel: "Select a brand...",
    allowEmpty: true,
  });
}

function initBuyPageActions() {
  if (document.body.dataset.page !== "buy") return;

  const brandInput = document.querySelector("#buy_selected_brand");
  const valueButtons = Array.from(document.querySelectorAll("[data-buy-value-button]"));
  const submitButton = document.querySelector("[data-buy-submit]");
  const cartCount = document.querySelector("[data-buy-cart-count]");
  const cartTitle = document.querySelector("[data-buy-cart-title]");
  const cartCopy = document.querySelector("[data-buy-cart-copy]");

  if (!submitButton || !valueButtons.length) return;

  let selectedValue =
    valueButtons.find((button) => button.classList.contains("border-primary-container"))?.dataset
      .buyValue || valueButtons[0]?.dataset.buyValue || "25";
  let cartItems = Number.parseInt(cartCount?.textContent || "0", 10) || 0;

  const syncValueButtons = () => {
    valueButtons.forEach((button) => {
      const active = button.dataset.buyValue === selectedValue;
      button.classList.toggle("text-primary", active);
      button.classList.toggle("font-bold", active);
      button.classList.toggle("border-2", active);
      button.classList.toggle("border-primary-container", active);
      button.classList.toggle("text-on-surface", !active);
      button.classList.toggle("font-semibold", !active);
      button.classList.toggle("border", !active);
      button.classList.toggle("border-transparent", !active);
    });
  };

  valueButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedValue = button.dataset.buyValue || selectedValue;
      syncValueButtons();
    });
  });

  submitButton.addEventListener("click", () => {
    const selectedBrand = String(brandInput?.value || "").trim();
    if (!selectedBrand) {
      openSitePopup({
        variant: "error",
        kicker: "Choose Brand",
        title: "Select a gift card brand",
        copy: "Pick a brand from the dropdown before adding a card value to your cart.",
        amount: "",
        primaryLabel: "Got it",
      });
      return;
    }

    cartItems += 1;
    if (cartCount) cartCount.textContent = String(cartItems);
    if (cartTitle) {
      cartTitle.textContent = cartItems === 1 ? "1 item ready" : `${cartItems} items ready`;
    }
    if (cartCopy) {
      cartCopy.textContent = `${selectedBrand} ${selectedValue === "Custom" ? "custom amount" : `$${selectedValue}`} added to your cart.`;
    }

    openSitePopup({
      variant: "success",
      kicker: "Added To Cart",
      title: `${selectedBrand} ready for checkout`,
      copy: "Your selected gift card has been saved to the cart. You can keep browsing or move to checkout next.",
      amount: selectedValue === "Custom" ? "Custom" : `$${selectedValue}`,
      amountLabel: "Card Value",
      primaryLabel: "Continue",
    });
  });

  syncValueButtons();
}

initCheckBalance();
initMarketplace();
initBuyBrandSelect();
initBuyPageActions();
