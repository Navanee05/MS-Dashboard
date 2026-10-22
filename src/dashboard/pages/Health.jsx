import React, { useEffect, useState, useCallback, useRef } from "react";
import AccountCard from "../components/AccountCard";
import AccountDetail from "../components/AccountDetail";
import { fetchAccounts, populateAccountLive } from "../../api/accountService";

const PAGE_SIZE = 12; // 12 cards per page for high performance and fast rendering
const ENRICH_CONCURRENCY = 3; // gentle concurrency so browser is never choked
const CACHE_KEY = 'health_enriched_cache';

// Load persisted enriched cache from sessionStorage
function loadEnrichedCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? new Map(JSON.parse(raw)) : new Map();
  } catch { return new Map(); }
}

function saveEnrichedCache(map) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify([...map]));
  } catch { /* ignore */ }
}

export default function Health() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const enrichedIds = useRef(new Set());
  const enrichedCache = useRef(loadEnrichedCache());

  useEffect(() => {
    setLoading(true);
    fetchAccounts()
      .then((data) => {
        const cache = enrichedCache.current;
        const withCache = data.map((a) => {
          const cached = cache.get(a.id);
          if (cached) {
            enrichedIds.current.add(a.id);
            return { ...a, ...cached };
          }
          return a;
        });
        setAccounts(withCache);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const counts = accounts.reduce(
    (acc, a) => {
      if (a.newlyOnboarded) return acc;
      if (a.healthLabel === "green") acc.healthy++;
      else if (a.healthLabel === "amber") acc.atRisk++;
      else if (a.healthLabel === "red") acc.critical++;
      return acc;
    },
    { healthy: 0, atRisk: 0, critical: 0 }
  );

  const filteredAccounts = accounts
    .filter((a) => {
      const matchesFilter = filter === "all" || a.healthLabel === filter;
      const matchesSearch = !search.trim() ||
        (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.databasename || "").toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => (b.campaigns || 0) - (a.campaigns || 0) || (b.sent || 0) - (a.sent || 0) || (a.name || "").localeCompare(b.name || ""));

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);
  const pageStart = (validPage - 1) * PAGE_SIZE;
  const paginatedAccounts = filteredAccounts.slice(pageStart, pageStart + PAGE_SIZE);

  // Enrich ONLY the currently visible page accounts in fast gentle batches
  useEffect(() => {
    if (paginatedAccounts.length === 0) return;
    const toEnrich = paginatedAccounts.filter(
      (a) => a.databasename && !enrichedIds.current.has(a.id)
    );
    if (toEnrich.length === 0) return;

    let cancelled = false;
    async function enrichVisible() {
      for (let i = 0; i < toEnrich.length; i += ENRICH_CONCURRENCY) {
        if (cancelled) break;
        const batch = toEnrich.slice(i, i + ENRICH_CONCURRENCY);
        const enriched = await Promise.all(batch.map((a) => populateAccountLive(a)));
        if (cancelled) break;

        enriched.forEach((ea) => {
          enrichedIds.current.add(ea.id);
          enrichedCache.current.set(ea.id, {
            campaigns: ea.campaigns, sent: ea.sent, delivered: ea.delivered,
            listsUploaded: ea.listsUploaded, templatesCreated: ea.templatesCreated,
            formsCreated: ea.formsCreated, healthScore: ea.healthScore,
            healthLabel: ea.healthLabel, healthBreakdown: ea.healthBreakdown,
            communicationJobs: ea.communicationJobs, campaignDetails: ea.campaignDetails,
          });
        });
        saveEnrichedCache(enrichedCache.current);

        setAccounts((prev) =>
          prev.map((a) => {
            const found = enriched.find((e) => e.id === a.id);
            return found ? found : a;
          })
        );
      }
    }
    enrichVisible();
    return () => { cancelled = true; };
  }, [validPage, filter, search, paginatedAccounts.map(a => a.id).join(',')]);

  if (loading) {
    return (
      <div className="content loading-skeleton" style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "var(--color-text-secondary)", marginTop: 12, fontSize: 14 }}>Loading accounts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content" style={styles.center}>
        <p style={{ color: "var(--color-brand-danger)", fontSize: 14 }}>⚠ {error}</p>
        <button
          className="tab-btn active"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="content" style={styles.page}>
        <AccountDetail account={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="content" style={styles.page}>
      {/* Header */}
      <div>
        <div className="section-label">Customer Health Monitor</div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Real-time tracking of active user accounts, communication delivery rates, and renewal cycles.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi-card" onClick={() => { setFilter("all"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
          <div className="kpi-label">Total Monitored</div>
          <div className="kpi-value">{accounts.length}</div>
          <div className="kpi-delta">Active client accounts</div>
        </div>
        <div className="kpi-card" onClick={() => { setFilter("green"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
          <div className="kpi-label" style={{ color: "var(--color-brand-success)" }}>Healthy</div>
          <div className="kpi-value" style={{ color: "var(--color-brand-success)" }}>{counts.healthy}</div>
          <div className="kpi-delta">Performing as expected</div>
        </div>
        <div className="kpi-card" onClick={() => { setFilter("amber"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
          <div className="kpi-label" style={{ color: "var(--color-brand-warning)" }}>At Risk</div>
          <div className="kpi-value" style={{ color: "var(--color-brand-warning)" }}>{counts.atRisk}</div>
          <div className="kpi-delta">Requires monitoring</div>
        </div>
        <div className="kpi-card" onClick={() => { setFilter("red"); setCurrentPage(1); }} style={{ cursor: "pointer" }}>
          <div className="kpi-label" style={{ color: "var(--color-brand-danger)" }}>Critical</div>
          <div className="kpi-value" style={{ color: "var(--color-brand-danger)" }}>{counts.critical}</div>
          <div className="kpi-delta">Immediate action required</div>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <div className="tab-row" style={{ display: "inline-flex", background: "var(--color-background-secondary)", padding: "4px", borderRadius: "var(--border-radius-md)", border: "1px solid var(--color-border-primary)", marginBottom: 0 }}>
          {[
            { key: "all", label: "All Accounts" },
            { key: "green", label: "Healthy" },
            { key: "amber", label: "At Risk" },
            { key: "red", label: "Critical" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${filter === tab.key ? " active" : ""}`}
              style={{ padding: "8px 16px", fontSize: "13px", marginBottom: 0, border: "none", boxShadow: filter === tab.key ? "var(--shadow-sm)" : "none" }}
              onClick={() => { setFilter(tab.key); setCurrentPage(1); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1", maxWidth: 340 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
            <input
              id="health-search"
              type="text"
              placeholder="Search by name or database…"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                fontSize: 13,
                border: "1px solid var(--color-border-primary)",
                borderRadius: "var(--border-radius-md)",
                background: "var(--color-background-secondary)",
                color: "var(--color-text-primary)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#FF1300"}
              onBlur={e => e.target.style.borderColor = "var(--color-border-primary)"}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setCurrentPage(1); }}
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 14, padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Count display */}
        <span style={{ fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap", fontWeight: 600 }}>
          Showing {paginatedAccounts.length} of {filteredAccounts.length} accounts
        </span>
      </div>

      {/* Cards grid */}
      <div style={styles.grid}>
        {paginatedAccounts.length > 0 ? paginatedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={(a) => setSelected(a)}
          />
        )) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)", fontSize: 14, fontWeight: 500 }}>
            No accounts match "{search}"
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "16px" }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="tab-btn"
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              opacity: validPage === 1 ? 0.5 : 1,
              cursor: validPage === 1 ? "not-allowed" : "pointer",
              border: "1px solid var(--color-border-primary)",
              background: "var(--color-background-primary)"
            }}
          >
            ← Prev
          </button>
          
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 600, padding: "0 12px" }}>
            Page {validPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="tab-btn"
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              opacity: validPage === totalPages ? 0.5 : 1,
              cursor: validPage === totalPages ? "not-allowed" : "pointer",
              border: "1px solid var(--color-border-primary)",
              background: "var(--color-background-primary)"
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    height: "100%",
    overflowY: "auto",

    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--color-border-primary)",
    borderTop: "3px solid #FF1300",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
