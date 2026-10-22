import React, { useEffect, useState } from "react";
import Badge from "./Badge";
import { populateAccountLive } from "../../api/accountService";
import { CountryFlag } from "../../components/common/FlagIcon";

function getScoreColor(label) {
  if (label === "red") return "var(--color-brand-danger)";
  if (label === "amber") return "var(--color-brand-warning)";
  if (label === "green") return "var(--color-brand-success)";
  return "var(--color-text-muted)";
}

function getRateColor(rate) {
  if (rate >= 80) return "var(--color-brand-success)";
  if (rate >= 60) return "var(--color-brand-warning)";
  return "var(--color-brand-danger)";
}

function getProgressFill(rate) {
  if (rate >= 80) return "var(--color-brand-success)";
  if (rate >= 50) return "var(--color-brand-warning)";
  return "var(--color-brand-danger)";
}

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ProgressRow({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 140, fontWeight: 600 }}>{label}</span>
      <div
        style={{
          flex: 1,
          background: "var(--color-background-secondary)",
          borderRadius: 8,
          height: 8,
          overflow: "hidden",
          border: "1px solid var(--color-border-primary)",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 8,
            background: getProgressFill(value),
            width: `${value}%`,
          }}
        />
      </div>
      <span style={{ fontSize: 13, color: "var(--color-text-primary)", minWidth: 36, textAlign: "right", fontWeight: 700, fontFamily: "var(--font-display)" }}>
        {value}%
      </span>
    </div>
  );
}

