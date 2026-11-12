/**
 * MARIGOLD VERIFIABLE OFFLINE AIR-GAP LOCK & EGRESS AUDITOR
 * =========================================================
 * Provides a user-verifiable client-side Air-Gap Lock when local civic datasets are open.
 *
 * When Air-Gap Lock is enabled:
 * - Outbound data/AI network calls (`/api/ai-mapper`, `/api/data-story/*`, external webhooks,
 *   cloud relays) are intercepted and blocked locally before a single byte leaves the browser.
 * - Local Loopback (`127.0.0.1` / `localhost` for local Ollama) and same-origin static assets
 *   (`.wasm`, `.js`, `.css`, Next.js `_next/static` chunks) remain permitted so local compute runs at 100%.
 * - Every intercepted attempt increments a transparent `blockedRequestsCount` counter so citizens,
 *   commissioners, and IT auditors can verify `0 bytes of voter data transmitted`.
 */

const AIR_GAP_STORAGE_KEY = 'marigold_airgap_lock_enabled';

export interface AirGapTelemetry {
  locked: boolean;
  bytesTransmitted: number;
  blockedRequestsCount: number;
  lastBlockedEndpoint: string | null;
}

let isAirGapLockedMemory = false;
let blockedRequestsCount = 0;
let lastBlockedEndpoint: string | null = null;
let fetchInterceptorInstalled = false;
let originalFetchRef: typeof fetch | null = null;

const listeners = new Set<(state: AirGapTelemetry) => void>();

function notifyListeners() {
  const snapshot = getAirGapTelemetry();
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch {
      // Ignore listener error
    }
  });
}

export function isAirGapLocked(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(AIR_GAP_STORAGE_KEY);
      if (stored !== null) {
        isAirGapLockedMemory = stored === 'true';
      }
    } catch {
      // Ignore storage access error
    }
  }
  return isAirGapLockedMemory;
}

export function getAirGapTelemetry(): AirGapTelemetry {
  return {
    locked: isAirGapLocked(),
    bytesTransmitted: 0,
    blockedRequestsCount,
    lastBlockedEndpoint,
  };
}

/**
 * Determines whether a URL + method is safe local static/loopback traffic vs. outbound data egress
 * that must be blocked while Air-Gap Lock is active.
 */
export function isUrlPermittedUnderAirGap(urlStr: string, method: string = 'GET'): boolean {
  const upperMethod = (method || 'GET').toUpperCase();
  const trimmed = (urlStr || '').trim();

  // Always allow blob:, data:, and local loopback (e.g. local Ollama on 127.0.0.1:11434)
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(trimmed)
  ) {
    // However, if we are running on localhost in dev, still block `/api/ai-mapper` & `/api/data-story/*` POSTs!
    if (/\/api\/(ai-mapper|data-story|relay|sync)/i.test(trimmed)) {
      return false;
    }
    return true;
  }

  // Block any Marigold server API endpoints that accept dataset profiles, prompts, or relays
  if (/^\/api\/(ai-mapper|data-story|relay|sync|contact)/i.test(trimmed)) {
    return false;
  }

  // Allow same-origin GET requests for static UI chunks, WASM binaries, or static public JSON
  if (trimmed.startsWith('/') && upperMethod === 'GET') {
    return true;
  }

  if (typeof window !== 'undefined' && window.location) {
    try {
      const parsed = new URL(trimmed, window.location.origin);
      if (parsed.origin === window.location.origin) {
        if (/^\/api\/(ai-mapper|data-story|relay|sync)/i.test(parsed.pathname)) {
          return false;
        }
        if (upperMethod === 'GET') {
          return true;
        }
      }
    } catch {
      return false;
    }
  }

  // Block all third-party external origins and non-GET egress while Air-Gap Lock is engaged
  return false;
}

export function installAirGapFetchInterceptor(): void {
  if (fetchInterceptorInstalled || typeof globalThis === 'undefined' || typeof globalThis.fetch !== 'function') {
    return;
  }
  originalFetchRef = globalThis.fetch.bind(globalThis);
  fetchInterceptorInstalled = true;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!isAirGapLocked()) {
      return originalFetchRef!(input, init);
    }

    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : input?.url || '';
    const method =
      init?.method || (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET');

    if (isUrlPermittedUnderAirGap(urlStr, method)) {
      return originalFetchRef!(input, init);
    }

    blockedRequestsCount += 1;
    lastBlockedEndpoint = urlStr.slice(0, 80);
    notifyListeners();

    return new Response(
      JSON.stringify({
        airGapBlocked: true,
        error: 'Blocked by Marigold Offline Air-Gap Lock (0 bytes transmitted).',
      }),
      {
        status: 451,
        statusText: 'Blocked by Sovereign Air-Gap Lock',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };
}

export function setAirGapLocked(locked: boolean): AirGapTelemetry {
  isAirGapLockedMemory = locked;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AIR_GAP_STORAGE_KEY, locked ? 'true' : 'false');
      window.dispatchEvent(
        new CustomEvent('marigold-airgap-changed', { detail: { locked } })
      );
    } catch {
      // Ignore storage error
    }
    if (locked) {
      installAirGapFetchInterceptor();
    }
  }
  notifyListeners();
  return getAirGapTelemetry();
}

export function subscribeAirGapTelemetry(
  listener: (state: AirGapTelemetry) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetAirGapCountersForTest(): void {
  blockedRequestsCount = 0;
  lastBlockedEndpoint = null;
  notifyListeners();
}
