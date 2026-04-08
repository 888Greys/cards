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
  const result = document.querySelector("#balance-result");
  const resultTitle = document.querySelector("#balance-result-title");
  const resultCopy = document.querySelector("#balance-result-copy");
  const resultAmount = document.querySelector("#balance-result-amount");

  const sourceLogos = {
    Amazon: "https://giftcardsverification.com/assets/amazon-BfIbjzwm.svg",
    "Best Buy": "https://giftcardsverification.com/assets/bestbuy-PUgd5tmT.svg",
    "Google Play": "https://giftcardsverification.com/assets/google-play-DVbUjTfg.svg",
    IHOP: "https://giftcardsverification.com/assets/ihop-BTZxzZen.svg",
    Minecraft: "https://giftcardsverification.com/assets/minecraft-Bf9XL00k.svg",
    PlayStation: "https://giftcardsverification.com/assets/playstation-Bjsx8rFf.svg",
    "Razer Gold": "https://giftcardsverification.com/assets/razer-gold-BCWOljXY.svg",
    Starbucks: "https://giftcardsverification.com/assets/starbucks-BhqGqRuF.svg",
    Subway: "https://giftcardsverification.com/assets/subway-CNB96_XZ.svg",
  };

  const brandCatalog = [
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

  const initialsFromName = (name) => {
    const words = String(name || "")
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return "GC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const createBrandOption = (brandName) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className =
      "w-full px-3 py-2.5 rounded-lg text-left hover:bg-primary-fixed/35 transition-colors flex items-center justify-between gap-3";
    option.setAttribute("data-brand-option", "");
    option.setAttribute("data-brand-value", brandName);
    const logo = sourceLogos[brandName] || "";
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
  };

  if (brandOptionsRoot && !brandOptionsRoot.children.length) {
    const fragment = document.createDocumentFragment();
    brandCatalog.forEach((brandName) => {
      fragment.appendChild(createBrandOption(brandName));
    });
    brandOptionsRoot.appendChild(fragment);
  }

  const brandOptions = Array.from(document.querySelectorAll("[data-brand-option]"));
  let selectedBrand =
    brandInput?.value || brandSelect?.value || brandOptions[0]?.dataset.brandValue || "Amazon";

  const findBrandOption = (brandName) =>
    brandOptions.find((option) => option.dataset.brandValue === brandName);

  const setBrandMenuOpen = (open) => {
    if (!brandMenu || !brandTrigger) return;
    brandMenu.classList.toggle("hidden", !open);
    brandTrigger.setAttribute("aria-expanded", String(open));
    if (open) {
      brandSearch?.focus();
      return;
    }
    brandSearch?.blur();
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
    if (brandEmptyState) {
      brandEmptyState.classList.toggle("hidden", visibleCount > 0);
    }
  };

  const setSelectedBrand = (nextBrand) => {
    selectedBrand = String(nextBrand || selectedBrand);
    if (brandInput) brandInput.value = selectedBrand;
    if (brandSelect) brandSelect.value = selectedBrand;
    if (brandCurrentLabel) brandCurrentLabel.textContent = selectedBrand;

    const activeOption = findBrandOption(selectedBrand);
    const activeLogo = activeOption?.dataset.brandLogo || "";
    if (brandCurrentLogo) {
      if (activeLogo) {
        brandCurrentLogo.src = activeLogo;
        brandCurrentLogo.alt = `${selectedBrand} logo`;
        brandCurrentLogo.hidden = false;
      } else {
        brandCurrentLogo.removeAttribute("src");
        brandCurrentLogo.alt = "";
        brandCurrentLogo.hidden = true;
      }
    }

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
  };

  if (brandButtons.length) {
    brandButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setSelectedBrand(button.dataset.brand || selectedBrand);
      });
    });
  }

  if (brandSelect) {
    brandSelect.value = selectedBrand;
    brandSelect.addEventListener("change", () => {
      setSelectedBrand(brandSelect.value || selectedBrand);
    });
  }

  if (brandTrigger) {
    brandTrigger.addEventListener("click", () => {
      const isHidden = brandMenu?.classList.contains("hidden");
      setBrandMenuOpen(Boolean(isHidden));
      if (isHidden && brandSearch) {
        brandSearch.value = "";
        filterBrandOptions("");
      }
    });

    brandTrigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setBrandMenuOpen(true);
        if (brandSearch) {
          brandSearch.value = "";
          filterBrandOptions("");
        }
      }
    });
  }

  brandSearch?.addEventListener("input", () => {
    filterBrandOptions(brandSearch.value);
  });

  brandSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    setBrandMenuOpen(false);
    brandTrigger?.focus();
  });

  brandOptions.forEach((option) => {
    option.addEventListener("click", () => {
      setSelectedBrand(option.dataset.brandValue || selectedBrand);
      setBrandMenuOpen(false);
      brandTrigger?.focus();
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!brandMenu || brandMenu.classList.contains("hidden")) return;
    if (!(event.target instanceof Node)) return;
    if (!brandCombobox?.contains(event.target)) {
      setBrandMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setBrandMenuOpen(false);
    }
  });

  if (brandOptions.length && !findBrandOption(selectedBrand)) {
    selectedBrand = brandOptions[0].dataset.brandValue || selectedBrand;
  }

  setSelectedBrand(selectedBrand);
  filterBrandOptions("");

  if (brandInput && !brandInput.value) {
    brandInput.value = selectedBrand;
  }

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
