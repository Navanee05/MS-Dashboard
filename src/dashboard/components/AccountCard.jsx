import React from "react";
import Badge from "./Badge";
import { CountryFlag } from "../../components/common/FlagIcon";

function getDeliveryColor(rate) {
  if (rate >= 80) return "var(--color-brand-success)";
  if (rate >= 50) return "var(--color-brand-warning)";
  return "var(--color-brand-danger)";
}

function getProgressColor(rate) {
  if (rate >= 80) return "var(--color-brand-success)";
  if (rate >= 50) return "var(--color-brand-warning)";
  return "var(--color-brand-danger)";
}

function getTopBarColor(account) {
  if (account.newlyOnboarded) return "var(--color-border-secondary)";
  if (account.healthLabel === "red") return "var(--color-brand-danger)";
  if (account.healthLabel === "amber") return "var(--color-brand-warning)";
  if (account.healthLabel === "green") return "var(--color-brand-success)";
  return "var(--color-border-secondary)";
}

function getScoreColor(label) {
  if (label === "red") return "var(--color-brand-danger)";
  if (label === "amber") return "var(--color-brand-warning)";
  if (label === "green") return "var(--color-brand-success)";
  return "var(--color-text-muted)";
}

export default function AccountCard({ account, onClick }) {
  const deliveryRate =
    account.sent > 0 ? Math.round((account.delivered / account.sent) * 100) : 0;

  const badges = [
    account.plan,
    account.status,
    account.channel,
    account.salesModel,
  ].filter(Boolean);

  return (
    <div
      onClick={() => onClick(account)}
      className="customer-card"
      style={{
        padding: "1.25rem",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        marginBottom: 0,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Top colour bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: getTopBarColor(account),
        }}
      />

      {/* Header */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.3px" }}>
          {account.name}
        </div>
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

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "4px 0" }}>
        {badges.map((b) => (
          <Badge key={b} label={b} />
        ))}
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 4 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
            {account.campaigns}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
            Campaigns
          </div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
            {account.newlyOnboarded ? "—" : account.sent > 0 ? (account.sent / 1000).toFixed(1) + 'k' : "0"}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
            Sent
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: account.newlyOnboarded
                ? "var(--color-text-primary)"
                : account.sent > 0
                ? getDeliveryColor(deliveryRate)
                : "var(--color-brand-danger)",
            }}
          >
            {account.newlyOnboarded ? "—" : `${deliveryRate}%`}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
            Del. Rate
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!account.newlyOnboarded && account.sent > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 6,
              height: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 6,
                background: getProgressColor(deliveryRate),
                width: `${deliveryRate}%`,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6, fontWeight: 500 }}>
            {account.delivered.toLocaleString()} of {account.sent.toLocaleString()} delivered
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 16,
          borderTop: "1px dashed var(--color-border-primary)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* Health score or new badge */}
        {account.newlyOnboarded ? (
          <span className="plan-pill" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
            newly onboarded
          </span>
        ) : account.healthScore !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                color: getScoreColor(account.healthLabel),
              }}
            >
              {account.healthScore}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: getScoreColor(account.healthLabel), textTransform: "uppercase" }}>
              {account.healthLabel}
            </span>
          </div>
        ) : <div />}

        {/* Right side tags */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {account.renewalDays < 365 && (
            <span className="plan-pill"
              style={{
                fontSize: 11,
                color: account.renewalDays < 10 ? "#b91c1c" : account.renewalDays < 30 ? "#b45309" : "var(--color-text-secondary)",
                background: account.renewalDays < 10 ? "#fee2e2" : account.renewalDays < 30 ? "#fef3c7" : "var(--color-background-secondary)",
                border: "none", padding: "4px 8px"
              }}
            >
              {account.renewalDays}d renewal
            </span>
          )}
          {account.hasIssues && (
            <span className="plan-pill" style={{ fontSize: 11, background: "#fef3c7", color: "#b45309", border: "none", padding: "4px 8px" }}>
              ⚠ issues
            </span>
          )}
          {account.churned && (
            <span className="plan-pill" style={{ fontSize: 11, background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 8px" }}>
              churned
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
