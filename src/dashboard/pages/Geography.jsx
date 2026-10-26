import React, { useState, useEffect, useMemo } from 'react';
import { getGeographyData } from '../../api/dashboardApi';
import { IconLoader2, IconSearch } from '@tabler/icons-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
  fontFamily: 'var(--font-sans)',
  fontSize: '12px'
};

const thStyle = {
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.6px'
};

const FLAG_CODES = {
  USA: 'us',
  India: 'in',
  Indonesia: 'id',
  Malaysia: 'my',
  Thailand: 'th',
  UAE: 'ae',
};

const Flag = ({ country, size = 24 }) => {
  const code = FLAG_CODES[country];
  if (!code) {
    return (
      <span
        style={{ width: size, height: size * 0.7, borderRadius: 3, background: '#94A3B8', display: 'inline-block', flexShrink: 0 }}
      />
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={country}
      style={{
        width: size,
        height: size * 0.7,
        objectFit: 'cover',
        borderRadius: 3,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    />
  );
};

const Geography = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      try {
        setData(await getGeographyData());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!data?.rawAccounts) return [];
    const q = searchQuery.toLowerCase().trim();
    return data.rawAccounts.filter((acc) => {
      const matchRegion = selectedRegion === 'all' || acc.country === selectedRegion;
      const matchSearch =
        !q ||
        String(acc.name || '').toLowerCase().includes(q) ||
        String(acc.email || '').toLowerCase().includes(q) ||
        String(acc.id || '').toLowerCase().includes(q) ||
        String(acc.plan || '').toLowerCase().includes(q) ||
        String(acc.country || '').toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [data, selectedRegion, searchQuery]);

  const totalPages = Math.ceil(filteredAccounts.length / pageSize) || 1;
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage]);

  if (loading || !data) {
    return (
      <div className="content loading-skeleton">
        <IconLoader2 size={40} className="spin-icon" />
        <p>Loading Geography Data...</p>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Page Header */}
      <div>
        <div className="section-label">Geography Overview</div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Country-wise customer distribution across territories
        </p>
      </div>

      {/* Country KPI cards */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {data.kpis.map((kpi) => {
          const isActive = selectedRegion === kpi.label;
          return (
            <div
              className="kpi-card"
              key={kpi.label}
              onClick={() => {
                setSelectedRegion(isActive ? 'all' : kpi.label);
                setCurrentPage(1);
              }}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                border: isActive ? `2px solid ${kpi.color}` : undefined,
                boxShadow: isActive ? `0 8px 24px ${kpi.color}33` : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="kpi-label" style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {kpi.label}
                </div>
                <Flag country={kpi.label} size={28} />
              </div>
              <div className="kpi-value" style={{ fontFamily: 'var(--font-display)' }}>{kpi.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {data.totalAccounts > 0 ? Math.round((parseInt(String(kpi.value).replace(/,/g, ''), 10) / data.totalAccounts) * 100) : 0}% of accounts
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div>
        {/* Donut */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title" style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
              Country Share
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {data.totalAccounts} Total Accounts
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '55%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.regionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.regionDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Accounts (${Math.round((val / data.totalAccounts) * 100)}%)`, name]}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.regionDistribution.map((r) => (
                <div
                  key={r.name}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--color-background-app)',
                    border: '1px solid var(--color-border-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                    <Flag country={r.name} size={22} />
                    <span>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>
                    {r.value} · {r.share}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Accounts Directory */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div className="card-title" style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
              Country Accounts Directory
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Showing {filteredAccounts.length} accounts {selectedRegion !== 'all' ? `in ${selectedRegion}` : 'across all countries'}
              {selectedRegion !== 'all' && (
                <button
                  onClick={() => { setSelectedRegion('all'); setCurrentPage(1); }}
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-primary)',
                    background: 'var(--color-background-app)',
                    color: 'var(--color-brand-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <IconSearch
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search name, ID, email, or plan..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-primary)',
                background: 'var(--color-background-app)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                <th style={thStyle}>Account</th>
                <th style={thStyle}>Client ID</th>
                <th style={thStyle}>Country</th>
                <th style={thStyle}>Plan</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Campaigns</th>
                <th style={thStyle}>Lists Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    No accounts found matching the current filters.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account, idx) => (
                  <tr
                    key={account.id || idx}
                    style={{ borderBottom: '1px solid var(--color-border-primary)', fontSize: '13px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-background-app)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {account.name}
                        {account.isVersium && (
                          <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', background: 'rgba(8,145,178,0.1)', color: '#0891B2' }}>
                            Versium
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{account.email || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {account.isVersium ? '—' : account.id}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <Flag country={account.country} size={22} />
                        {account.country}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          background: 'rgba(255,19,0,0.08)',
                          color: 'var(--color-brand-primary)',
                          border: '1px solid rgba(255,19,0,0.2)'
                        }}
                      >
                        {account.plan || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: account.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(220,38,38,0.1)',
                          color: account.status === 'Active' ? '#10b981' : '#dc2626',
                          border: `1px solid ${account.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {account.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {account.isVersium ? '—' : account.campaigns || 0}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {account.isVersium ? '—' : account.listsUploaded || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--color-border-primary)' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Page {currentPage} of {totalPages} ({filteredAccounts.length} accounts)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-primary)',
                  background: 'var(--color-background-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-primary)',
                  background: 'var(--color-background-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Geography;