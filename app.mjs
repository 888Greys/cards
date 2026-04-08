import {
  STORAGE_KEY,
  DEFAULT_STATE,
  cloneState,
  formatCurrency,
  formatTradeValue,
  filterMarketplaceItems,
  summarizeTrades,
  calculateBalanceResult,
  createPendingTradeFromItem,
} from "./app-data.mjs";

let memoryState = cloneState(DEFAULT_STATE);

function safeStorageGet() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeStorageSet(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

function loadState() {
  const stored = safeStorageGet();
  if (!stored) {
    return cloneState(memoryState);
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      ...cloneState(DEFAULT_STATE),
      ...parsed,
      user: { ...DEFAULT_STATE.user, ...(parsed.user || {}) },
      lastBalanceCheck: { ...DEFAULT_STATE.lastBalanceCheck, ...(parsed.lastBalanceCheck || {}) },
      trades: Array.isArray(parsed.trades) ? parsed.trades : cloneState(DEFAULT_STATE.trades),
      savedCards: Array.isArray(parsed.savedCards) ? parsed.savedCards : cloneState(DEFAULT_STATE.savedCards),
      marketItems: Array.isArray(parsed.marketItems) ? parsed.marketItems : cloneState(DEFAULT_STATE.marketItems),
    };
  } catch {
    return cloneState(DEFAULT_STATE);
  }
}

function saveState(state) {
  memoryState = cloneState(state);
  safeStorageSet(JSON.stringify(state));
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function applyActiveNavigation(page) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const active = link.getAttribute("data-route") === page;
    link.setAttribute("data-active", String(active));
  });
}

function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
}

function renderTradeList(container, trades) {
  if (!container) {
    return;
  }

  if (!trades.length) {
    container.innerHTML = `
      <div class="rounded-2xl border border-dashed border-outline-variant p-6 text-sm text-on-surface-variant">
        No trades yet. Start from the marketplace to generate your first pending order.
      </div>
    `;
    return;
  }

  container.innerHTML = trades
    .map((trade) => {
      const statusTone =
        trade.status === "completed"
          ? "bg-tertiary-fixed text-on-surface"
          : trade.status === "pending"
            ? "bg-secondary-fixed text-on-surface"
            : "bg-red-100 text-on-surface";

      return `
        <div class="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-low p-4">
          <div>
            <p class="font-bold text-on-surface">${trade.title}</p>
            <p class="text-xs text-on-surface-variant">${formatShortDate(trade.date)} | ${trade.note}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-on-surface">${formatTradeValue(trade)}</p>
            <span class="inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${statusTone}">
              ${trade.status}
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderHome(state) {
  const summary = summarizeTrades(state.trades);
  setText("[data-home-name]", state.user.name.split(" ")[0]);
  setText("[data-home-wallet]", formatCurrency(state.user.walletBalance));
  setText("[data-home-trades]", String(summary.totalTrades));
  setText("[data-home-volume]", formatCurrency(summary.completedVolume));
  setText("[data-home-pending]", String(summary.pendingCount));

  renderTradeList(document.querySelector("[data-home-activity]"), state.trades.slice(0, 3));

  const lastCheck = document.querySelector("[data-home-last-check]");
  if (lastCheck) {
    lastCheck.innerHTML = `
      <div class="rounded-3xl bg-surface-container p-6">
        <p class="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Latest verification</p>
        <div class="mt-4 flex items-end justify-between gap-6">
          <div>
            <p class="text-3xl font-black text-on-surface">${formatCurrency(state.lastBalanceCheck.balance)}</p>
            <p class="text-sm text-on-surface-variant">${state.lastBalanceCheck.brand} ending in ${state.lastBalanceCheck.cardSuffix}</p>
          </div>
          <span class="rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            ${state.lastBalanceCheck.status.replace("_", " ")}
          </span>
        </div>
        <p class="mt-4 text-sm text-on-surface-variant">${state.lastBalanceCheck.message}</p>
      </div>
    `;
  }
}

function renderVerifyResult(result) {
  const panel = document.querySelector("[data-balance-result]");
  if (!panel) {
    return;
  }

  panel.setAttribute("data-status", result.status);
  panel.innerHTML = `
    <p class="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Verification result</p>
    <div class="mt-5 flex items-end justify-between gap-4">
      <div>
        <p class="text-4xl font-black text-on-surface">${formatCurrency(result.balance)}</p>
        <p class="mt-1 text-sm text-on-surface-variant">${result.brand} card ending in ${result.cardSuffix}</p>
      </div>
      <span class="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface">
        ${result.status.replace("_", " ")}
      </span>
    </div>
    <p class="mt-5 text-sm leading-relaxed text-on-surface-variant">${result.message}</p>
    <p class="mt-4 text-xs font-medium text-on-surface-variant">Checked ${formatShortDate(result.checkedAt)}</p>
  `;
}

function initVerify(state) {
  let selectedBrand = state.lastBalanceCheck.brand || "Amazon";
  const brandButtons = [...document.querySelectorAll("[data-brand-option]")];
  const form = document.querySelector("[data-verify-form]");
  const notice = document.querySelector("[data-verify-notice]");

  function syncBrandButtons() {
    brandButtons.forEach((button) => {
      button.setAttribute("data-active", String(button.dataset.brand === selectedBrand));
    });
  }

  brandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedBrand = button.dataset.brand || selectedBrand;
      syncBrandButtons();
    });
  });

  syncBrandButtons();
  renderVerifyResult(state.lastBalanceCheck);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const cardNumber = form.querySelector("[name='cardNumber']").value;
    const pin = form.querySelector("[name='pin']").value;
    const result = calculateBalanceResult({ brand: selectedBrand, cardNumber, pin });

    state.lastBalanceCheck = result;
    saveState(state);
    renderVerifyResult(result);

    if (notice) {
      notice.hidden = false;
      notice.dataset.tone = result.ok ? "success" : "warning";
      notice.textContent = result.ok
        ? "Verification updated. The account and home screens now use this latest result."
        : result.message;
    }
  });
}

function renderMarketGrid(container, items) {
  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML = `
      <div class="rounded-3xl border border-dashed border-outline-variant p-10 text-center text-on-surface-variant">
        No offers match this filter yet. Try another category or switch between Buy and Sell.
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <article class="market-card rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-tertiary">${item.badge}</p>
              <h3 class="mt-2 text-xl font-bold text-on-surface">${item.title}</h3>
              <p class="mt-1 text-sm text-on-surface-variant">${item.brand} | ${item.category}</p>
            </div>
            <span class="rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              ${item.mode}
            </span>
          </div>
          <p class="mt-5 text-sm leading-relaxed text-on-surface-variant">${item.description}</p>
          <div class="mt-8 flex items-end justify-between gap-4 border-t border-outline-variant/15 pt-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">${item.turnaround}</p>
              <p class="mt-2 text-2xl font-black text-secondary">${formatCurrency(item.denomination)} for ${formatCurrency(item.rate)}</p>
            </div>
            <button
              type="button"
              data-market-action="${item.id}"
              class="rounded-full bg-secondary px-5 py-3 text-sm font-bold text-on-secondary transition hover:opacity-90"
            >
              Add trade
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function initMarketplace(state) {
  let currentMode = "buy";
  let currentCategory = "All Brands";
  let currentQuery = "";

  const grid = document.querySelector("[data-market-grid]");
  const feedback = document.querySelector("[data-market-feedback]");
  const modeButtons = [...document.querySelectorAll("[data-market-mode]")];
  const categoryButtons = [...document.querySelectorAll("[data-market-category]")];
  const searchInput = document.querySelector("[data-market-search]");

  function render() {
    modeButtons.forEach((button) => {
      button.setAttribute("data-active", String(button.dataset.marketMode === currentMode));
    });
    categoryButtons.forEach((button) => {
      button.setAttribute("data-active", String(button.dataset.marketCategory === currentCategory));
    });

    const items = filterMarketplaceItems(state.marketItems, {
      mode: currentMode,
      category: currentCategory,
      query: currentQuery,
    });

    renderMarketGrid(grid, items);

    grid?.querySelectorAll("[data-market-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = state.marketItems.find((entry) => entry.id === button.dataset.marketAction);
        if (!item) {
          return;
        }

        const trade = createPendingTradeFromItem(item);
        state.trades.unshift(trade);
        saveState(state);

        if (feedback) {
          feedback.hidden = false;
          feedback.dataset.tone = "success";
          feedback.textContent = `${item.title} was added as a pending ${item.mode} trade. Open Account to see it in your activity feed.`;
        }
      });
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentMode = button.dataset.marketMode || currentMode;
      render();
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.marketCategory || currentCategory;
      render();
    });
  });

  searchInput?.addEventListener("input", (event) => {
    currentQuery = event.target.value;
    render();
  });

  render();
}

