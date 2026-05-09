const VERSION = "v1";

export function storageKey(key: string) {
  return `dklayout:${VERSION}:${key}`;
}

export function loadLocalValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey(key));
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocalValue<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Storage can fail in private mode or when quota is exceeded.
  }
}
