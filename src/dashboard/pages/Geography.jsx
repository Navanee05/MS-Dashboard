import React, { useState, useEffect, useMemo } from 'react';
import { getGeographyData } from '../../api/dashboardApi';
import {
  IconLoader2,
  IconSearch,
  IconSparkles
} from '@tabler/icons-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { CountryFlag, FlagIndia, FlagUSA, FlagSEA } from '../../components/common/FlagIcon';

const getRegionFlagComponent = (name, size = 26) => {
  const n = String(name || '').toLowerCase();
  if (n.includes('india') || n === 'in') return <FlagIndia size={size} />;
  if (n.includes('usa') || n === 'us' || n.includes('united states')) return <FlagUSA size={size} />;
  return <FlagSEA size={size} />;
};

const getRegionName = (country) => {
  const c = String(country || '').toLowerCase().trim();
  if (c === 'in' || c === 'ind' || c.includes('india')) return 'India';
  if (c === 'us' || c === 'usa' || c.includes('united states')) return 'USA';
  if (c === 'sg' || c.includes('singapore')) return 'Singapore';
  if (c === 'my' || c.includes('malaysia')) return 'Malaysia';
  if (c === 'id' || c.includes('indonesia')) return 'Indonesia';
  if (c === 'ph' || c.includes('philippines')) return 'Philippines';
  if (c === 'vn' || c.includes('vietnam')) return 'Vietnam';
  if (c.includes('sea')) return 'Southeast Asia';
  return country || 'India';
};

const Geography = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    (async () => {
      try {
        const geoData = await getGeographyData();
        setData(geoData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter accounts list
  const filteredAccounts = useMemo(() => {
    if (!data?.rawAccounts) return [];
    return data.rawAccounts.filter((acc) => {
      const countryStr = String(acc.country || '').toLowerCase().trim();
      const planStr = String(acc.plan || '').toLowerCase().trim();
      const isTier5 = planStr.includes('tier 5') || planStr.includes('tier5') || planStr.includes('plan tier 5') || planStr === 'tier 5' || planStr === '5';
      let matchRegion = true;
      if (selectedRegion === 'india' || selectedRegion === 'in') {
        matchRegion = (countryStr.includes('india') || countryStr === 'in' || !acc.country) && !isTier5;
      } else if (selectedRegion === 'usa' || selectedRegion === 'us') {
        matchRegion = (countryStr.includes('usa') || countryStr.includes('united states') || countryStr === 'us' || acc.source === 'Versium Partner') && !isTier5;
      } else if (selectedRegion === 'sea') {
        matchRegion = isTier5 || ['singapore', 'malaysia', 'indonesia', 'vietnam', 'philippines', 'sea', 'sg', 'my', 'id', 'ph', 'vn', 'th'].some((c) =>
          countryStr.includes(c)
        );
      }

      const matchSearch =
        searchQuery === '' ||
        String(acc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(acc.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(acc.plan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(acc.source || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchRegion && matchSearch;
    });
  }, [data, selectedRegion, searchQuery]);

  const totalPages = Math.ceil(filteredAccounts.length / pageSize) || 1;
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

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
      {/* ── Page Header ── */}
      <div>
        <div className="section-label">Geography Overview</div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Regional customer distribution and deployment metrics across territories
        </p>
      </div>

      {/* ── 3 Regional KPI Cards: India, USA, SEA ── */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {data.kpis.map((kpi, idx) => {
          const isFilterActive = selectedRegion === kpi.label.toLowerCase();
          return (
            <div
              className="kpi-card"
              key={idx}
              onClick={() => {
                const target = kpi.label.toLowerCase();
                setSelectedRegion(selectedRegion === target ? 'all' : target);
                setCurrentPage(1);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                borderColor: isFilterActive ? 'var(--color-brand-primary)' : undefined,
                boxShadow: isFilterActive ? '0 8px 24px rgba(255,19,0,0.12)' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="kpi-label" style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {kpi.label}
                </div>
                <div
                  style={{
                    width: '42px',
                    height: '38px',
                    borderRadius: '10px',
                    background: kpi.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getRegionFlagComponent(kpi.label, 26)}
                </div>
              </div>
              <div className="kpi-value" style={{ fontFamily: 'var(--font-display)' }}>{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Grid ── */}
      <div className="two-col">
        {/* Territory Share Donut */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title" style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
              Regional Customer Distribution
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
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend with Real Flags */}
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.regionDistribution.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--color-background-app)',
                    border: '1px solid var(--color-border-primary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {getRegionFlagComponent(r.name, 18)}
                      <span>{r.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {r.share}%
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {r.value.toLocaleString()} active accounts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Trends Multi-Area Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title" style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
              Growth Trajectory by Region
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-success)', fontWeight: 600 }}>
              <IconSparkles size={14} />
              <span>H1 Trajectory</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.monthlyGrowth} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gIndia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1300" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF1300" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUsa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FD6533" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FD6533" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8C2800" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8C2800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border-primary)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px'
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="India" stroke="#FF1300" strokeWidth={2.5} fill="url(#gIndia)" dot={false} />
              <Area type="monotone" dataKey="USA" stroke="#FD6533" strokeWidth={2.5} fill="url(#gUsa)" dot={false} />
              <Area type="monotone" dataKey="SEA" stroke="#8C2800" strokeWidth={2.5} fill="url(#gSea)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filterable Accounts Directory ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div className="card-title" style={{ margin: 0, fontFamily: 'var(--font-display)' }}>
              Regional Accounts Directory
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Showing {filteredAccounts.length} customer accounts {selectedRegion !== 'all' ? `filtered by ${selectedRegion.toUpperCase()}` : 'across all territories'}
              {selectedRegion !== 'all' && (
                <button
                  onClick={() => setSelectedRegion('all')}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <IconSearch
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search account, email, or plan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-primary)',
                  background: 'var(--color-background-app)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Account</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Region / Country</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Plan Tier</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Campaigns</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Lists Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    No accounts found matching the current filters.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account, idx) => {
                  const regionName = getRegionName(account.country);

                  return (
                    <tr
                      key={account.id || idx}
                      style={{
                        borderBottom: '1px solid var(--color-border-primary)',
                        transition: 'background 0.2s ease',
                        fontSize: '13px'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-background-app)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{account.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{account.email || '—'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          <CountryFlag country={account.country} size={22} />
                          <span>{regionName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: 'rgba(255,19,0,0.08)',
                            color: 'var(--color-brand-primary)',
                            border: '1px solid rgba(255,19,0,0.2)'
                          }}
                        >
                          {account.plan || 'Essential'}
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
                            background: account.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                            color: account.status === 'Active' ? '#10b981' : '#f59e0b',
                            border: `1px solid ${account.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                          {account.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {account.campaigns || 0}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {account.listsUploaded || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
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
