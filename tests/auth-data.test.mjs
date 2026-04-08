import test from "node:test";
import assert from "node:assert/strict";

import {
  createEmptyAuthState,
  getSafeNextPath,
  registerUserInState,
  signInUserInState,
  signOutUserInState,
} from "../auth-data.mjs";

test("registerUserInState creates user and session", () => {
  const state = createEmptyAuthState();
  const result = registerUserInState(state, {
    name: "Julian Sterling",
    email: "julian@example.com",
    password: "strongpass123",
    confirmPassword: "strongpass123",
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.users.length, 1);
  assert.equal(result.state.session?.email, "julian@example.com");
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

test("signInUserInState validates credentials", () => {
  const registered = registerUserInState(createEmptyAuthState(), {
    name: "Login User",
    email: "login@example.com",
    password: "secretpass123",
    confirmPassword: "secretpass123",
  });

  const bad = signInUserInState(registered.state, {
    email: "login@example.com",
    password: "wrongpass",
  });
  assert.equal(bad.ok, false);

  const good = signInUserInState(registered.state, {
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
