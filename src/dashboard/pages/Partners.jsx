import React, { useState } from 'react';
import { VERSIUM_ACTIVATED } from '../../data/versiumActivation';
import { RAW_ONBOARD_ACCOUNTS, VERSIUM_ACCOUNTS } from '../../data/mockAccounts';

const PAGE_SIZE = 20;

const isActive = (s) => ['Active', 'Renewed', 'Trial'].includes(s);

const dash = (v) => (v === undefined || v === null || v === '' ? '—' : v);

const PARTNERS = [
  {
    key: 'versium',
    label: 'Versium',
    sub: 'Data partner channel',
    color: '#0891B2',
    accounts: VERSIUM_ACCOUNTS,
    getStatus: (a) => a.MSAccountStatus,
    getPlan: (a) => a.SubscribtionPlan,
    columns: [
      { h: 'ClientName', get: (a) => a.ClientName, bold: true },
      { h: 'Email', get: (a) => a.Email, muted: true },
      { h: 'AccountCreatedDate', get: (a) => a.AccountCreatedDate },
      { h: 'AccountExpiryDate', get: (a) => a.AccountExpiryDate },
      { h: 'SubscribtionPlan', get: (a) => a.SubscribtionPlan },
      { h: 'Partner', get: (a) => a.Partner },
      { h: 'MS Account Status', get: (a) => a.MSAccountStatus, badge: true },
    ],
  },
  {
    key: 'bpr',
    label: 'BPR',
    sub: 'Indonesia accounts',
    color: '#0284C7',
    accounts: RAW_ONBOARD_ACCOUNTS.filter(
      (a) => a.category === 'indonesia' && !/resort/i.test(a.ClientName)
    ),
    getStatus: (a) => a.RenewalStatus,
    getPlan: (a) => a.SubscribtionType,
    columns: [
      { h: 'Client Name', get: (a) => a.ClientName, bold: true },
      { h: 'Email', get: (a) => a.Email, muted: true },
      { h: 'Plan', get: (a) => a.SubscribtionType },
      { h: 'Price', get: (a) => a.Price },
      { h: 'Created', get: (a) => a.CreatedDt },
      { h: 'Renewal Due', get: (a) => a.RenewalDue },
      { h: 'Country', get: (a) => a.country },
      { h: 'Status', get: (a) => a.RenewalStatus, badge: true },
    ],
  },
  {
    key: 'vanguard',
    label: 'Vanguard',
    sub: 'Resort accounts',
    color: '#F59E0B',
    accounts: RAW_ONBOARD_ACCOUNTS.filter(
      (a) => a.category === 'indonesia' && /resort/i.test(a.ClientName)
    ),
    getStatus: (a) => a.RenewalStatus,
    getPlan: (a) => a.SubscribtionType,
    columns: [
      { h: 'Client Name', get: (a) => a.ClientName, bold: true },
      { h: 'Email', get: (a) => a.Email, muted: true },
      { h: 'Plan', get: (a) => a.SubscribtionType },
      { h: 'Price', get: (a) => a.Price },
      { h: 'Created', get: (a) => a.CreatedDt },
      { h: 'Renewal Due', get: (a) => a.RenewalDue },
      { h: 'Country', get: (a) => a.country },
      { h: 'Status', get: (a) => a.RenewalStatus, badge: true },
    ],
  },

  {
    key: 'redington',
    label: 'Redington',
    sub: 'Redington accounts',
    color: '#7C3AED',
    accounts: RAW_ONBOARD_ACCOUNTS.filter((a) => a.category === 'redington'),
    getStatus: (a) => a.RenewalStatus,
    getPlan: (a) => a.SubscribtionType,
    columns: [
      { h: 'Client Name', get: (a) => a.ClientName, bold: true },
      { h: 'Email', get: (a) => a.Email, muted: true },
      { h: 'Plan', get: (a) => a.SubscribtionType },
      { h: 'Created', get: (a) => a.CreatedDt },
      { h: 'Renewal Due', get: (a) => a.RenewalDue },
      { h: 'Country', get: (a) => a.country },
      { h: 'Status', get: (a) => a.RenewalStatus, badge: true },
    ],
  },
];

