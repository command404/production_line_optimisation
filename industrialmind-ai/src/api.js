// Client for the recommendation backend (FastAPI running in Colab, exposed through a tunnel).
// Configure it in .env at the project root (restart `npm run dev` after any change):
//   VITE_API_URL=https://xxxx.ngrok-free.app     (no trailing slash; changes on every Colab restart)
//   VITE_API_TOKEN=<same value as the BACKEND_TOKEN Colab secret>

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const TOKEN = import.meta.env.VITE_API_TOKEN || "";

export const apiConfigured = Boolean(BASE && TOKEN);

function describeStatus(status) {
  if (status === 401) return "The API token does not match the backend's BACKEND_TOKEN.";
  if (status === 404) return "The backend does not have this endpoint. Check that the latest server cell is running.";
  if (status === 500) return "The backend hit an error. Check the Colab cell output for the traceback.";
  if (status === 502 || status === 503 || status === 504) return "The backend is unreachable or busy. Try again in a moment.";
  return `The backend returned an error (${status}).`;
}

async function call(path, { method = "GET", body, timeoutMs = 20000 } = {}) {
  if (!apiConfigured) {
    throw new Error("Backend is not configured. Set VITE_API_URL and VITE_API_TOKEN in .env.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "x-token": TOKEN,
        "ngrok-skip-browser-warning": "true", // skips ngrok's free-tier interstitial page
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(describeStatus(res.status));
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("The backend took too long to respond.");
    if (err instanceof TypeError) {
      throw new Error("Cannot reach the backend. Is the Colab server running, and is VITE_API_URL current?");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const health = () => call("/health", { timeoutMs: 8000 });

// agentNames: array like ["production_agent"], or null to use findings from all agents.
export const recommend = (query, agentNames = null) =>
  call("/recommend", { method: "POST", body: { query, agent_names: agentNames }, timeoutMs: 90000 });

export const decisions = (limit = 50) => call(`/decisions?limit=${limit}`);

export const setOutcome = (recId, outcome, notes = "") =>
  call("/outcome", { method: "POST", body: { rec_id: recId, outcome, notes } });
