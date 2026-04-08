import {
  AUTH_OTP_KEY,
  AUTH_USERS_KEY,
  AUTH_SESSION_KEY,
  createOtpChallenge,
  createOtpCode,
  createEmptyAuthState,
  getSafeNextPath,
  markUserVerifiedInState,
  registerUserInState,
  signInUserInState,
  signOutUserInState,
  verifyOtpChallenge,
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
  const otp = readJson(AUTH_OTP_KEY, null);
  return {
    users: Array.isArray(users) ? users : [],
    session: session && typeof session === "object" ? session : null,
    otp: otp && typeof otp === "object" ? otp : null,
  };
}

function saveAuthState(state) {
  writeJson(AUTH_USERS_KEY, state.users || []);
  writeJson(AUTH_SESSION_KEY, state.session || null);
  writeJson(AUTH_OTP_KEY, state.otp || null);
}

function setMessage(element, tone, text) {
  if (!element) return;
  element.hidden = false;
  element.dataset.tone = tone;
  element.textContent = text;
}

async function sendAuthEmail({ toName, toEmail, subject, htmlContent }) {
  try {
    await fetch("/.netlify/functions/send-auth-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toEmail, toName, subject, htmlContent }),
    });
  } catch {
    // Email is non-blocking for auth flow.
  }
}

async function sendOtpEmail(name, email, otpCode) {
  await sendAuthEmail({
    toName: name,
    toEmail: email,
    subject: "Your GiftCardsHub verification code",
    htmlContent: `<p>Hi ${name || "there"},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otpCode}</p><p>This code expires in 10 minutes.</p>`,
  });
}

async function sendWelcomeEmail(name, email) {
  await sendAuthEmail({
    toName: name,
    toEmail: email,
    subject: "Welcome to GiftCardsHub",
    htmlContent: `<p>Hi ${name},</p><p>Your GiftCardsHub account is ready. You can now sign in and start trading securely.</p>`,
  });
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
      if (result.code === "unverified" && result.user) {
        const otpCode = createOtpCode();
        const otp = createOtpChallenge(result.user.email, otpCode);
        const nextState = { ...state, otp };
        saveAuthState(nextState);
        sendOtpEmail(result.user.name, result.user.email, otpCode);
        const redirect = `verify-otp.html?email=${encodeURIComponent(result.user.email)}`;
        window.location.replace(redirect);
        return;
      }
      setMessage(notice, "warning", result.error);
      return;
    }

    saveAuthState({ ...result.state, otp: state.otp });
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

    const otpCode = createOtpCode();
    const otp = createOtpChallenge(result.user.email, otpCode);
    saveAuthState({ ...result.state, otp });
    setMessage(notice, "success", "Account created. Sending OTP to your email...");
    await sendOtpEmail(result.user.name, result.user.email, otpCode);
    window.setTimeout(() => {
      window.location.replace(`verify-otp.html?email=${encodeURIComponent(result.user.email)}`);
    }, 400);
  });
}

function initOtpVerification(state) {
  const form = document.querySelector("[data-auth-form='verify-otp']");
  if (!form) return;

  const notice = document.querySelector("[data-auth-notice]");
  const resendButton = document.querySelector("[data-auth-resend]");
  const emailLabel = document.querySelector("[data-auth-email]");
  const urlEmail = new URLSearchParams(window.location.search).get("email");
  const expectedEmail = String(urlEmail || state.otp?.email || "").trim().toLowerCase();
  const user = state.users.find((entry) => entry.email.toLowerCase() === expectedEmail);

  if (emailLabel && expectedEmail) {
    emailLabel.textContent = expectedEmail;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.otp || state.otp.email !== expectedEmail) {
      setMessage(notice, "warning", "No valid OTP challenge found. Request a new code.");
      return;
    }

    const otpCode = form.querySelector("[name='otp']")?.value || "";
    const verification = verifyOtpChallenge(state.otp, otpCode);
    if (!verification.ok) {
      state.otp = verification.challenge;
      saveAuthState(state);
      setMessage(notice, "warning", verification.error);
      return;
    }

    const marked = markUserVerifiedInState(state, expectedEmail);
    if (!marked.ok) {
      setMessage(notice, "warning", marked.error);
      return;
    }

    state.users = marked.state.users;
    state.session = marked.state.session;
    state.otp = null;
    saveAuthState(state);
    await sendWelcomeEmail(marked.user.name, marked.user.email);
    setMessage(notice, "success", "Email verified. Redirecting to your account...");
    window.setTimeout(() => window.location.replace("account.html"), 400);
  });

  resendButton?.addEventListener("click", async () => {
    if (!user) {
      setMessage(notice, "warning", "We couldn't find that account. Create a new account.");
      return;
    }

    const otpCode = createOtpCode();
    state.otp = createOtpChallenge(user.email, otpCode);
    saveAuthState(state);
    await sendOtpEmail(user.name, user.email, otpCode);
    setMessage(notice, "info", "A new OTP has been sent.");
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
  initOtpVerification(guarded);
});