function initAccount(state) {
  const summary = summarizeTrades(state.trades);
  setText("[data-account-name]", state.user.name);
  setText("[data-account-wallet]", formatCurrency(state.user.walletBalance));
  setText("[data-account-volume]", formatCurrency(summary.completedVolume));
  setText("[data-account-pending]", String(summary.pendingCount));
  setText("[data-account-total]", String(summary.totalTrades));

  renderTradeList(document.querySelector("[data-account-trades]"), state.trades);

  const cards = document.querySelector("[data-account-cards]");
  if (cards) {
    cards.innerHTML = state.savedCards
      .map(
        (card) => `
          <div class="rounded-3xl bg-gradient-to-br from-primary to-primary-container p-6 text-white surface-card">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold tracking-[0.24em]">${card.network}</span>
              <span class="material-symbols-outlined">contactless</span>
            </div>
            <p class="mt-10 font-mono text-xl tracking-[0.28em]">${card.maskedNumber}</p>
            <div class="mt-8 flex items-end justify-between gap-4 text-xs uppercase tracking-[0.24em]">
              <div>
                <p class="opacity-70">Holder</p>
                <p class="mt-1 text-sm font-bold normal-case tracking-normal">${card.holder}</p>
              </div>
              <div class="text-right">
                <p class="opacity-70">Expires</p>
                <p class="mt-1 text-sm font-bold normal-case tracking-normal">${card.expiry}</p>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
  }

  const verification = document.querySelector("[data-account-last-check]");
  if (verification) {
    verification.innerHTML = `
      <div class="result-panel rounded-3xl p-6" data-status="${state.lastBalanceCheck.status}">
        <p class="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Latest card check</p>
        <p class="mt-4 text-3xl font-black text-on-surface">${formatCurrency(state.lastBalanceCheck.balance)}</p>
        <p class="mt-2 text-sm text-on-surface-variant">${state.lastBalanceCheck.brand} ending in ${state.lastBalanceCheck.cardSuffix}</p>
        <p class="mt-4 text-sm leading-relaxed text-on-surface-variant">${state.lastBalanceCheck.message}</p>
      </div>
    `;
  }
}

function initShared() {
  applyActiveNavigation(document.body.dataset.page || "");
  setupMenu();
  setText("[data-current-year]", String(new Date().getFullYear()));
}

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  const page = document.body.dataset.page;

  initShared();

  if (page === "home") {
    renderHome(state);
  }

  if (page === "verify") {
    initVerify(state);
  }

  if (page === "marketplace") {
    initMarketplace(state);
  }

  if (page === "account") {
    initAccount(state);
  }
});
