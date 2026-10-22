import React, { useEffect, useState } from 'react';
import {
  fetchVersiumAccounts,
  fetchVersiumAccountById,
  fetchVersiumPartnerKpis,
} from '../../api/partnerService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const planColor = (plan) => {
  const p = (plan || '').toLowerCase();
  if (p.includes('ultimate')) return { bg: '#fff1f0', color: '#FF1300', border: '#ffccc7' };
  if (p.includes('premier plus')) return { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
  if (p.includes('premier')) return { bg: '#fff7e6', color: '#d97706', border: '#fde68a' };
  if (p.includes('essential')) return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' };
  if (p.includes('free') || p.includes('trail') || p.includes('trial')) return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' };
  return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
};

const formatDate = (raw) => {
  if (!raw) return '—';
  const delimiter = raw.includes('/') ? '/' : raw.includes('-') ? '-' : null;
  if (delimiter) {
    const parts = raw.split(delimiter);
    if (parts.length === 3) {
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10);
      const mName = months[mIdx] || parts[1];
      return `${parts[0]} ${mName} ${parts[2]}`;
    }
  }
  return raw;
};

const Badge = ({ label, style }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.4px',
    ...style,
  }}>
    {label}
  </span>
);

const StatBox = ({ label, value, sub, color }) => (
  <div style={{
    background: '#fff',
    border: '0.5px solid var(--color-border-secondary)',
    borderRadius: 10,
    padding: '10px 14px',
    minWidth: 90,
    flex: 1,
  }}>
    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--color-text-primary)', lineHeight: 1.2 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const ProgressBar = ({ pct, color }) => (
  <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, width: '100%', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color || '#FF1300', borderRadius: 4, transition: 'width 0.5s ease' }} />
  </div>
);

