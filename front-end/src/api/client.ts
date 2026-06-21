import { auth } from "../firebase";

export async function getAuthHeaders(): Promise<HeadersInit> {
  let token = localStorage.getItem("token");
  
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
      localStorage.setItem("token", token);
    } catch (e) {
      console.warn("Failed to get fresh Firebase token", e);
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token and force re-login
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      window.location.reload();
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }

  if (response.status === 204) {
    return;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
