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

const AUTH_TOAST_QUEUE_KEY = "giftcardshub-auth-toast-queue-v1";
const AUTH_TOAST_STYLE_ID = "auth-toast-runtime-style";

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

function readSessionJson(key, fallback) {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeSessionJson(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
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

function ensureToastStyles() {
  if (document.getElementById(AUTH_TOAST_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = AUTH_TOAST_STYLE_ID;
  style.textContent = `
    .auth-toast-stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 80;
      width: min(360px, calc(100vw - 2rem));
      display: grid;
      gap: 0.55rem;
      pointer-events: none;
    }
    .auth-toast {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #d8d1e6;
      border-left-width: 5px;
      border-radius: 0.9rem;
      box-shadow: 0 14px 28px rgba(20, 16, 42, 0.14);
      padding: 0.72rem 0.88rem;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    .auth-toast.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .auth-toast[data-tone="success"] {
      border-left-color: #2f9e53;
    }
    .auth-toast[data-tone="warning"] {
      border-left-color: #d15a00;
    }
    .auth-toast[data-tone="info"] {
      border-left-color: #5167d8;
    }
    .auth-toast-title {
      margin: 0;
      font-size: 0.82rem;
      font-weight: 800;
      color: #2f2752;
    }
    .auth-toast-text {
      margin: 0.15rem 0 0;
      font-size: 0.8rem;
      color: #554e69;
    }
    @media (max-width: 640px) {
      .auth-toast-stack {
        top: auto;
        bottom: 1rem;
        right: 0.5rem;
        left: 0.5rem;
        width: auto;
      }
    }
  `;
  document.head.append(style);
}

function getToastStack() {
  ensureToastStyles();
  let stack = document.querySelector("[data-auth-toast-stack]");
  if (stack) return stack;

  stack = document.createElement("section");
  stack.className = "auth-toast-stack";
  stack.dataset.authToastStack = "true";
  stack.setAttribute("role", "status");
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "false");
  document.body.append(stack);
  return stack;
}

function showToast({ tone = "info", title, text, duration = 3600 }) {
  const message = String(text || "").trim();
  if (!message) return;

  const stack = getToastStack();
  const toast = document.createElement("article");
  toast.className = "auth-toast";
  toast.dataset.tone = tone;

  const heading = document.createElement("p");
  heading.className = "auth-toast-title";
  heading.textContent = title || (tone === "success" ? "Success" : tone === "warning" ? "Action needed" : "Info");

  const body = document.createElement("p");
  body.className = "auth-toast-text";
  body.textContent = message;

  toast.append(heading, body);
  stack.append(toast);
  if (stack.childElementCount > 4) {
    stack.firstElementChild?.remove();
  }

  window.requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, Math.max(1200, duration));
}

function queueToast(toast) {
  const baseQueue = readSessionJson(AUTH_TOAST_QUEUE_KEY, []);
  const queue = Array.isArray(baseQueue) ? baseQueue : [];
  queue.push({
    tone: toast?.tone || "info",
    title: toast?.title || "",
    text: String(toast?.text || ""),
  });
  writeSessionJson(AUTH_TOAST_QUEUE_KEY, queue.slice(-3));
}

function flushQueuedToasts() {
  const queued = readSessionJson(AUTH_TOAST_QUEUE_KEY, []);
  if (!Array.isArray(queued) || queued.length === 0) return;

  try {
    window.sessionStorage.removeItem(AUTH_TOAST_QUEUE_KEY);
  } catch {
    // Ignore storage errors in restricted environments.
  }

  queued.forEach((toast, index) => {
    window.setTimeout(() => {
      showToast(toast);
    }, index * 120);
  });
}

function ensureAuthPopup() {
  let popup = document.getElementById("auth-flow-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "auth-flow-popup";
    popup.className =
      "fixed inset-0 z-[90] hidden items-end justify-center bg-[#101828]/45 p-4 backdrop-blur-[8px] sm:items-center";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.setAttribute("aria-labelledby", "auth-flow-popup-title");
    popup.innerHTML = `
      <div class="absolute inset-0" data-auth-popup-close></div>
      <div class="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
        <div class="h-1.5 bg-gradient-to-r from-[#0f9af4] via-[#6b38d4] to-[#141922]" data-auth-popup-accent></div>
        <div class="relative px-6 pb-6 pt-7 sm:px-8">
          <button class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f5f9] text-[#4b5563] transition-colors hover:bg-[#e6ebf1]" data-auth-popup-close type="button" aria-label="Close popup">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div class="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[#eef4ff] text-[#2454ff]" data-auth-popup-icon-wrap>
            <span class="material-symbols-outlined text-[28px]" data-auth-popup-icon>info</span>
          </div>
          <p class="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#60758f]" data-auth-popup-kicker>Update</p>
          <h2 class="mt-2 text-[1.9rem] font-black leading-none tracking-tight text-[#18212b]" data-auth-popup-title id="auth-flow-popup-title">All set</h2>
          <p class="mt-4 text-sm leading-relaxed text-[#5b6c80]" data-auth-popup-copy>Your request is being processed.</p>
          <div class="mt-6 flex gap-3">
            <button class="flex-1 rounded-full bg-[#0f172a] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#020617]" data-auth-popup-primary type="button">
              Continue
            </button>
            <button class="rounded-full border border-[#d7dee8] px-5 py-3.5 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#f8fafc]" data-auth-popup-close type="button">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.append(popup);
  }

  if (!popup.dataset.bound) {
    const closePopup = () => {
      popup.classList.add("hidden");
      popup.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
      popup._onPrimary = null;
      if (popup._timer) {
        window.clearTimeout(popup._timer);
        popup._timer = null;
      }
    };

    popup.querySelectorAll("[data-auth-popup-close]").forEach((button) => {
      button.addEventListener("click", closePopup);
    });
    popup.querySelector("[data-auth-popup-primary]")?.addEventListener("click", () => {
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

  return {
    root: popup,
    accent: popup.querySelector("[data-auth-popup-accent]"),
    iconWrap: popup.querySelector("[data-auth-popup-icon-wrap]"),
    icon: popup.querySelector("[data-auth-popup-icon]"),
    kicker: popup.querySelector("[data-auth-popup-kicker]"),
    title: popup.querySelector("[data-auth-popup-title]"),
    copy: popup.querySelector("[data-auth-popup-copy]"),
    primary: popup.querySelector("[data-auth-popup-primary]"),
  };
}

function openAuthPopup({
  variant = "info",
  kicker,
  title,
  text,
  primaryLabel = "Continue",
  onPrimary,
  autoActionMs = 0,
}) {
  const popup = ensureAuthPopup();
  const isWarning = variant === "warning";
  const isSuccess = variant === "success";

  popup.kicker.textContent = kicker;
  popup.title.textContent = title;
  popup.copy.textContent = text;
  popup.primary.textContent = primaryLabel;

  popup.accent.className = isWarning
    ? "h-1.5 bg-gradient-to-r from-[#ff9a62] via-[#ff6b57] to-[#8c2c22]"
    : isSuccess
      ? "h-1.5 bg-gradient-to-r from-[#11a75c] via-[#0f9af4] to-[#141922]"
      : "h-1.5 bg-gradient-to-r from-[#0f9af4] via-[#6b38d4] to-[#141922]";

  popup.iconWrap.className = isWarning
    ? "grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[#fff0ea] text-[#c2410c]"
    : isSuccess
      ? "grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[#e8fff3] text-[#067647]"
      : "grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[#eef4ff] text-[#2454ff]";

  popup.icon.textContent = isWarning ? "error" : isSuccess ? "verified" : "mail";
  popup.primary.className = isWarning
    ? "flex-1 rounded-full bg-[#23282f] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#171b20]"
    : "flex-1 rounded-full bg-[#0f172a] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#020617]";

  popup.root._onPrimary = onPrimary || null;
  if (popup.root._timer) {
    window.clearTimeout(popup.root._timer);
    popup.root._timer = null;
  }
  if (autoActionMs > 0 && typeof onPrimary === "function") {
    popup.root._timer = window.setTimeout(() => {
      if (popup.root.classList.contains("hidden")) return;
      const action = popup.root._onPrimary;
      popup.root.classList.add("hidden");
      popup.root.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
      popup.root._onPrimary = null;
      popup.root._timer = null;
      if (typeof action === "function") action();
    }, autoActionMs);
  }

  popup.root.classList.remove("hidden");
  popup.root.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  popup.primary.focus();
}

function clearMessage(element) {
  if (!element) return;
  element.hidden = true;
  element.textContent = "";
  delete element.dataset.tone;
}

function setMessage(element, tone, text) {
  if (!element) return;
  element.hidden = false;
  element.dataset.tone = tone;
  element.textContent = text;
}

function setButtonPending(button, pending, pendingLabel) {
  if (!button) return;

  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent || "";
  }

  button.disabled = pending;
  button.setAttribute("aria-busy", pending ? "true" : "false");
  button.textContent = pending ? pendingLabel : button.dataset.defaultLabel;
}

function queueAndRedirect(url, toast, delay = 220) {
  if (toast) queueToast(toast);
  window.setTimeout(() => {
    window.location.replace(url);
  }, Math.max(0, delay));
}

function setupPasswordToggles() {
  const toggles = document.querySelectorAll("[data-auth-password-toggle]");
  if (!toggles.length) return;

  toggles.forEach((toggle) => {
    const targetId = toggle.getAttribute("data-target");
    const input = targetId ? document.getElementById(targetId) : null;
    if (!input) return;

    const syncLabel = () => {
      const isVisible = input.type === "text";
      toggle.textContent = isVisible ? "Hide" : "Show";
      toggle.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
    };

    syncLabel();
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      input.type = input.type === "password" ? "text" : "password";
      syncLabel();
      input.focus({ preventScroll: true });
    });
  });
}

async function sendAuthEmail({ toName, toEmail, subject, htmlContent }) {
  try {
    const response = await fetch("/.netlify/functions/send-auth-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toEmail, toName, subject, htmlContent }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendOtpEmail(name, email, otpCode) {
  return sendAuthEmail({
    toName: name,
    toEmail: email,
    subject: "Your GiftCardsHub verification code",
    htmlContent: `<p>Hi ${name || "there"},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otpCode}</p><p>This code expires in 10 minutes.</p>`,
  });
}

async function sendWelcomeEmail(name, email) {
  return sendAuthEmail({
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
    queueAndRedirect("signin.html", {
      tone: "info",
      title: "Signed out",
      text: "Your session has ended on this device.",
    });
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
  const submit = form.querySelector("button[type='submit']");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(notice);
    setButtonPending(submit, true, "Signing In...");

    const email = form.querySelector("[name='email']")?.value || "";
    const password = form.querySelector("[name='password']")?.value || "";
    const result = signInUserInState(state, { email, password });

    if (!result.ok) {
      if (result.code === "unverified" && result.user) {
        const otpCode = createOtpCode();
        const otp = createOtpChallenge(result.user.email, otpCode);
        state.otp = otp;
        saveAuthState(state);
        const sent = await sendOtpEmail(result.user.name, result.user.email, otpCode);
        const redirect = `verify-otp.html?email=${encodeURIComponent(result.user.email)}`;
        setButtonPending(submit, false, "Signing In...");
        let redirected = false;
        const continueToOtp = () => {
          if (redirected) return;
          redirected = true;
          window.location.replace(redirect);
        };
        openAuthPopup({
          variant: sent ? "info" : "warning",
          kicker: sent ? "OTP Required" : "OTP Pending",
          title: sent ? "Check your email" : "Verification needed",
          text: sent
            ? "A verification code has been sent to your email. We’ll take you to the OTP screen now."
            : "Could not send OTP now. Use Resend OTP on the next screen.",
          primaryLabel: "Continue",
          onPrimary: continueToOtp,
          autoActionMs: 1100,
        });
        return;
      }

      openAuthPopup({
        variant: "warning",
        kicker: "Sign In Failed",
        title: "Check your details",
        text: result.error,
        primaryLabel: "Try again",
      });
      setButtonPending(submit, false, "Signing In...");
      return;
    }

    state.users = result.state.users;
    state.session = result.state.session;
    saveAuthState({ ...state, otp: state.otp || null });
    const nextValue = new URLSearchParams(window.location.search).get("next");
    setButtonPending(submit, false, "Signing In...");
    let redirected = false;
    const continueHome = () => {
      if (redirected) return;
      redirected = true;
      window.location.replace(getSafeNextPath(nextValue));
    };
    openAuthPopup({
      variant: "success",
      kicker: "Signed In",
      title: `Welcome back${result.state.session?.name ? `, ${result.state.session.name}` : ""}`,
      text: "Your secure workspace is ready. We’ll take you there now.",
      primaryLabel: "Continue",
      onPrimary: continueHome,
      autoActionMs: 900,
    });
  });
}

function initSignup(state) {
  const form = document.querySelector("[data-auth-form='signup']");
  if (!form) return;

  const notice = document.querySelector("[data-auth-notice]");
  const submit = form.querySelector("button[type='submit']");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(notice);
    setButtonPending(submit, true, "Creating Account...");

    const payload = {
      name: form.querySelector("[name='name']")?.value || "",
      email: form.querySelector("[name='email']")?.value || "",
      password: form.querySelector("[name='password']")?.value || "",
      confirmPassword: form.querySelector("[name='confirmPassword']")?.value || "",
    };
    const result = registerUserInState(state, payload);

    if (!result.ok) {
      openAuthPopup({
        variant: "warning",
        kicker: "Sign Up Failed",
        title: "We couldn't create that account",
        text: result.error,
        primaryLabel: "Try again",
      });
      setButtonPending(submit, false, "Creating Account...");
      return;
    }

    state.users = result.state.users;
    state.session = null;
    const otpCode = createOtpCode();
    state.otp = createOtpChallenge(result.user.email, otpCode);
    saveAuthState(state);
    const sent = await sendOtpEmail(result.user.name, result.user.email, otpCode);
    setButtonPending(submit, false, "Creating Account...");
    const redirect = `verify-otp.html?email=${encodeURIComponent(result.user.email)}`;
    let redirected = false;
    const continueToOtp = () => {
      if (redirected) return;
      redirected = true;
      window.location.replace(redirect);
    };
    openAuthPopup({
      variant: sent ? "success" : "warning",
      kicker: sent ? "OTP Sent" : "Email Send Issue",
      title: "Account created",
      text: sent
        ? "Your verification code is on the way. We’ll take you to OTP verification now."
        : "Account created, but OTP email failed. Use Resend OTP on the next page.",
      primaryLabel: "Continue",
      onPrimary: continueToOtp,
      autoActionMs: 1100,
    });
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

  const otpInput = form.querySelector("[name='otp']");
  otpInput?.addEventListener("input", () => {
    const sanitized = String(otpInput.value || "")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (otpInput.value !== sanitized) {
      otpInput.value = sanitized;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(notice);
    if (!state.otp || state.otp.email !== expectedEmail) {
      const text = "No valid OTP challenge found. Request a new code.";
      setMessage(notice, "warning", text);
      showToast({ tone: "warning", title: "OTP missing", text });
      return;
    }

    const otpCode = form.querySelector("[name='otp']")?.value || "";
    const verification = verifyOtpChallenge(state.otp, otpCode);
    if (!verification.ok) {
      state.otp = verification.challenge;
      saveAuthState(state);
      const attemptsRemaining = verification.challenge?.attemptsRemaining;
      const suffix =
        typeof attemptsRemaining === "number"
          ? ` ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} left.`
          : "";
      const text = `${verification.error}${verification.code === "invalid_code" ? suffix : ""}`.trim();
      setMessage(notice, "warning", text);
      showToast({ tone: "warning", title: "Verification failed", text });
      return;
    }

    const marked = markUserVerifiedInState(state, expectedEmail);
    if (!marked.ok) {
      setMessage(notice, "warning", marked.error);
      showToast({ tone: "warning", title: "Verification failed", text: marked.error });
      return;
    }

    state.users = marked.state.users;
    state.session = marked.state.session;
    state.otp = null;
    saveAuthState(state);
    const sent = await sendWelcomeEmail(marked.user.name, marked.user.email);
    setMessage(notice, "success", "Email verified. Redirecting to home...");
    showToast({ tone: "success", title: "Email verified", text: "Your account is now active." });
    if (!sent) {
      showToast({
        tone: "info",
        title: "Welcome email pending",
        text: "Your account is active even though welcome email could not be sent.",
      });
    }
    queueAndRedirect(
      "home.html",
      { tone: "success", title: "Welcome", text: "Verification complete. You are signed in." },
      520,
    );
  });

  resendButton?.addEventListener("click", async () => {
    clearMessage(notice);
    if (!user) {
      const text = "We couldn't find that account. Create a new account.";
      setMessage(notice, "warning", text);
      showToast({ tone: "warning", title: "Account missing", text });
      return;
    }

    setButtonPending(resendButton, true, "Sending OTP...");
    const otpCode = createOtpCode();
    state.otp = createOtpChallenge(user.email, otpCode);
    saveAuthState(state);
    const sent = await sendOtpEmail(user.name, user.email, otpCode);
    if (sent) {
      setMessage(notice, "info", "A new OTP has been sent.");
      showToast({ tone: "info", title: "OTP resent", text: "Check your inbox for the latest code." });
    } else {
      const text = "Could not send OTP right now. Try again shortly.";
      setMessage(notice, "warning", text);
      showToast({ tone: "warning", title: "Resend failed", text });
    }
    setButtonPending(resendButton, false, "Sending OTP...");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  flushQueuedToasts();
  const baseline = createEmptyAuthState();
  const state = { ...baseline, ...loadAuthState() };
  const guarded = requireAuth(state);
  setupPasswordToggles();
  hydrateAuthName(guarded);
  setupSignOut(guarded);
  initSignin(guarded);
  initSignup(guarded);
  initOtpVerification(guarded);
});