const Partners = () => {
  const [selKey, setSelKey] = useState('versium');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const partner = PARTNERS.find((p) => p.key === selKey);
  const list = partner.accounts;
  const activeCount = list.filter((a) => isActive(partner.getStatus(a))).length;
  const inactiveCount = list.length - activeCount;
  const vActivated = VERSIUM_ACTIVATED.length;
  const vExpired = VERSIUM_ACTIVATED.filter((a) => a.status === 'Expired').length;
  const vLive = VERSIUM_ACTIVATED.filter((a) => a.status === 'Active').length;
  const vNotActivated = list.length - vActivated;
  const vRate = list.length > 0 ? ((vActivated / list.length) * 100).toFixed(1) : 0;
  const planCounts = {};
  list.forEach((a) => {
    const p = partner.getPlan(a) || 'Unknown';
    planCounts[p] = (planCounts[p] || 0) + 1;
  });
  const plans = Object.entries(planCounts).sort((x, y) => y[1] - x[1]);

  const q = search.toLowerCase().trim();
  const filtered = list.filter(
    (a) =>
      !q ||
      String(a.ClientName || '').toLowerCase().includes(q) ||
      String(a.Email || '').toLowerCase().includes(q)
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const selectPartner = (key) => {
    setSelKey(key);
    setSearch('');
    setPage(0);
  };

  const gridCols = `repeat(${partner.columns.length}, minmax(0, 1fr))`;

  return (
    <div className="content">
      <div className="section-label">Partner Overview</div>

      {/* Partner cards */}
      <div
        className="kpi-row"
        style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '12px' }}
      >
        <div className="kpi-card">
          <div className="kpi-label">Total Partners</div>
          <div className="kpi-value">{PARTNERS.length}</div>
          <div className="kpi-delta">Versium · BPR · Vanguard · Redington</div>
        </div>
        {PARTNERS.map((p) => {
          const selected = p.key === selKey;
          return (
            <div
              className="kpi-card"
              key={p.key}
              onClick={() => selectPartner(p.key)}
              style={{
                cursor: 'pointer',
                border: selected ? `2px solid ${p.color}` : undefined,
                boxShadow: selected ? `0 6px 16px ${p.color}33` : undefined,
              }}
            >
              <div className="kpi-label">{p.label}</div>
              <div className="kpi-value">{p.accounts.length}</div>
              <div className="kpi-delta">{p.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Selected partner summary */}
      {selKey === 'versium' ? (
        <div
          className="kpi-row"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '12px' }}
        >
          {[
            { label: 'All Accounts', value: list.length, sub: 'Total Versium accounts', color: 'var(--color-text-primary)' },
            { label: 'Activated License', value: vActivated, sub: 'Accounts with license activated', color: '#0891B2' },
            { label: 'Expired', value: vExpired, sub: `Out of ${vActivated} activated accounts`, color: '#dc2626' },
            { label: 'Inactive / Not Activated', value: vNotActivated, sub: 'Accounts yet to be activated', color: 'var(--color-text-primary)' },
            { label: 'Activation Rate', value: `${vRate}%`, sub: 'Activated share of all accounts', color: 'var(--color-text-primary)' },
            { label: 'Live Accounts Today', value: vLive, sub: 'Activated with active license', color: '#059669' },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid var(--color-border-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {c.label}
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, lineHeight: 1, color: c.color }}>
                {c.value}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{c.sub}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-label">{partner.label} Accounts</div>
            <div className="kpi-value">{list.length}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Active</div>
            <div className="kpi-value" style={{ color: '#059669' }}>{activeCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Expired / Inactive</div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{inactiveCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Active Rate</div>
            <div className="kpi-value">
              {list.length > 0 ? Math.round((activeCount / list.length) * 100) : 0}%
            </div>
          </div>
        </div>
      )}
      {/* Plan distribution */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">{partner.label} — Plan Distribution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {plans.map(([name, count]) => {
            const pct = list.length > 0 ? Math.round((count / list.length) * 100) : 0;
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 120, fontSize: 11, textAlign: 'right', flexShrink: 0 }}>{name}</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: partner.color }} />
                </div>
                <div style={{ width: 36, fontSize: 11, fontWeight: 600, textAlign: 'right' }}>{count}</div>
                <div style={{ width: 36, fontSize: 10, color: 'var(--color-text-tertiary)' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accounts table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div className="card-title" style={{ margin: 0 }}>
            {partner.label} Accounts
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
              {filtered.length} of {list.length}
            </span>
          </div>
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{ padding: '5px 10px', border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, fontSize: 12, outline: 'none', width: 220 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 900 }}>
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 6, fontSize: 10, color: 'var(--color-text-tertiary)', paddingBottom: 6, borderBottom: '0.5px solid var(--color-border-secondary)', marginBottom: 4 }}>
              {partner.columns.map((c) => <span key={c.h}>{c.h}</span>)}
            </div>

            {paged.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                No accounts found.
              </div>
            ) : (
              paged.map((a, i) => (
                <div
                  key={i}
                  style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 6, padding: '7px 0', borderBottom: '0.5px solid var(--color-border-tertiary)', alignItems: 'center' }}
                >
                  {partner.columns.map((c) => {
                    const value = dash(c.get(a));
                    if (c.badge) {
                      const good = isActive(value);
                      return (
                        <div key={c.h}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: good ? '#f0fdf4' : '#fef2f2', color: good ? '#15803d' : '#b91c1c', border: `1px solid ${good ? '#bbf7d0' : '#fecaca'}` }}>
                            {value}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={c.h}
                        style={{ fontSize: c.bold ? 12 : 11, fontWeight: c.bold ? 600 : 400, color: c.muted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '0.5px solid var(--color-border-secondary)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              Page {page + 1} of {totalPages} · {filtered.length} accounts
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', background: 'none', opacity: page === 0 ? 0.4 : 1 }}
              >← Prev</button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', background: 'none', opacity: page >= totalPages - 1 ? 0.4 : 1 }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;