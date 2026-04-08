export const STORAGE_KEY = "giftcardshub-demo-state-v1";

export const MARKET_ITEMS = [
  {
    id: "amazon-global-buy",
    brand: "Amazon",
    title: "Amazon Global Card",
    category: "Ecommerce",
    mode: "buy",
    denomination: 100,
    rate: 88.5,
    turnaround: "Instant verification",
    badge: "Trending",
    description: "US and UK cards with strong liquidity and fast settlement.",
  },
  {
    id: "steam-global-sell",
    brand: "Steam",
    title: "Steam Wallet",
    category: "Gaming",
    mode: "sell",
    denomination: 50,
    rate: 42,
    turnaround: "Average 2 minutes",
    badge: "Fast",
    description: "Popular for digital gaming buyers looking for immediate payout.",
  },
  {
    id: "netflix-us-buy",
    brand: "Netflix",
    title: "Netflix Premium",
    category: "Entertainment",
    mode: "buy",
    denomination: 25,
    rate: 21.5,
    turnaround: "Under 5 minutes",
    badge: "Popular",
    description: "US entertainment cards priced for repeat buyers.",
  },
  {
    id: "apple-sell",
    brand: "Apple",
    title: "Apple Gift Card",
    category: "Ecommerce",
    mode: "sell",
    denomination: 100,
    rate: 86,
    turnaround: "High liquidity",
    badge: "Stable",
    description: "Reliable demand and strong payout performance.",
  },
  {
    id: "psn-buy",
    brand: "PlayStation",
    title: "PSN Gift Card",
    category: "Gaming",
    mode: "buy",
    denomination: 50,
    rate: 44.5,
    turnaround: "Instant delivery",
    badge: "New",
    description: "Console-focused offers with quick checkout.",
  },
  {
    id: "uber-buy",
    brand: "Uber",
    title: "Uber Cash Card",
    category: "Travel",
    mode: "buy",
    denomination: 75,
    rate: 67,
    turnaround: "Same day",
    badge: "Urban",
    description: "Useful for travel and mobility spending.",
  },
  {
    id: "razer-sell",
    brand: "Razer",
    title: "Razer Gold",
    category: "Gaming",
    mode: "sell",
    denomination: 200,
    rate: 178,
    turnaround: "Priority queue",
    badge: "High value",
    description: "Large denomination gaming cards with fast review.",
  },
  {
    id: "starbucks-buy",
    brand: "Starbucks",
    title: "Starbucks Card",
    category: "Food and Drink",
    mode: "buy",
    denomination: 30,
    rate: 26.4,
    turnaround: "Under 10 minutes",
    badge: "Lifestyle",
    description: "Lightweight consumer cards for everyday usage.",
  },
];

export const DEFAULT_STATE = {
  user: {
    name: "Julian Sterling",
    email: "julian@giftcardshub.app",
    walletBalance: 2450,
  },
  trades: [
    {
      id: "45920",
      brand: "Amazon",
      title: "Amazon Gift Card",
      type: "sell",
      value: 500,
      status: "completed",
      date: "2026-04-06T10:15:00.000Z",
      note: "Amazon US",
    },
    {
      id: "45881",
      brand: "Apple",
      title: "Apple iTunes Card",
      type: "sell",
      value: 200,
      status: "pending",
      date: "2026-04-05T12:30:00.000Z",
      note: "iTunes global",
    },
    {
      id: "45722",
      brand: "Google Play",
      title: "Google Play Store",
      type: "sell",
      value: 1200,
      status: "completed",
      date: "2026-04-02T09:10:00.000Z",
      note: "Google Play EU",
    },
  ],
  savedCards: [
    {
      id: "card-8829",
      network: "VISA",
      maskedNumber: "**** **** **** 8829",
      holder: "Julian Sterling",
      expiry: "09/27",
    },
  ],
  lastBalanceCheck: {
    ok: true,
    status: "verified",
    brand: "iTunes",
    balance: 73.2,
    currency: "USD",
    cardSuffix: "4421",
    checkedAt: "2026-04-08T07:20:00.000Z",
    message: "Card verified. Funds are available for trade.",
  },
  marketItems: MARKET_ITEMS,
};