// ── Account Detail Drawer ─────────────────────────────────────────────────────
const AccountDrawer = ({ accountId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    fetchVersiumAccountById(accountId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountId]);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
      background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      zIndex: 1000, display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '0.5px solid var(--color-border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            {loading ? 'Loading…' : data?.name || '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {loading ? '' : data?.email}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--color-text-tertiary)', padding: '0 4px' }}>✕</button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
          Fetching account details…
        </div>
      ) : data ? (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Plan + Status badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge label={data.plan} style={{ ...planColor(data.plan), border: `1px solid ${planColor(data.plan).border}` }} />
            <Badge label={data.isActive ? 'Active' : 'Inactive'} style={{ bg: data.isActive ? '#f0fdf4' : '#fef2f2', color: data.isActive ? '#059669' : '#dc2626', background: data.isActive ? '#f0fdf4' : '#fef2f2', border: `1px solid ${data.isActive ? '#bbf7d0' : '#fecaca'}` }} />
            {data.hasUnpaid && <Badge label="Has Unpaid Jobs" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }} />}
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Onboarded</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDate(data.createdDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Last Login</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{data.lastLogin || '—'}</div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>CAMPAIGN STATS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatBox label="Campaigns" value={data.campaignCount} />
              <StatBox label="Lists" value={data.listsUploaded} />
              <StatBox label="Templates" value={data.templatesCreated} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>EMAIL PERFORMANCE</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatBox label="Sent" value={data.totalSent?.toLocaleString() ?? '0'} />
              <StatBox label="Delivered" value={data.totalDelivered?.toLocaleString() ?? '0'} />
              <StatBox label="Delivery Rate" value={`${data.deliveryRate ?? 0}%`} color={(data.deliveryRate ?? 0) >= 90 ? '#059669' : (data.deliveryRate ?? 0) >= 70 ? '#d97706' : '#dc2626'} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <StatBox label="Opened" value={data.totalOpened?.toLocaleString() ?? '0'} />
              <StatBox label="Clicked" value={data.totalClicked?.toLocaleString() ?? '0'} />
            </div>
          </div>

          {/* Campaign list */}
          {(data.campaigns ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>CAMPAIGNS ({(data.campaigns ?? []).length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.campaigns.map(c => (
                  <div key={c.id} style={{ background: '#f8fafc', border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</div>
                      <Badge label={c.type} style={{ background: '#fff1f0', color: '#FF1300', border: '1px solid #ffccc7' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                      <span>Sent: <strong style={{ color: 'var(--color-text-primary)' }}>{c.sent?.toLocaleString() ?? '0'}</strong></span>
                      <span>Del: <strong style={{ color: 'var(--color-text-primary)' }}>{c.delivered?.toLocaleString() ?? '0'}</strong></span>
                      <span>Open: <strong style={{ color: 'var(--color-text-primary)' }}>{c.opened?.toLocaleString() ?? '0'}</strong></span>
                      <span>Click: <strong style={{ color: 'var(--color-text-primary)' }}>{c.clicked?.toLocaleString() ?? '0'}</strong></span>
                    </div>
                    <ProgressBar pct={c.deliveryRate ?? 0} color={(c.deliveryRate ?? 0) >= 90 ? '#10b981' : '#f59e0b'} />
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 3 }}>{c.deliveryRate ?? 0}% delivery · {c.openRate ?? 0}% open rate</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', color: '#dc2626', fontSize: 13 }}>Failed to load account details.</div>
      )}
    </div>
  );
};

// ── Main Partners Page ────────────────────────────────────────────────────────
const Partners = () => {
  const [kpis, setKpis] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    Promise.all([fetchVersiumPartnerKpis(), fetchVersiumAccounts()])
      .then(([k, a]) => { setKpis(k); setAccounts(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const plans = ['All', ...Array.from(new Set(accounts.map(a => a.plan))).sort()];

  const filtered = accounts.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        a.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'All' || a.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="content">
      <div className="section-label">Partner Overview</div>

      {/* KPI cards */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Total Partners</div>
          <div className="kpi-value">2</div>
          <div className="kpi-delta">Versium · INEED</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Versium Accounts</div>
          <div className="kpi-value">{loading ? '…' : (kpis?.total ?? '—').toLocaleString()}</div>
          <div className="kpi-delta">{loading ? '' : `${kpis?.active ?? 0} active`}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Rate</div>
          <div className="kpi-value">
            {loading || !kpis ? '…' : `${kpis.total > 0 ? Math.round((kpis.active / kpis.total) * 100) : 0}%`}
          </div>
          <div className="kpi-delta delta-up">Versium partner</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Inactive Accounts</div>
          <div className="kpi-value" style={{ color: kpis?.inactive > 0 ? '#dc2626' : 'inherit' }}>
            {loading ? '…' : (kpis?.inactive ?? '—')}
          </div>
          <div className="kpi-delta">of {kpis?.total ?? '—'} total</div>
        </div>
      </div>

      {/* Plan distribution */}
      {!loading && kpis?.planBreakdown && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Versium — License Plan Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {kpis.planBreakdown.map(p => {
              const c = planColor(p.name);
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'right', flexShrink: 0 }}>{p.name}</div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar pct={p.pct} color={c.color} />
                  </div>
                  <div style={{ width: 36, fontSize: 11, fontWeight: 600, color: c.color, flexShrink: 0, textAlign: 'right' }}>{p.count}</div>
                  <div style={{ width: 32, fontSize: 10, color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{p.pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accounts table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div className="card-title" style={{ margin: 0 }}>
            Versium Accounts
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
              {loading ? 'loading…' : `${filtered.length} of ${accounts.length}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              style={{
                padding: '5px 10px', border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 6, fontSize: 12, outline: 'none', width: 200,
                background: 'var(--color-bg-secondary)',
              }}
            />
            <select
              value={planFilter}
              onChange={e => { setPlanFilter(e.target.value); setPage(0); }}
              style={{
                padding: '5px 10px', border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 6, fontSize: 12, outline: 'none',
                background: 'var(--color-bg-secondary)',
              }}
            >
              {plans.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 110px 110px', gap: 6, fontSize: 10, color: 'var(--color-text-tertiary)', paddingBottom: 6, borderBottom: '0.5px solid var(--color-border-secondary)', marginBottom: 4 }}>
          <span>Account Name</span>
          <span>Email</span>
          <span style={{ textAlign: 'center' }}>Plan</span>
          <span style={{ textAlign: 'right' }}>Onboarded</span>
          <span style={{ textAlign: 'right' }}>Last Login</span>
        </div>

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            Loading Versium accounts…
          </div>
        ) : paged.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>No accounts found.</div>
        ) : (
          paged.map(a => {
            const c = planColor(a.plan);
            return (
              <div
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 90px 110px 110px',
                  gap: 6,
                  padding: '7px 0',
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.name || '—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.email || '—'}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Badge label={a.plan} style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'right' }}>{formatDate(a.createdDate)}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.lastLogin ? a.lastLogin.replace(/\s+/g, ' ').substring(0, 20) + '…' : '—'}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '0.5px solid var(--color-border-secondary)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              Page {page + 1} of {totalPages} · {filtered.length} accounts
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', background: 'none', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
              >← Prev</button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', background: 'none', cursor: page >= totalPages - 1 ? 'default' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Account detail drawer */}
      {selectedId && (
        <>
          <div
            onClick={() => setSelectedId(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
          />
          <AccountDrawer accountId={selectedId} onClose={() => setSelectedId(null)} />
        </>
      )}
    </div>
  );
};

export default Partners;
