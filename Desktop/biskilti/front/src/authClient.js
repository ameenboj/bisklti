const TOKEN_KEY = "bisklet_auth_token";
const USER_KEY = "bisklet_auth_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function storeAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCustomerPayload() {
  const user = getStoredUser();

  return {
    customer_name: user?.name || "Invite Bisklet",
    customer_email: user?.email || "guest@bisklet.local",
    customer_phone: user?.phone || "+216 00 000 000",
  };
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Une erreur est survenue.");
  }

  return data;
}