const BRAND_BASES = {
  Amazon: 82,
  Apple: 96,
  iTunes: 74,
  "Google Play": 58,
  Netflix: 42,
  Steam: 67,
  PlayStation: 89,
  Razer: 110,
  Starbucks: 24,
  Uber: 61,
};

export function cloneState(state = DEFAULT_STATE) {
  return JSON.parse(JSON.stringify(state));
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTradeValue(trade) {
  const sign = trade.type === "sell" ? "+" : "-";
  return `${sign}${formatCurrency(trade.value)}`;
}

export function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function filterMarketplaceItems(items, filters = {}) {
  const query = normalizeText(filters.query);
  const category = normalizeText(filters.category || "All Brands");
  const mode = normalizeText(filters.mode || "buy");

  return items
    .filter((item) => {
      if (mode && normalizeText(item.mode) !== mode) {
        return false;
      }

      if (category && category !== "all brands" && normalizeText(item.category) !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [item.brand, item.title, item.category, item.description, item.badge]
        .map(normalizeText)
        .join(" ");

      return haystack.includes(query);
    })
    .sort((left, right) => {
      if (left.badge === "Trending" && right.badge !== "Trending") {
        return -1;
      }
      if (right.badge === "Trending" && left.badge !== "Trending") {
        return 1;
      }
      return left.brand.localeCompare(right.brand);
    });
}

export function summarizeTrades(trades) {
  return trades.reduce(
    (summary, trade) => {
      summary.totalTrades += 1;
      if (trade.status === "pending") {
        summary.pendingCount += 1;
      }
      if (trade.status === "completed") {
        summary.completedVolume += Math.abs(trade.value);
      }
      summary.totalVolume += Math.abs(trade.value);
      return summary;
    },
    {
      totalTrades: 0,
      pendingCount: 0,
      completedVolume: 0,
      totalVolume: 0,
    },
  );
}

export function calculateBalanceResult(input, now = new Date().toISOString()) {
  const brand = input.brand || "Amazon";
  const cardDigits = String(input.cardNumber || "").replace(/\D/g, "");
  const pinDigits = String(input.pin || "").replace(/\D/g, "");

  if (cardDigits.length < 8 || pinDigits.length < 4) {
    return {
      ok: false,
      status: "invalid",
      brand,
      balance: 0,
      currency: "USD",
      cardSuffix: cardDigits.slice(-4).padStart(4, "0"),
      checkedAt: now,
      message: "Enter at least 8 card digits and a 4 digit PIN.",
    };
  }

  const cardSeed = [...cardDigits].reduce((sum, digit) => sum + Number(digit), 0);
  const pinSeed = [...pinDigits].reduce((sum, digit) => sum + Number(digit), 0);
  const brandBase = BRAND_BASES[brand] ?? 60;
  const lastFour = Number(cardDigits.slice(-4));
  const balance = Number((brandBase + (cardSeed % 37) + (pinSeed % 13) + lastFour / 100).toFixed(2));
  const manualReview = (cardSeed + pinSeed) % 6 === 0;

  return {
    ok: true,
    status: manualReview ? "manual_review" : "verified",
    brand,
    balance,
    currency: "USD",
    cardSuffix: cardDigits.slice(-4),
    checkedAt: now,
    message: manualReview
      ? "Card detected, but this one needs a short manual review before release."
      : "Card verified. Funds are available for trade.",
  };
}

export function createPendingTradeFromItem(item, now = new Date().toISOString()) {
  return {
    id: String(Date.now()).slice(-6),
    brand: item.brand,
    title: item.title,
    type: item.mode,
    value: item.rate,
    status: "pending",
    date: now,
    note: `${item.category} - ${formatCurrency(item.denomination)}`,
  };
}