function InfoRow({ icon, label, value, valueColor }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px dashed var(--color-border-primary)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
        {icon} {label}
      </span>
      <span style={{ fontWeight: 700, color: valueColor ?? "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

export default function AccountDetail({ account: initialAccount, onBack }) {
  const [account, setAccount] = useState(initialAccount);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    if (initialAccount && (initialAccount.databasename || initialAccount.Databasename)) {
      setLoadingLive(true);
      populateAccountLive(initialAccount)
        .then((enriched) => setAccount(enriched))
        .finally(() => setLoadingLive(false));
    }
  }, [initialAccount]);

  const deliveryRate =
    account.sent > 0 ? Math.round((account.delivered / account.sent) * 100) : 0;

  const badges = [account.plan, account.status, account.channel, account.salesModel].filter(Boolean);

  return (
    <div style={{ padding: "0 0 2rem", fontFamily: "var(--font-sans)", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="tab-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            border: "1px solid var(--color-border-primary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            borderRadius: "var(--border-radius-md)",
            fontSize: 13,
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FF1300";
            e.currentTarget.style.color = "#FF1300";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-primary)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
        >
          ← All accounts
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 4,
            background: account.healthLabel === "green" ? "var(--color-brand-success)" : account.healthLabel === "amber" ? "var(--color-brand-warning)" : "var(--color-brand-danger)",
          }}
        />
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-background-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "var(--color-text-primary)",
            border: "1.5px solid var(--color-border-primary)",
            flexShrink: 0,
          }}
        >
          {getInitials(account.name)}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>{account.name}</div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <CountryFlag country={account.country} size={16} />
            <span>{account.country || "India"} · {account.industry}</span>
          </div>
        </div>
        {account.healthScore !== null && !account.newlyOnboarded && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: getScoreColor(account.healthLabel),
                fontFamily: "var(--font-display)",
                lineHeight: 1,
              }}
            >
              {account.healthScore}{" "}
              <span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase" }}>{account.healthLabel}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Health score</div>
          </div>
        )}
        {account.newlyOnboarded && (
          <div style={{ marginLeft: "auto" }}>
            <span className="plan-pill" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
              newly onboarded
            </span>
          </div>
        )}
      </div>

      {/* Badges Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {badges.map((b) => <Badge key={b} label={b} />)}
        {account.renewalDays < 365 && (
          <span
            className="plan-pill"
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: account.renewalDays < 10 ? "#fee2e2" : account.renewalDays < 30 ? "#fef3c7" : "var(--color-background-secondary)",
              color: account.renewalDays < 10 ? "#b91c1c" : account.renewalDays < 30 ? "#b45309" : "var(--color-text-secondary)",
              border: "none",
            }}
          >
            {account.renewalDays}d renewal
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { label: "Campaigns", value: account.campaigns, color: "var(--color-text-primary)" },
          { label: "Sent", value: account.sent > 0 ? account.sent.toLocaleString() : "—", color: "var(--color-text-primary)" },
          { label: "Delivered", value: account.delivered > 0 ? account.delivered.toLocaleString() : "—", color: "var(--color-brand-success)" },
          { label: "Del. Rate", value: account.sent > 0 ? `${deliveryRate}%` : "—", color: getRateColor(deliveryRate) },
          { label: "Lists", value: account.listsUploaded, color: "var(--color-text-primary)" },
          { label: "Templates", value: account.templatesCreated, color: "var(--color-text-primary)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="card"
            style={{
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
        {/* Left Col: Health Breakdown & Campaigns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Health Breakdown */}
          {!account.newlyOnboarded && (
            <div className="card">
              <div className="card-title">Health Breakdown</div>
              {/* Health bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, height: 10, overflow: "hidden", border: "1px solid var(--color-border-primary)" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 8,
                      background: getScoreColor(account.healthLabel),
                      width: `${account.healthScore ?? 0}%`,
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6, color: "var(--color-text-secondary)", fontWeight: 500 }}>
                  <span>0 — critical</span>
                  <span style={{ color: getScoreColor(account.healthLabel), fontWeight: 700 }}>
                    {account.healthScore} {account.healthLabel}
                  </span>
                  <span>100 — healthy</span>
                </div>
              </div>
              <ProgressRow label="Delivery rate" value={account.healthBreakdown?.deliveryRate ?? 0} />
              <ProgressRow label="Campaign activity" value={account.healthBreakdown?.campaignActivity ?? 0} />
              <ProgressRow label="Template usage" value={account.healthBreakdown?.templateUsage ?? 0} />
              <ProgressRow label="List growth" value={account.healthBreakdown?.listGrowth ?? 0} />
            </div>
          )}

          {/* Campaigns */}
          <div className="card">
            <div className="card-title">Recent Campaigns</div>
            {account.campaignDetails && account.campaignDetails.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {account.campaignDetails.map((c, idx) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "var(--color-background-secondary)",
                      border: "1px solid var(--color-border-primary)",
                      borderRadius: "var(--border-radius-md)",
                    }}
                  >
                    <div>
                      {
                        // Avoid repeating the account name for each campaign. If the campaign
                        // name equals the account name, show the campaign type/date or a
                        // sensible fallback instead.
                      }
                      <div style={{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: 700 }}>
                        {c.name === account.name
                          ? (c.type || `Campaign ${idx + 1}`)
                          : c.name}
                      </div>
                      {(c.name === account.name)
                        ? (c.date ? <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, fontWeight: 500 }}>{c.date}</div> : null)
                        : <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, fontWeight: 500 }}>{c.type} · {c.date}</div>
                      }
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: getRateColor(Number(c.deliveryRate) || 0), fontFamily: "var(--font-display)" }}>
                        {(Number(c.deliveryRate) || 0)}%
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>{(c.sent || 0).toLocaleString()} sent</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", textAlign: "center", padding: "2rem 0", fontWeight: 500 }}>
                No campaigns yet
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Account Info & Engagement */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Account info */}
          <div className="card">
            <div className="card-title">Account details</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-border-primary)" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                  📍 Country
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <CountryFlag country={account.country} size={16} />
                  {account.country || "India"}
                </span>
              </div>
              <InfoRow icon="💼" label="Industry" value={account.industry} />
              <InfoRow icon="🏷" label="Plan" value={account.plan} />
              <InfoRow icon="👥" label="Sales Model" value={account.salesModel} />
            </div>
          </div>

          {/* Engagement stats */}
          <div className="card">
            <div className="card-title">Engagement Info</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <InfoRow icon="📋" label="Lists Uploaded" value={`${account.listsUploaded} lists`} />
              <InfoRow icon="📄" label="Templates Created" value={`${account.templatesCreated} templates`} />
              <InfoRow
                icon="📅"
                label="Next Renewal"
                value={account.renewalDays < 365 ? `${account.renewalDays} days` : "—"}
                valueColor={account.renewalDays < 10 ? "var(--color-brand-danger)" : account.renewalDays < 30 ? "var(--color-brand-warning)" : undefined}
              />
              <InfoRow
                icon="⚡"
                label="Account Status"
                value={account.status}
                valueColor={account.status === "Active" ? "var(--color-brand-success)" : "var(--color-brand-danger)"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
