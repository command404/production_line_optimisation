import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

async function callApi(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-token": API_TOKEN,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function UtilizationBar({ station, value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? "#e05252" : pct >= 75 ? "#e0a952" : pct >= 50 ? "#e0d652" : "#52c97a";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span>{station.replace("_Util", "")}</span>
        <strong>{pct}%</strong>
      </div>
      <div style={{ background: "#22282f", borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%" }} />
      </div>
    </div>
  );
}

/* ============ PRODUCTION AGENT (auto-loads real bottleneck summary) ============ */
export function ProductionAgentLive() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callApi("/production/summary")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="feature-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot"></span>PRODUCTION AGENT</div>
          <h2>Production Performance</h2>
          <p>Live bottleneck analysis from the trained utilization model.</p>
        </div>
      </div>

      <section className="panel">
        {loading && <p>Loading real production data...</p>}
        {error && <p style={{ color: "#e05252" }}>Backend offline or unreachable: {error}</p>}
        {data && (
          <>
            <p style={{ marginBottom: 16 }}>
              Current bottleneck: <strong>{data.bottleneck_station.replace("_Util", "")}</strong> at{" "}
              <strong>{Math.round(data.bottleneck_value * 100)}%</strong> utilization.
            </p>
            {Object.entries(data.utilization)
              .sort((a, b) => b[1] - a[1])
              .map(([station, value]) => (
                <UtilizationBar key={station} station={station} value={value} />
              ))}
          </>
        )}
      </section>
    </div>
  );
}

/* ============ SIMULATION AGENT (manual input + AI search) ============ */
export function SimulationAgentLive() {
  const [demand, setDemand] = useState({ sku1_demand: 14700, sku2_demand: 14900, sku3_demand: 14880, sku4_demand: 14870 });
  const [result, setResult] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const runManual = () => {
    setLoading(true); setError(null);
    callApi("/simulation/predict", demand)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const runSearch = () => {
    setSearching(true); setError(null);
    callApi("/simulation/search")
      .then(setSearchResult)
      .catch((e) => setError(e.message))
      .finally(() => setSearching(false));
  };

  return (
    <div className="feature-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot"></span>PRODUCTION SIMULATION</div>
          <h2>What-If Simulation</h2>
          <p>Test your own demand mix, or let the AI search for the best one.</p>
        </div>
      </div>

      {error && <p style={{ color: "#e05252" }}>Backend offline or unreachable: {error}</p>}

      <section className="panel" style={{ marginBottom: 20 }}>
        <h3>Manual scenario</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0" }}>
          {["sku1_demand", "sku2_demand", "sku3_demand", "sku4_demand"].map((key) => (
            <label key={key} style={{ fontSize: 13 }}>
              {key.replace("_demand", "").toUpperCase()}
              <input
                type="number"
                value={demand[key]}
                onChange={(e) => setDemand({ ...demand, [key]: Number(e.target.value) })}
                style={{ display: "block", marginTop: 4, padding: 6, width: 100 }}
              />
            </label>
          ))}
        </div>
        <button className="primary-button" onClick={runManual} disabled={loading}>
          {loading ? "Running..." : "Run Scenario"}
        </button>

        {result && (
          <div style={{ marginTop: 16 }}>
            <p>Predicted bottleneck: <strong>{result.bottleneck_station.replace("_Util", "")}</strong></p>
            {Object.entries(result.utilization)
              .sort((a, b) => b[1] - a[1])
              .map(([station, value]) => (
                <UtilizationBar key={station} station={station} value={value} />
              ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3>AI-driven search</h3>
        <p style={{ fontSize: 13, marginBottom: 12 }}>Samples thousands of demand mixes and finds the one with the lowest worst-station bottleneck.</p>
        <button className="primary-button" onClick={runSearch} disabled={searching}>
          {searching ? "Searching..." : "Find Best Condition"}
        </button>

        {searchResult && (
          <div style={{ marginTop: 16 }}>
            <p>Best demand mix found:</p>
            <ul style={{ fontSize: 13 }}>
              {Object.entries(searchResult.demand).map(([k, v]) => (
                <li key={k}>{k}: {Math.round(v)}</li>
              ))}
            </ul>
            {Object.entries(searchResult.utilization)
              .sort((a, b) => b[1] - a[1])
              .map(([station, value]) => (
                <UtilizationBar key={station} station={station} value={value} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
