const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AUTH_STORAGE_KEY = "pawmatch.auth";
const AUTH_CHANGE_EVENT = "pawmatch:auth-change";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;
  const user = session.user;

  return (
    typeof session.token === "string" &&
    !!user &&
    typeof user === "object" &&
    typeof (user as Record<string, unknown>).id === "number" &&
    typeof (user as Record<string, unknown>).name === "string" &&
    typeof (user as Record<string, unknown>).email === "string"
  );
}

export function getAuthSnapshot(): string | null {
  return typeof window === "undefined"
    ? null
    : window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function subscribeToAuth(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

export function parseAuthSession(snapshot: string | null): AuthSession | null {
  if (!snapshot) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(snapshot);
    return isAuthSession(value) ? value : null;
  } catch {
    return null;
  }
}

function saveAuthSession(session: AuthSession | null): void {
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function responseMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;
  return typeof message === "string" ? message : null;
}

async function authenticate(
  endpoint: "login" | "register",
  credentials: {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
  },
): Promise<void> {
  const response = await fetch(`${API_URL}/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(credentials),
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      responseMessage(payload) ?? "Unable to log in. Please try again.",
    );
  }

  if (!isAuthSession(payload)) {
    throw new Error("The authentication service returned an invalid response.");
  }

  saveAuthSession(payload);
}

export function login(email: string, password: string): Promise<void> {
  return authenticate("login", { email, password });
}

export function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  return authenticate("register", {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 401) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(responseMessage(payload) ?? "Unable to log out.");
  }

  saveAuthSession(null);
}
