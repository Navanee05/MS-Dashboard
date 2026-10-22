import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getOverviewData } from '../../api/dashboardApi';
import { RAW_ONBOARD_ACCOUNTS } from '../../data/mockAccounts';
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
  IconBuilding,
  IconMail,
  IconCalendar,
  IconCreditCard as IconCard,
  IconActivity,
  IconSend,
  IconFileText
} from '@tabler/icons-react';

const iconMap = {
  users: IconUsers,
  'credit-card': IconCreditCard,
  'user-x': IconUserX,
  clock: IconClock,
  'map-pin': IconMapPin,
  briefcase: IconBriefcase,
};

const planStyles = {
  'Essentials': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Premier': { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  'Premier Plus': { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' },
  'Premier(Free Trail)': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Free Trial': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
};

const statusStyles = {
  'Renewed': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Active': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Not Renewed': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'Trial': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Onhold': { bg: '#fefce8', color: '#a16207', border: '#fef08a' }
};

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('total'); // 'total' | 'paying' | 'churned' | 'trial' | 'indonesia' | 'redington'
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerAccount, setDrawerAccount] = useState(null);
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

  // Compute accounts list based on selected KPI card
  const filteredAccounts = useMemo(() => {
    let list = [];
    if (selectedKey === 'total') {
      list = RAW_ONBOARD_ACCOUNTS.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    } else if (selectedKey === 'churned') {
      const churnedList = RAW_ONBOARD_ACCOUNTS.filter(acc => acc.category === 'churned');
      list = churnedList.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    } else if (selectedKey === 'paying') {
      const payingList = RAW_ONBOARD_ACCOUNTS.filter(acc => acc.category === 'paying');
      list = payingList.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    } else if (selectedKey === 'trial') {
      const trialList = RAW_ONBOARD_ACCOUNTS.filter(acc => acc.category === 'trial');
      list = trialList.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    } else if (selectedKey === 'indonesia') {
      const indoList = RAW_ONBOARD_ACCOUNTS.filter(acc => acc.category === 'indonesia');
      list = indoList.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    } else if (selectedKey === 'redington') {
      const redList = RAW_ONBOARD_ACCOUNTS.filter(acc => acc.category === 'redington');
      list = redList.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    } else {
      list = RAW_ONBOARD_ACCOUNTS.map((acc, index) => ({
        ...acc,
        displaySNo: index + 1
      }));
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(acc => 
      String(acc.displaySNo).includes(query) ||
      String(acc.ClientID).toLowerCase().includes(query) ||
      String(acc.ClientName).toLowerCase().includes(query) ||
      String(acc.Email || '').toLowerCase().includes(query) ||
      String(acc.country || '').toLowerCase().includes(query) ||
      String(acc.SubscribtionType || '').toLowerCase().includes(query)
    );
  }, [selectedKey, searchQuery]);

  // Current active KPI card info
  const activeKpi = useMemo(() => {
    if (!data?.kpis) return null;
    return data.kpis.find(k => k.key === selectedKey) || data.kpis[0];
  }, [data, selectedKey]);

  if (loading || !data) {
    return (
      <div className="content loading-skeleton">
        <IconLoader2 size={40} className="spin-icon" />
        <p>Loading Portfolio...</p>
      </div>
    );
  }

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
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            background: 'rgba(255,19,0,0.06)', 
            border: '1px solid rgba(255,19,0,0.18)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#FF1300'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF1300', display: 'inline-block' }}></span>
          <span>Click any card below to filter account roster</span>
        </div>
      </div>

      {/* ── 6 KPI Cards Grid (Compact & Sleek) ── */}
      <div 
        className="kpi-row" 
        style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '12px',
          marginTop: '2px'
        }}
      >
        {data.kpis.map((kpi, idx) => {
          const Icon = iconMap[kpi.icon] || IconUsers;
          const isSelected = selectedKey === kpi.key;

          return (
            <div 
              className={`kpi-card ${isSelected ? 'active-kpi-card' : ''}`}
              key={idx} 
              onClick={() => handleSelectKey(kpi.key)}
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
                    Active
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
                {selectedKey === 'total' && 'Complete 28-account master roster across all subscription tiers and regional territories'}
                {selectedKey === 'churned' && 'Roster of 14 churned or non-renewed accounts requiring re-engagement or lifecycle intervention'}
                {selectedKey === 'paying' && '3 high-value active recurring paying client accounts'}
                {selectedKey === 'trial' && '3 active free trial accounts currently evaluating premier capabilities'}
                {selectedKey === 'indonesia' && '4 key enterprise partner accounts deployed across the Indonesian territory'}
                {selectedKey === 'redington' && '4 strategic Redington distribution partner accounts'}
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
              { key: 'total', label: 'Total Accounts (28)', color: '#FF1300' },
              { key: 'paying', label: 'Active Paying (3)', color: '#10B981' },
              { key: 'churned', label: 'Churned Accounts (14)', color: '#DC2626' },
              { key: 'trial', label: 'Active Trail (3)', color: '#F59E0B' },
              { key: 'indonesia', label: 'Indonesia Accounts (4)', color: '#0284C7' },
              { key: 'redington', label: 'Redington Partner (4)', color: '#7C3AED' },
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

        {/* Table View */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxHeight: '560px', overflowY: 'auto' }}>
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
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>No matching accounts found</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Try adjusting your search query or select another KPI card</div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account, index, arr) => {
                  const isLast = index === arr.length - 1;
                  const planBadge = planStyles[account.SubscribtionType] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
                  const statusBadge = statusStyles[account.RenewalStatus] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

                  return (
                    <tr 
                      key={account.ClientID}
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
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                        #{account.displaySNo}
                      </td>

                      {/* Client ID */}
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px' }}>
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
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px' }}>
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
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px' }}>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            padding: '3px 8px', 
                            borderRadius: '12px',
                            background: planBadge.bg,
                            color: planBadge.color,
                            border: `1px solid ${planBadge.border}`
                          }}
                        >
                          {account.SubscribtionType}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {account.Price || '—'}
                      </td>

                      {/* Country / Region */}
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {account.country || 'India'}
                      </td>

                      {/* Renewal Status */}
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px' }}>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: '12px',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`
                          }}
                        >
                          {account.RenewalStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: isLast ? '14px 18px 24px' : '14px 18px', textAlign: 'right' }}>
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

        {/* Card Footer Summary Bar - Guarantees last account visibility & quick access */}
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
            <span>Roster Total: <strong>{filteredAccounts.length}</strong> {filteredAccounts.length === 1 ? 'account' : 'accounts'}</span>
          </div>

          {filteredAccounts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Last Account in Roster:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>
                #{filteredAccounts[filteredAccounts.length - 1].displaySNo} {filteredAccounts[filteredAccounts.length - 1].ClientName}
              </strong>
              <button
                onClick={() => setDrawerAccount(filteredAccounts[filteredAccounts.length - 1])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #FF1300',
                  background: 'rgba(255,19,0,0.06)',
                  color: '#FF1300',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF1300';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,19,0,0.06)';
                  e.currentTarget.style.color = '#FF1300';
                }}
              >
                <span>View #{filteredAccounts[filteredAccounts.length - 1].displaySNo} Details</span>
                <IconChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Scroll Clearance Spacer (guarantees the last account details and row are always completely visible) ── */}
      <div style={{ height: '100px', width: '100%', flexShrink: 0 }} />

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
                    Client ID: {drawerAccount.ClientID}
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
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Next Renewal Due</div>
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

              {/* Health Score Box */}
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
                    color: drawerAccount.healthScore >= 75 ? '#059669' : drawerAccount.healthScore >= 50 ? '#d97706' : '#dc2626' 
                  }}
                >
                  {drawerAccount.healthScore || 70} / 100
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
