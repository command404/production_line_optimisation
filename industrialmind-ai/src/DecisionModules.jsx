import { useCallback, useEffect, useState } from "react";
import "./DecisionModules.css";
import { apiConfigured, health, recommend, decisions, setOutcome } from "./api";

/* =====================================================
   SHARED HELPERS
===================================================== */

const OUTCOMES = [
  { value: "worked", label: "Worked" },
  { value: "partial", label: "Partly worked" },
  { value: "failed", label: "Failed" },
];

const OUTCOME_LABEL = {
  worked: "Worked",
  partial: "Partly worked",
  failed: "Failed",
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

// null = still checking, true = reachable, false = offline or not configured
function useBackendStatus() {
  const [reachable, setReachable] = useState(null);

  useEffect(() => {
    if (!apiConfigured) return undefined;

    let alive = true;
    const check = () =>
      health()
        .then(() => alive && setReachable(true))
        .catch(() => alive && setReachable(false));

    check();
    const id = setInterval(check, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return apiConfigured ? reachable : false;
}

function useDecisions(limit = 100) {
  const [state, setState] = useState({ items: [], loading: true, error: "" });

  const reload = useCallback(
    () =>
      decisions(limit)
        .then((items) => setState({ items, loading: false, error: "" }))
        .catch((err) =>
          setState((prev) => ({ ...prev, loading: false, error: err.message }))
        ),
    [limit]
  );

  useEffect(() => {
    if (apiConfigured) reload();
  }, [reload]);

  return { ...state, loading: apiConfigured && state.loading, reload };
}

function StatusPill({ online }) {
  return (
    <div className={`module-status ${online === false ? "dm-offline" : ""}`}>
      <span className="status-dot"></span>
      {online === null && "Checking backend"}
      {online === true && "Backend connected"}
      {online === false && "Backend offline"}
    </div>
  );
}

function BackendBanner({ online }) {
  if (online !== false) return null;

  return (
    <div className="dm-banner" role="alert">
      {apiConfigured ? (
        <>
          <strong>Cannot reach the backend.</strong> Start the server cell in Colab, copy the new
          API URL into <code>VITE_API_URL</code> in <code>.env</code>, then restart{" "}
          <code>npm run dev</code>.
        </>
      ) : (
        <>
          <strong>Backend is not configured.</strong> Add <code>VITE_API_URL</code> and{" "}
          <code>VITE_API_TOKEN</code> to <code>.env</code>, then restart <code>npm run dev</code>.
        </>
      )}
    </div>
  );
}

function OutcomeBadge({ outcome }) {
  return (
    <span className={`dm-badge ${outcome || "pending"}`}>
      {outcome ? OUTCOME_LABEL[outcome] : "Not reviewed"}
    </span>
  );
}

/* Small safe markdown renderer for the model's answer: headings, bullets,
   numbered items, bold, italic, inline code. No HTML is ever injected. */

function renderInline(text) {
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let key = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) parts.push(<strong key={key++}>{renderInline(token.slice(2, -2))}</strong>);
    else if (token.startsWith("`")) parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
    else parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownText({ text }) {
  const blocks = [];

  String(text || "")
    .split("\n")
    .forEach((line, index) => {
      if (!line.trim()) return;

      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
        blocks.push(<hr key={index} />);
        return;
      }

      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        const level = Math.min(heading[1].length, 3);
        blocks.push(
          <div key={index} className={`dm-md-h dm-md-h${level}`}>
            {renderInline(heading[2])}
          </div>
        );
        return;
      }

      const bullet = line.match(/^(\s*)[*+-]\s+(.*)$/);
      if (bullet) {
        const depth = Math.min(Math.ceil(bullet[1].length / 4), 3);
        blocks.push(
          <div key={index} className="dm-md-li" style={{ paddingLeft: depth * 18 }}>
            <span aria-hidden="true">•</span>
            <div>{renderInline(bullet[2])}</div>
          </div>
        );
        return;
      }

      const numbered = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
      if (numbered) {
        const depth = Math.min(Math.ceil(numbered[1].length / 4), 3);
        blocks.push(
          <div key={index} className="dm-md-li" style={{ paddingLeft: depth * 18 }}>
            <span className="dm-md-num">{numbered[2]}.</span>
            <div>{renderInline(numbered[3])}</div>
          </div>
        );
        return;
      }

      blocks.push(<p key={index}>{renderInline(line.trim())}</p>);
    });

  return <div className="dm-md">{blocks}</div>;
}

/* =====================================================
   RECOMMENDATIONS
===================================================== */

const SUGGESTIONS = [
  "cell saturated bottleneck",
  "rising defect rate after a batch change",
  "unplanned line stoppage",
];

export function Recommendations({ onNavigate }) {
  const online = useBackendStatus();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("production_agent");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function ask(event) {
    event.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const asked = query.trim();
      const response = await recommend(asked, scope === "all" ? null : [scope]);
      setResult({ ...response, asked });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const findings = result?.findings_used ?? [];
  const pastDecisions = result?.retrieved?.past_decisions ?? [];
  const solutions = result?.retrieved?.solutions ?? [];

  return (
    <div className="dm-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot"></span>
            DECISION ENGINE
          </div>
          <h2>Recommendations</h2>
          <p>
            Get a recommendation based on the latest agent findings and on what happened after
            earlier decisions.
          </p>
        </div>
        <StatusPill online={online} />
      </div>

      <BackendBanner online={online} />

      <form className="panel dm-ask" onSubmit={ask}>
        <label className="panel-kicker" htmlFor="dm-query">
          SITUATION
        </label>
        <div className="dm-query-row">
          <input
            id="dm-query"
            className="dm-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe the problem, for example: cell saturated bottleneck"
            autoComplete="off"
          />
          <div className="batch-selector">
            <span>USE FINDINGS FROM</span>
            <select value={scope} onChange={(event) => setScope(event.target.value)}>
              <option value="production_agent">Production Agent</option>
              <option value="all">All agents</option>
            </select>
          </div>
          <button
            type="submit"
            className="primary-button"
            disabled={loading || !query.trim() || online === false}
          >
            {loading ? "Working…" : "Get recommendation"}
          </button>
        </div>
        <div className="dm-chips">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              className="dm-chip"
              onClick={() => setQuery(text)}
            >
              {text}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <p className="dm-error" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className="panel dm-empty" role="status">
          Reading agent findings and past decisions, then asking the model. This takes a few
          seconds.
        </div>
      )}

      {!result && !loading && !error && (
        <div className="panel dm-empty">
          Describe a situation to get a recommendation. The system reads the latest agent findings
          and reviews earlier decisions together with their outcomes.
        </div>
      )}

      {result && (
        <div className="dm-grid">
          <section className="panel" aria-label="Recommendation">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">RECOMMENDATION #{result.recommendation_id}</span>
                <h3>{result.asked}</h3>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => onNavigate && onNavigate("learning")}
              >
                Record the outcome later
              </button>
            </div>
            <MarkdownText text={result.recommendation} />
          </section>

          <aside className="dm-side">
            <div className="panel">
              <span className="panel-kicker">EVIDENCE USED</span>
              <ul className="dm-evidence">
                <li>
                  <strong>{findings.length}</strong> agent {findings.length === 1 ? "finding" : "findings"}
                </li>
                <li>
                  <strong>{pastDecisions.length}</strong> past{" "}
                  {pastDecisions.length === 1 ? "decision" : "decisions"} with outcomes
                </li>
                <li>
                  <strong>{solutions.length}</strong> stored {solutions.length === 1 ? "solution" : "solutions"}
                </li>
              </ul>
            </div>

            {findings.length > 0 && (
              <div className="panel">
                <span className="panel-kicker">AGENT FINDINGS</span>
                {findings.map((finding, index) => (
                  <div key={index} className="dm-evidence-row">
                    <strong>{finding.agent}</strong>
                    <span>{finding.type}</span>
                    <small>{formatDate(finding.at)}</small>
                  </div>
                ))}
              </div>
            )}

            {pastDecisions.length > 0 && (
              <div className="panel">
                <span className="panel-kicker">PAST DECISIONS CONSIDERED</span>
                {pastDecisions.map((decision) => (
                  <div key={decision.decision_id} className="dm-evidence-row">
                    <strong>#{decision.decision_id}</strong>
                    <span>{decision.situation}</span>
                    <OutcomeBadge outcome={decision.outcome} />
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   KNOWLEDGE BASE
===================================================== */

export function KnowledgeBase() {
  const online = useBackendStatus();
  const { items, loading, error } = useDecisions(100);
  const [filter, setFilter] = useState("");

  const count = (outcome) => items.filter((item) => item.outcome === outcome).length;
  const term = filter.trim().toLowerCase();
  const shown = items.filter((item) =>
    `${item.query} ${item.notes || ""} ${item.recommendation}`.toLowerCase().includes(term)
  );

  return (
    <div className="dm-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot"></span>
            DECISION MEMORY
          </div>
          <h2>Knowledge Base</h2>
          <p>Every recommendation the system has made, and what happened afterwards.</p>
        </div>
        <StatusPill online={online} />
      </div>

      <BackendBanner online={online} />

      <div className="dm-metrics">
        <div className="panel dm-metric">
          <span className="panel-kicker">TOTAL</span>
          <strong>{items.length}</strong>
        </div>
        <div className="panel dm-metric">
          <span className="panel-kicker">WORKED</span>
          <strong>{count("worked")}</strong>
        </div>
        <div className="panel dm-metric">
          <span className="panel-kicker">PARTLY WORKED</span>
          <strong>{count("partial")}</strong>
        </div>
        <div className="panel dm-metric">
          <span className="panel-kicker">FAILED</span>
          <strong>{count("failed")}</strong>
        </div>
        <div className="panel dm-metric">
          <span className="panel-kicker">NOT REVIEWED</span>
          <strong>{items.filter((item) => !item.outcome).length}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">DECISION HISTORY</span>
            <h3>Past recommendations</h3>
          </div>
          <input
            className="dm-input dm-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search decisions"
            aria-label="Search decisions"
          />
        </div>

        {error && (
          <p className="dm-error" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="dm-muted">Loading decisions…</p>}
        {!loading && !error && items.length === 0 && (
          <p className="dm-muted">
            No decisions yet. Ask for a recommendation and it will be saved here.
          </p>
        )}
        {!loading && items.length > 0 && shown.length === 0 && (
          <p className="dm-muted">No decisions match your search.</p>
        )}

        {shown.map((item) => (
          <details key={item.id} className="dm-item">
            <summary>
              <span className="dm-item-id">#{item.id}</span>
              <span className="dm-item-title">{item.query}</span>
              <OutcomeBadge outcome={item.outcome} />
              <small>{formatDate(item.created_at)}</small>
            </summary>
            <div className="dm-item-body">
              {item.notes && (
                <p className="dm-note">
                  <strong>What happened:</strong> {item.notes}
                </p>
              )}
              <MarkdownText text={item.recommendation} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   LEARNING & FEEDBACK
===================================================== */

function OutcomeCard({ item, onSaved }) {
  const [outcome, setOutcomeValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const notesId = `dm-notes-${item.id}`;

  async function save() {
    if (!outcome || saving) return;
    setSaving(true);
    setError("");

    try {
      await setOutcome(item.id, outcome, notes.trim());
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel dm-review">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">
            DECISION #{item.id} · {formatDate(item.created_at)}
          </span>
          <h3>{item.query}</h3>
        </div>
      </div>

      <details className="dm-read">
        <summary>Read the recommendation</summary>
        <MarkdownText text={item.recommendation} />
      </details>

      <div className="dm-outcomes" role="group" aria-label="What happened">
        {OUTCOMES.map((option) => (
          <button
            key={option.value}
            type="button"
            className="dm-outcome-button"
            aria-pressed={outcome === option.value}
            onClick={() => setOutcomeValue(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="dm-label" htmlFor={notesId}>
        What happened, and why?
      </label>
      <textarea
        id={notesId}
        className="dm-input dm-textarea"
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="For example: the adjacent cells share the same fixture, so Cell 3 stayed saturated."
      />
      <p className="dm-hint">
        The model reads this note the next time a similar situation comes up. A specific cause
        teaches it more than a bare outcome.
      </p>

      {error && (
        <p className="dm-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="primary-button"
        onClick={save}
        disabled={!outcome || saving}
      >
        {saving ? "Saving…" : "Save outcome"}
      </button>
    </div>
  );
}

export function LearningFeedback() {
  const online = useBackendStatus();
  const { items, loading, error, reload } = useDecisions(100);
  const pending = items.filter((item) => !item.outcome);
  const reviewed = items.length - pending.length;

  return (
    <div className="dm-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot"></span>
            FEEDBACK LOOP
          </div>
          <h2>Learning &amp; Feedback</h2>
          <p>Tell the system what happened. Each outcome improves the next recommendation.</p>
        </div>
        <StatusPill online={online} />
      </div>

      <BackendBanner online={online} />

      <div className="dm-metrics dm-metrics-two">
        <div className="panel dm-metric">
          <span className="panel-kicker">WAITING FOR AN OUTCOME</span>
          <strong>{pending.length}</strong>
        </div>
        <div className="panel dm-metric">
          <span className="panel-kicker">REVIEWED</span>
          <strong>{reviewed}</strong>
        </div>
      </div>

      {error && (
        <p className="dm-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="dm-muted">Loading decisions…</p>}
      {!loading && !error && pending.length === 0 && (
        <div className="panel dm-empty">
          {items.length === 0
            ? "No decisions yet. Ask for a recommendation first."
            : "Every decision has an outcome. New recommendations will appear here."}
        </div>
      )}

      {pending.map((item) => (
        <OutcomeCard key={item.id} item={item} onSaved={reload} />
      ))}
    </div>
  );
}
