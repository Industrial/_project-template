const TOKEN_KEY = "auth_token";

function storage(): Storage | null {
	if (typeof window === "undefined") return null;
	return window.localStorage;
}

export function getToken(): string | null {
	return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function setToken(t: string): void {
	storage()?.setItem(TOKEN_KEY, t);
}

export function clearToken(): void {
	storage()?.removeItem(TOKEN_KEY);
}
