import {
  AUTH_USERS_KEY,
  AUTH_SESSION_KEY,
  createEmptyAuthState,
  getSafeNextPath,
  registerUserInState,
  signInUserInState,
  signOutUserInState,
} from "./auth-data.mjs";

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

function loadAuthState() {
  const users = readJson(AUTH_USERS_KEY, []);
  const session = readJson(AUTH_SESSION_KEY, null);
  return {
    users: Array.isArray(users) ? users : [],
    session: session && typeof session === "object" ? session : null,
  };
}

function saveAuthState(state) {
  writeJson(AUTH_USERS_KEY, state.users || []);
  writeJson(AUTH_SESSION_KEY, state.session || null);
}

function setMessage(element, tone, text) {
  if (!element) return;
  element.hidden = false;
  element.dataset.tone = tone;
  element.textContent = text;
}

async function sendWelcomeEmail(name, email) {
  try {
    await fetch("/.netlify/functions/send-auth-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        toEmail: email,
        toName: name,
        subject: "Welcome to GiftCardsHub",
        htmlContent: `<p>Hi ${name},</p><p>Your GiftCardsHub account is ready. You can now sign in and start trading securely.</p>`,
      }),
    });
  } catch {
    // Email is non-blocking for auth flow.
  }
}

function requireAuth(state) {
  if (document.body.dataset.authRequired !== "true") return state;
  if (state.session) return state;

  const current = window.location.pathname.split("/").pop() || "account.html";
  const redirect = `signin.html?next=${encodeURIComponent(current)}`;
  window.location.replace(redirect);
  return state;
}

function hydrateAuthName(state) {
  const nodes = document.querySelectorAll("[data-auth-name]");
  if (!nodes.length || !state.session?.name) return;
  nodes.forEach((node) => {
    node.textContent = state.session.name;
  });
}

function setupSignOut(state) {
  const trigger = document.querySelector("[data-signout]");
  if (!trigger) return;

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const result = signOutUserInState(state);
    saveAuthState(result.state);
    window.location.replace("signin.html");
  });
}

function initSignin(state) {
  const form = document.querySelector("[data-auth-form='signin']");
  if (!form) return;

  if (state.session) {
    const nextValue = new URLSearchParams(window.location.search).get("next");
    window.location.replace(getSafeNextPath(nextValue));
    return;
  }

  const notice = document.querySelector("[data-auth-notice]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.querySelector("[name='email']")?.value || "";
    const password = form.querySelector("[name='password']")?.value || "";
    const result = signInUserInState(state, { email, password });

    if (!result.ok) {
      setMessage(notice, "warning", result.error);
      return;
    }

    saveAuthState(result.state);
    const nextValue = new URLSearchParams(window.location.search).get("next");
    window.location.replace(getSafeNextPath(nextValue));
  });
}

function initSignup(state) {
  const form = document.querySelector("[data-auth-form='signup']");
  if (!form) return;

  const notice = document.querySelector("[data-auth-notice]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: form.querySelector("[name='name']")?.value || "",
      email: form.querySelector("[name='email']")?.value || "",
      password: form.querySelector("[name='password']")?.value || "",
      confirmPassword: form.querySelector("[name='confirmPassword']")?.value || "",
    };
    const result = registerUserInState(state, payload);

    if (!result.ok) {
      setMessage(notice, "warning", result.error);
      return;
    }

    saveAuthState(result.state);
    setMessage(notice, "success", "Account created. Redirecting to your dashboard...");
    await sendWelcomeEmail(result.user.name, result.user.email);
    window.setTimeout(() => {
      window.location.replace("account.html");
    }, 400);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const baseline = createEmptyAuthState();
  const state = { ...baseline, ...loadAuthState() };
  const guarded = requireAuth(state);
  hydrateAuthName(guarded);
  setupSignOut(guarded);
  initSignin(guarded);
  initSignup(guarded);
});
