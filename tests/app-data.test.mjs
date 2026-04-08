import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateBalanceResult,
  createPendingTradeFromItem,
  filterMarketplaceItems,
  MARKET_ITEMS,
  summarizeTrades,
} from "../app-data.mjs";

test("calculateBalanceResult rejects short inputs", () => {
  const result = calculateBalanceResult(
    { brand: "Amazon", cardNumber: "1234", pin: "12" },
    "2026-04-08T08:00:00.000Z",
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, "invalid");
});

test("calculateBalanceResult is deterministic for the same card details", () => {
  const first = calculateBalanceResult(
    { brand: "Amazon", cardNumber: "123456789012", pin: "7788" },
    "2026-04-08T08:00:00.000Z",
  );
  const second = calculateBalanceResult(
    { brand: "Amazon", cardNumber: "123456789012", pin: "7788" },
    "2026-04-08T08:00:00.000Z",
  );

  assert.deepEqual(first, second);
});

test("filterMarketplaceItems filters by mode and category", () => {
  const results = filterMarketplaceItems(MARKET_ITEMS, {
    mode: "sell",
    category: "Gaming",
    query: "",
  });

  assert.equal(results.length, 2);
  assert.ok(results.every((item) => item.mode === "sell"));
  assert.ok(results.every((item) => item.category === "Gaming"));
});

test("summarizeTrades counts pending and completed volume", () => {
  const summary = summarizeTrades([
    { status: "completed", value: 100 },
    { status: "pending", value: 40 },
    { status: "completed", value: 60 },
  ]);

  assert.deepEqual(summary, {
    totalTrades: 3,
    pendingCount: 1,
    completedVolume: 160,
    totalVolume: 200,
  });
});

test("createPendingTradeFromItem creates a pending trade record", () => {
  const trade = createPendingTradeFromItem(MARKET_ITEMS[0], "2026-04-08T08:00:00.000Z");

  assert.equal(trade.status, "pending");
  assert.equal(trade.type, MARKET_ITEMS[0].mode);
  assert.equal(trade.note.includes("Ecommerce"), true);
});
