import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getOverviewData } from '../../api/dashboardApi';
import { computeHealth } from '../../api/accountService';
import { RAW_ONBOARD_ACCOUNTS, RAW_VERSIUM_ACCOUNTS } from '../../data/mockAccounts';
import {
  IconLoader2,
  IconUsers,
  IconCreditCard,
  IconUserX,
  IconClock,
  IconMapPin,
  IconBriefcase,
  IconArrowUp,
  IconArrowDown,
  IconSearch,
  IconCheck,
  IconX,
  IconChevronRight,
  IconChevronLeft,
  IconMail,
  IconDatabase
} from '@tabler/icons-react';

const iconMap = {
  users: IconUsers,
  'credit-card': IconCreditCard,
  'user-x': IconUserX,
  clock: IconClock,
  'map-pin': IconMapPin,
  briefcase: IconBriefcase,
  database: IconDatabase,
};

const planStyles = {
  'Essentials': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Essential': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Premier': { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  'Premier Plus': { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' },
  'Premier(Free Trial)': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Premier(Free Trail)': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Free Trail': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Free Trial': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
};

const statusStyles = {
  'Renewed': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Active': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Not Renewed': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'Expired': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'Trial': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Onhold': { bg: '#fefce8', color: '#a16207', border: '#fef08a' }
};

// Rows shown per page in the roster
const PAGE_SIZE = 25;

// Builds the list of page buttons, e.g. [1, '…', 4, 5, 6, '…', 20]
const getPageItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('…');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push('…');
  items.push(total);
  return items;
};

// ── Versium accounts reshaped so they can sit in the same roster table as direct accounts ──
const VERSIUM_ROSTER = (RAW_VERSIUM_ACCOUNTS || []).map((a, i) => ({
  _key: `versium-${a.sNo ?? i + 1}`,
  isVersium: true,
  ClientID: '—',
  ClientName: a.ClientName,
  Email: a.Email,
  SubscribtionType: a.SubscribtionPlan,
  Price: '',
  country: 'USA',
  RenewalStatus: a.MSAccountStatus,
  CreatedDt: a.AccountCreatedDate,
  RenewalDue: a.AccountExpiryDate,
  Partner: a.Partner
}));

const ALL_ACCOUNTS = [...RAW_ONBOARD_ACCOUNTS, ...VERSIUM_ROSTER];

const countCategory = (c) => RAW_ONBOARD_ACCOUNTS.filter((a) => a.category === c).length;

// Versium accounts whose status is Expired are treated as churned (all Versium accounts are USA)
const VERSIUM_EXPIRED = VERSIUM_ROSTER.filter((a) => a.RenewalStatus === 'Expired');

// Indonesia accounts that are paying clients (counted under Active Paying as well)
const PAYING_INDONESIA_IDS = ['10232', '10330'];
const PAYING_INDONESIA = RAW_ONBOARD_ACCOUNTS.filter((a) => PAYING_INDONESIA_IDS.includes(String(a.ClientID)));
const PAYING_INDIA = RAW_ONBOARD_ACCOUNTS.filter(
  (a) => a.category === 'paying' && !PAYING_INDONESIA_IDS.includes(String(a.ClientID))
);

// Every number on this page is counted from the data files - nothing is typed by hand.
const COUNTS = {
  direct: RAW_ONBOARD_ACCOUNTS.length,
  versium: VERSIUM_ROSTER.length,
  total: ALL_ACCOUNTS.length,
  payingIndia: PAYING_INDIA.length,
  payingIndonesia: PAYING_INDONESIA.length,
  paying: PAYING_INDIA.length + PAYING_INDONESIA.length,
  churnedIndia: countCategory('churned'),
  churnedUSA: VERSIUM_EXPIRED.length,
  churned: countCategory('churned') + VERSIUM_EXPIRED.length,
  trial: countCategory('trial'),
  indonesia: countCategory('indonesia'),
  redington: countCategory('redington'),
};

// Shown when hovering a KPI card
const VERSIUM_ACTIVE_COUNT = VERSIUM_ROSTER.filter((a) => a.RenewalStatus === 'Active').length;

const BREAKDOWNS = {
  total: [
    { label: 'Direct', value: COUNTS.direct, color: '#FF1300' },
    { label: 'Versium', value: COUNTS.versium, color: '#0891B2' },
  ],
  versium: [
    { label: 'Active', value: VERSIUM_ACTIVE_COUNT, color: '#10B981' },
    { label: 'Expired', value: VERSIUM_EXPIRED.length, color: '#DC2626' },
  ],
  paying: [
    { label: 'India', value: COUNTS.payingIndia, color: '#FF1300' },
    { label: 'Indonesia', value: COUNTS.payingIndonesia, color: '#0284C7' },
  ],
  churned: [
    { label: 'India', value: COUNTS.churnedIndia, color: '#FF1300' },
    { label: 'USA', value: COUNTS.churnedUSA, color: '#0891B2' },
  ],
};

const SEGMENT_DESCRIPTIONS = {
  total: `${COUNTS.total} Accounts Across the Ecosystem`,
  churned: `${COUNTS.churned} churned or expired accounts (India ${COUNTS.churnedIndia} + USA ${COUNTS.churnedUSA}) requiring re-engagement or lifecycle intervention`,
  paying: `${COUNTS.paying} high-value active recurring paying client accounts (India ${COUNTS.payingIndia} + Indonesia ${COUNTS.payingIndonesia})`,
  trial: `${COUNTS.trial} active free trial accounts currently evaluating premier capabilities`,
  indonesia: `${COUNTS.indonesia} key enterprise partner accounts deployed across the Indonesian territory`,
  redington: `${COUNTS.redington} strategic Redington distribution partner accounts`,
  versium: `${COUNTS.versium} Versium channel accounts, with status as reported by Versium`,
};

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('total'); // 'total' | 'paying' | 'churned' | 'trial' | 'indonesia' | 'redington' | 'versium'
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerAccount, setDrawerAccount] = useState(null);
  const [page, setPage] = useState(1);
  const [hoverInfo, setHoverInfo] = useState(null); // { key, left, top } for the KPI hover breakdown
  const rosterRef = useRef(null);

  const handleSelectKey = (key) => {
    setSelectedKey(key);
    setTimeout(() => {
      rosterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 40);
  };

  useEffect(() => {
    (async () => {
      try {
        setData(await getOverviewData());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Back to page 1 whenever the segment or the search changes
  useEffect(() => {
    setPage(1);
  }, [selectedKey, searchQuery]);

  // KPI cards: labels/colours come from dashboardApi, numbers are counted from the data files
  const kpis = useMemo(() => {
    if (!data?.kpis) return [];
    return data.kpis.map((k) => ({
      ...k,
      value: COUNTS[k.key] !== undefined ? String(COUNTS[k.key]) : k.value,
      delta: k.key === 'total' ? 'Accounts Across the Ecosystem' : k.delta
    }));
  }, [data]);

  // Compute accounts list based on selected KPI card
  const filteredAccounts = useMemo(() => {
    let source;
    if (selectedKey === 'versium') {
      source = RAW_VERSIUM_ACCOUNTS || [];
    } else if (selectedKey === 'churned') {
      source = [
        ...RAW_ONBOARD_ACCOUNTS.filter((acc) => acc.category === 'churned'),
        ...VERSIUM_EXPIRED
      ];
    } else if (selectedKey === 'paying') {
      source = [...PAYING_INDIA, ...PAYING_INDONESIA];
    } else if (['trial', 'indonesia', 'redington'].includes(selectedKey)) {
      source = RAW_ONBOARD_ACCOUNTS.filter((acc) => acc.category === selectedKey);
    } else {
      source = ALL_ACCOUNTS;
    }
    const list = source.map((acc, index) => ({ ...acc, displaySNo: index + 1 }));

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(acc =>
      String(acc.displaySNo).includes(query) ||
      String(acc.ClientID || '').toLowerCase().includes(query) ||
      String(acc.ClientName || '').toLowerCase().includes(query) ||
      String(acc.Email || '').toLowerCase().includes(query) ||
      String(acc.country || '').toLowerCase().includes(query) ||
      String(acc.SubscribtionType || acc.SubscribtionPlan || '').toLowerCase().includes(query)
    );
  }, [selectedKey, searchQuery]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedAccounts = useMemo(
    () => filteredAccounts.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredAccounts, pageStart]
  );
  const showingFrom = filteredAccounts.length === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(pageStart + PAGE_SIZE, filteredAccounts.length);

  const goToPage = (p) => {
    setPage(Math.max(1, Math.min(totalPages, p)));
    rosterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const versiumActive = (RAW_VERSIUM_ACCOUNTS || []).filter(a => a.MSAccountStatus === 'Active').length;
  const versiumExpired = (RAW_VERSIUM_ACCOUNTS || []).filter(a => a.MSAccountStatus === 'Expired').length;

  // Current active KPI card info
  const activeKpi = useMemo(() => {
    if (!kpis.length) return null;
    return kpis.find(k => k.key === selectedKey) || kpis[0];
  }, [kpis, selectedKey]);

  if (loading || !data) {
    return (
      <div className="content loading-skeleton">
        <IconLoader2 size={40} className="spin-icon" />
        <p>Loading Portfolio...</p>
      </div>
    );
  }

  // Health score for the drawer, worked out from the account's own data (Versium has no usage data)
  const drawerHealth = drawerAccount && !drawerAccount.isVersium ? computeHealth(drawerAccount) : null;

  const pagerBtnStyle = (disabled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border-primary)',
    background: '#ffffff',
    color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'all 0.15s ease'
  });

  return (
    <div
      className="content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '160px'
      }}
    >
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-label">Portfolio Overview</div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Real-time account intelligence, subscription distribution, and regional partner footprint
          </p>
        </div>
      </div>

      {/* ── KPI Cards Grid (Compact & Sleek) ── */}
      <div
        className="kpi-row"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '12px',
          marginTop: '2px'
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = iconMap[kpi.icon] || IconUsers;
          const isSelected = selectedKey === kpi.key;

          return (
            <div
              className={`kpi-card ${isSelected ? 'active-kpi-card' : ''}`}
              key={idx}
              onClick={() => handleSelectKey(kpi.key)}
              onMouseEnter={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHoverInfo({ key: kpi.key, left: r.left, top: r.bottom + 8 });
              }}
              onMouseLeave={() => setHoverInfo(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: isSelected
                  ? `2px solid ${kpi.iconColor}`
                  : '1px solid var(--color-border-primary)',
                boxShadow: isSelected
                  ? `0 6px 16px ${kpi.iconColor}22`
                  : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Top row with Label + Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span
                  className="kpi-label"
                  style={{
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={kpi.label}
                >
                  {kpi.label}
                </span>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: kpi.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={15} color={kpi.iconColor} stroke={2.2} />
                </div>
              </div>

              {/* Value and Active Badge */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div
                  className="kpi-value"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {kpi.value}
                </div>

                {isSelected && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: kpi.iconColor,
                      background: kpi.bg,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <IconCheck size={10} stroke={3} />
                    Selected
                  </span>
                )}
              </div>

              {/* Delta / Subtitle */}
              <div
                className={`kpi-delta ${kpi.trend === 'up' ? 'delta-up' : kpi.trend === 'dn' ? 'delta-dn' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: kpi.trend === 'up' ? '#059669' : kpi.trend === 'dn' ? '#dc2626' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {kpi.trend === 'up' && <IconArrowUp size={11} stroke={2.5} />}
                {kpi.trend === 'dn' && <IconArrowDown size={11} stroke={2.5} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.delta}</span>
                {kpi.key === 'versium' && (
                  <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 600 }}>
                    <span style={{ color: '#059669' }}>Active: {versiumActive}</span>
                    <span style={{ color: '#dc2626' }}>Expired: {versiumExpired}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Interactive Account Intelligence Roster ── */}
      <div
        ref={rosterRef}
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--color-border-primary)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        {/* Panel Header & Controls */}
        <div
          style={{
            padding: '22px 26px',
            borderBottom: '1px solid var(--color-border-primary)',
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  {activeKpi ? activeKpi.label : 'Account Intelligence'}
                </h2>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: activeKpi ? activeKpi.bg : 'rgba(0,0,0,0.06)',
                    color: activeKpi ? activeKpi.iconColor : 'var(--color-text-primary)',
                    border: `1px solid ${activeKpi ? activeKpi.iconColor : 'transparent'}22`
                  }}
                >
                  {filteredAccounts.length} {filteredAccounts.length === 1 ? 'Account' : 'Accounts'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                {SEGMENT_DESCRIPTIONS[selectedKey]}
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <IconSearch
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search S.No, ID, or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: '2px'
                  }}
                >
                  <IconX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Segment Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
              Filter By Segment:
            </span>
            {[
              { key: 'total', label: `Total Accounts (${COUNTS.total})`, color: '#FF1300' },
              { key: 'paying', label: `Active Paying (${COUNTS.paying})`, color: '#10B981' },
              { key: 'churned', label: `Churned Accounts (${COUNTS.churned})`, color: '#DC2626' },
              { key: 'trial', label: `Active Trial (${COUNTS.trial})`, color: '#F59E0B' },
              { key: 'indonesia', label: `Indonesia Accounts (${COUNTS.indonesia})`, color: '#0284C7' },
              { key: 'redington', label: `Redington Accounts (${COUNTS.redington})`, color: '#7C3AED' },
              { key: 'versium', label: `Versium Accounts (${COUNTS.versium})`, color: '#0891B2' },
            ].map(pill => {
              const isActive = selectedKey === pill.key;
              return (
                <button
                  key={pill.key}
                  onClick={() => handleSelectKey(pill.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isActive ? pill.color : '#f1f5f9',
                    color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                    border: 'none',
                    boxShadow: isActive ? `0 2px 8px ${pill.color}40` : 'none'
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
        {selectedKey === 'versium' && (
          <div style={{ overflowX: 'auto', maxHeight: '560px', overflowY: 'auto' }}>
            <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['S.No', 'ClientName', 'Email', 'AccountCreatedDate', 'AccountExpiryDate', 'SubscribtionPlan', 'Partner', 'MS Account Status'].map(h => (
                    <th key={h} style={{ padding: '12px 18px', fontWeight: 600, background: '#f8fafc', position: 'sticky', top: 0, zIndex: 5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedAccounts.map((a, i) => (
                  <tr key={a.sNo ?? `${safePage}-${i}`} style={{ borderBottom: '1px solid var(--color-border-secondary)' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>#{a.displaySNo}</td>
                    <td style={{ padding: '12px 18px', fontWeight: 700 }}>{a.ClientName}</td>
                    <td style={{ padding: '12px 18px', color: 'var(--color-text-secondary)' }}>{a.Email}</td>
                    <td style={{ padding: '12px 18px' }}>{a.AccountCreatedDate}</td>
                    <td style={{ padding: '12px 18px' }}>{a.AccountExpiryDate}</td>
                    <td style={{ padding: '12px 18px' }}>{a.SubscribtionPlan}</td>
                    <td style={{ padding: '12px 18px' }}>{a.Partner}</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
                        whiteSpace: 'nowrap', display: 'inline-block',
                        background: a.MSAccountStatus === 'Active' ? '#f0fdf4' : '#fef2f2',
                        color: a.MSAccountStatus === 'Active' ? '#15803d' : '#b91c1c'
                      }}>
                        {a.MSAccountStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table View */}
        <div style={{ display: selectedKey === 'versium' ? 'none' : 'block', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxHeight: '560px', overflowY: 'auto' }}>
          <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '1px solid var(--color-border-primary)',
                color: 'var(--color-text-secondary)',
                position: 'sticky',
                top: 0,
                zIndex: 5,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}>
                <th style={{ padding: '12px 18px', fontWeight: 600, width: '70px', background: '#f8fafc' }}>S.No</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, width: '110px', background: '#f8fafc' }}>Client ID</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, background: '#f8fafc' }}>Client Name</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, background: '#f8fafc' }}>Plan</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, background: '#f8fafc' }}>Price</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, background: '#f8fafc' }}>Country / Region</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, background: '#f8fafc' }}>Renewal Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right', background: '#f8fafc' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>No matching accounts found</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Try adjusting your search query or select another KPI card</div>
                  </td>
                </tr>
              ) : (
                pagedAccounts.map((account, index, arr) => {
                  const isLast = index === arr.length - 1;
                  const planBadge = planStyles[account.SubscribtionType] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
                  const statusBadge = statusStyles[account.RenewalStatus] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

                  return (
                    <tr
                      key={account._key || account.ClientID}
                      onClick={() => setDrawerAccount(account)}
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid var(--color-border-secondary)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      {/* S.No */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                        #{account.displaySNo}
                      </td>

                      {/* Client ID */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#2563eb',
                            background: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {account.ClientID}
                        </span>
                      </td>

                      {/* Client Name */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {account.ClientName}
                        </div>
                        {account.Email && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {account.Email}
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            background: planBadge.bg,
                            color: planBadge.color,
                            border: `1px solid ${planBadge.border}`
                          }}
                        >
                          {account.SubscribtionType}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {account.Price || '—'}
                      </td>

                      {/* Country / Region */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {account.country || 'India'}
                      </td>

                      {/* Renewal Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`
                          }}
                        >
                          {account.RenewalStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerAccount(account);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border-primary)',
                            background: '#ffffff',
                            color: 'var(--color-text-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#FF1300';
                            e.currentTarget.style.color = '#FF1300';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                            e.currentTarget.style.color = 'var(--color-text-primary)';
                          }}
                        >
                          <span>Details</span>
                          <IconChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div
          style={{
            padding: '13px 22px',
            borderTop: '1px solid var(--color-border-primary)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            <span>
              Showing <strong>{showingFrom}–{showingTo}</strong> of <strong>{filteredAccounts.length}</strong>{' '}
              {filteredAccounts.length === 1 ? 'account' : 'accounts'}
            </span>
          </div>

          {filteredAccounts.length > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                style={pagerBtnStyle(safePage === 1)}
              >
                <IconChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {getPageItems(safePage, totalPages).map((item, i) =>
                item === '…' ? (
                  <span key={`gap-${i}`} style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    style={{
                      minWidth: '32px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: item === safePage ? '1px solid #FF1300' : '1px solid var(--color-border-primary)',
                      background: item === safePage ? '#FF1300' : '#ffffff',
                      color: item === safePage ? '#ffffff' : 'var(--color-text-primary)',
                      boxShadow: item === safePage ? '0 2px 8px rgba(255,19,0,0.25)' : 'none'
                    }}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                style={pagerBtnStyle(safePage === totalPages)}
              >
                <span>Next</span>
                <IconChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI hover breakdown (portal to body so it is never clipped by the card) ── */}
      {hoverInfo && BREAKDOWNS[hoverInfo.key] && createPortal(
        <div
          style={{
            position: 'fixed',
            top: hoverInfo.top,
            left: Math.max(8, Math.min(hoverInfo.left, window.innerWidth - 210)),
            minWidth: '190px',
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            zIndex: 2000,
            pointerEvents: 'none',
            fontSize: '12px'
          }}
        >
          {BREAKDOWNS[hoverInfo.key].map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '3px 0' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color, display: 'inline-block' }}></span>
                {row.label}
              </span>
              <span style={{ fontWeight: 800 }}>{row.value}</span>
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* ── Slide-Over Account Intelligence Drawer ── */}
      {drawerAccount && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            transition: 'opacity 0.2s ease'
          }}
          onClick={() => setDrawerAccount(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid var(--color-border-primary)',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {drawerAccount.isVersium ? 'Versium Account' : `Client ID: ${drawerAccount.ClientID}`}
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '8px 0 2px 0', color: 'var(--color-text-primary)' }}>
                    {drawerAccount.ClientName}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconMail size={14} />
                    <span>{drawerAccount.Email || 'No email registered'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerAccount(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-primary)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Status / Plan Pills */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap',
                    background: (planStyles[drawerAccount.SubscribtionType] || {}).bg || '#eff6ff',
                    color: (planStyles[drawerAccount.SubscribtionType] || {}).color || '#1d4ed8',
                    border: `1px solid ${(planStyles[drawerAccount.SubscribtionType] || {}).border || '#bfdbfe'}`
                  }}
                >
                  {drawerAccount.SubscribtionType}{drawerAccount.Price ? ` · ${drawerAccount.Price}` : ''}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap',
                    background: (statusStyles[drawerAccount.RenewalStatus] || {}).bg || '#f0fdf4',
                    color: (statusStyles[drawerAccount.RenewalStatus] || {}).color || '#15803d',
                    border: `1px solid ${(statusStyles[drawerAccount.RenewalStatus] || {}).border || '#bbf7d0'}`
                  }}
                >
                  {drawerAccount.RenewalStatus}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {drawerAccount.country || 'India'}
                </span>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div style={{ padding: '24px 24px 140px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Account Meta Box */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border-primary)',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Customer ID</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', wordBreak: 'break-all' }}>
                    {drawerAccount.CustID || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Database Identifier</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px', wordBreak: 'break-all' }}>
                    {drawerAccount.Databasename || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Created Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {drawerAccount.CreatedDt || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {drawerAccount.isVersium ? 'Account Expiry' : 'Next Renewal Due'}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {drawerAccount.RenewalDue || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Card Ending</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {drawerAccount.CardEnding || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Last Renewal</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {drawerAccount.LastRenewal || '—'}
                  </div>
                </div>
              </div>

              {drawerAccount.isVersium ? (
                <div style={{ background: '#f8fafc', border: '1px solid var(--color-border-primary)', borderRadius: '12px', padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Usage metrics (campaigns, lists, templates, delivery) are not tracked for Versium accounts.
                </div>
              ) : (
                <>
                  {/* Performance Metrics Section */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                      MARKETING INTELLIGENCE & ENGAGEMENT
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid var(--color-border-primary)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CAMPAIGNS</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                          {drawerAccount.campaigns || 0}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid var(--color-border-primary)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>LISTS UPLOADED</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                          {drawerAccount.listsUploaded || 0}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid var(--color-border-primary)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TEMPLATES</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                          {drawerAccount.templatesCreated || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Delivery Stats */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--color-border-primary)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Email Delivery Performance
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: (drawerAccount.sent > 0 && Math.round((drawerAccount.delivered / drawerAccount.sent) * 100) >= 80) ? '#059669' : '#d97706'
                        }}
                      >
                        {drawerAccount.sent > 0 ? `${Math.round((drawerAccount.delivered / drawerAccount.sent) * 100)}% Delivered` : '—'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                      <span>Total Sent: <strong>{(drawerAccount.sent || 0).toLocaleString()}</strong></span>
                      <span>Delivered: <strong>{(drawerAccount.delivered || 0).toLocaleString()}</strong></span>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: drawerAccount.sent > 0 ? `${Math.min(100, Math.round((drawerAccount.delivered / drawerAccount.sent) * 100))}%` : '0%',
                          height: '100%',
                          background: '#10B981',
                          borderRadius: '4px'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Health Score Box - calculated from the account's own data */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--color-border-primary)' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ACCOUNT HEALTH SCORE</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Activity, renewals, & engagement rating
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: !drawerHealth ? 'var(--color-text-muted)' : drawerHealth.healthScore >= 75 ? '#059669' : drawerHealth.healthScore >= 50 ? '#d97706' : '#dc2626'
                      }}
                    >
                      {drawerHealth ? `${drawerHealth.healthScore} / 100` : 'N/A'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
