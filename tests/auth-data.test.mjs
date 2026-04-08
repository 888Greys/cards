import test from "node:test";
import assert from "node:assert/strict";

import {
  createOtpChallenge,
  createOtpCode,
  createEmptyAuthState,
  getSafeNextPath,
  markUserVerifiedInState,
  registerUserInState,
  signInUserInState,
  signOutUserInState,
  verifyOtpChallenge,
} from "../auth-data.mjs";

test("registerUserInState creates unverified user without session", () => {
  const state = createEmptyAuthState();
  const result = registerUserInState(state, {
    name: "Julian Sterling",
    email: "julian@example.com",
    password: "strongpass123",
    confirmPassword: "strongpass123",
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.users.length, 1);
  assert.equal(result.state.session, null);
  assert.equal(result.state.users[0].isVerified, false);
});

test("registerUserInState rejects duplicate emails", () => {
  const first = registerUserInState(createEmptyAuthState(), {
    name: "A User",
    email: "user@example.com",
    password: "strongpass123",
    confirmPassword: "strongpass123",
  });

  const second = registerUserInState(first.state, {
    name: "B User",
    email: "USER@example.com",
    password: "strongpass123",
    confirmPassword: "strongpass123",
  });

  assert.equal(second.ok, false);
  assert.match(second.error, /already exists/i);
});

test("signInUserInState rejects unverified users", () => {
  const registered = registerUserInState(createEmptyAuthState(), {
    name: "Login User",
    email: "login@example.com",
    password: "secretpass123",
    confirmPassword: "secretpass123",
  });

  const unverified = signInUserInState(registered.state, {
    email: "login@example.com",
    password: "secretpass123",
  });
  assert.equal(unverified.ok, false);
  assert.equal(unverified.code, "unverified");
});

test("signInUserInState validates verified credentials", () => {
  const registered = registerUserInState(createEmptyAuthState(), {
    name: "Login User",
    email: "login@example.com",
    password: "secretpass123",
    confirmPassword: "secretpass123",
  });
  const verified = markUserVerifiedInState(registered.state, "login@example.com");

  const bad = signInUserInState(verified.state, {
    email: "login@example.com",
    password: "wrongpass",
  });
  assert.equal(bad.ok, false);

  const good = signInUserInState(verified.state, {
    email: "login@example.com",
    password: "secretpass123",
  });
  assert.equal(good.ok, true);
  assert.equal(good.state.session?.name, "Login User");
});

test("signOutUserInState clears session", () => {
  const registered = registerUserInState(createEmptyAuthState(), {
    name: "Logout User",
    email: "logout@example.com",
    password: "secretpass123",
    confirmPassword: "secretpass123",
  });

  const result = signOutUserInState(registered.state);
  assert.equal(result.ok, true);
  assert.equal(result.state.session, null);
});

test("getSafeNextPath blocks unsafe redirects", () => {
  assert.equal(getSafeNextPath("account.html"), "account.html");
  assert.equal(getSafeNextPath("/checkbalance.html"), "checkbalance.html");
  assert.equal(getSafeNextPath("https://evil.com"), "account.html");
  assert.equal(getSafeNextPath("../account.html"), "account.html");
  assert.equal(getSafeNextPath("home"), "account.html");
});

test("verifyOtpChallenge accepts valid code", () => {
  const challenge = createOtpChallenge("julian@example.com", "123456", "2026-04-08T08:00:00.000Z");
  const result = verifyOtpChallenge(challenge, "123456", "2026-04-08T08:04:00.000Z");
  assert.equal(result.ok, true);
  assert.equal(result.challenge, null);
});

test("verifyOtpChallenge decrements attempts on invalid code", () => {
  const challenge = createOtpChallenge("julian@example.com", "123456", "2026-04-08T08:00:00.000Z");
  const result = verifyOtpChallenge(challenge, "999999", "2026-04-08T08:04:00.000Z");
  assert.equal(result.ok, false);
  assert.equal(result.code, "invalid_code");
  assert.equal(result.challenge.attemptsRemaining, challenge.maxAttempts - 1);
});

test("createOtpCode returns a six digit string", () => {
  const code = createOtpCode(() => 0.123456);
  assert.match(code, /^\d{6}$/);
});
