export const AUTH_USERS_KEY = "giftcardshub-auth-users-v1";
export const AUTH_SESSION_KEY = "giftcardshub-auth-session-v1";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function sanitizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

// Lightweight deterministic hash for demo auth state. Replace with server-side hashing in production.
export function hashPassword(value) {
  let hash = 2166136261;
  const input = String(value || "");
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `h${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createEmptyAuthState() {
  return { users: [], session: null };
}

export function validateSignupInput(payload) {
  const name = sanitizeName(payload?.name);
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");
  const confirmPassword = String(payload?.confirmPassword || "");

  if (!name || name.length < 2) {
    return { ok: false, error: "Enter your full name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  return { ok: true, value: { name, email, password } };
}

export function registerUserInState(state, payload, now = new Date().toISOString()) {
  const base = state || createEmptyAuthState();
  const check = validateSignupInput(payload);
  if (!check.ok) {
    return { ok: false, error: check.error, state: base };
  }

  const { name, email, password } = check.value;
  const exists = base.users.some((user) => normalizeEmail(user.email) === email);
  if (exists) {
    return { ok: false, error: "An account with this email already exists.", state: base };
  }

  const user = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: now,
  };
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    signedInAt: now,
  };

  return {
    ok: true,
    user,
    state: {
      users: [...base.users, user],
      session,
    },
  };
}

export function signInUserInState(state, payload, now = new Date().toISOString()) {
  const base = state || createEmptyAuthState();
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password.", state: base };
  }

  const user = base.users.find((entry) => normalizeEmail(entry.email) === email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Incorrect email or password.", state: base };
  }

  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    signedInAt: now,
  };

  return {
    ok: true,
    user,
    state: {
      users: [...base.users],
      session,
    },
  };
}

export function signOutUserInState(state) {
  const base = state || createEmptyAuthState();
  return {
    ok: true,
    state: {
      users: [...base.users],
      session: null,
    },
  };
}

export function getSafeNextPath(nextValue, fallback = "account.html") {
  const candidate = String(nextValue || "").trim();
  if (!candidate) return fallback;
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  if (candidate.includes("..")) return fallback;
  const normalized = candidate.startsWith("/") ? candidate.slice(1) : candidate;
  if (!normalized.endsWith(".html")) return fallback;
  return normalized;
}
