import { cachedFetch } from '../utils/apiCache';
import { RAW_ONBOARD_ACCOUNTS } from '../data/mockAccounts';

/**
 * partnerService.js  (MANUAL DATA VERSION - no API calls)
 * All data comes from  src/data/mockAccounts.js
 */

// ── shape builder ─────────────────────────────────────────────────────────────
function buildAccountShape(raw, enriched = {}) {
  const plan = raw.SubscribtionType || raw.LicenseTypeId || raw.plan || 'Essentials';
  const isActive = raw.RenewalStatus === 'Renewed' ||
    raw.RenewalStatus === 'Active' ||
    (plan !== '' && plan.toLowerCase() !== 'inactive' && raw.RenewalStatus !== 'Not Renewed');

  const sent = enriched.totalSent || raw.sent || 0;
  const delivered = enriched.totalDelivered || raw.delivered || 0;
  const opened = enriched.totalOpened || Math.round(delivered * 0.36);
  const clicked = enriched.totalClicked || Math.round(delivered * 0.12);
  const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : (enriched.deliveryRate || 95);

  const defaultCampaigns = (raw.campaigns || 0) > 0 ? [
    {
      id: `c-${raw.ClientID || raw.id || '1'}-1`,
      name: `${raw.ClientName || raw.Clientname || 'Campaign'} Promo Delivery`,
      type: 'Email',
      sentOn: raw.LastRenewal || raw.CreatedDt || '15 Apr 2026',
      sent: Math.round(sent * 0.65),
      delivered: Math.round(delivered * 0.65),
      opened: Math.round(opened * 0.65),
      clicked: Math.round(clicked * 0.65),
      deliveryRate,
      openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 36
    },
    {
      id: `c-${raw.ClientID || raw.id || '1'}-2`,
      name: `${raw.ClientName || raw.Clientname || 'Campaign'} Engagement Series`,
      type: 'Email',
      sentOn: raw.RenewalDue || '10 Oct 2026',
      sent: Math.round(sent * 0.35),
      delivered: Math.round(delivered * 0.35),
      opened: Math.round(opened * 0.35),
      clicked: Math.round(clicked * 0.35),
      deliveryRate,
      openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 36
    }
  ] : [];

  return {
    id: String(raw.ClientID || raw.id || raw.userId || raw.UserID || ''),
    clientId: String(raw.ClientID || raw.id || ''),
    userId: String(raw.UserID || raw.userId || ''),
    custId: raw.CustID || raw.custId || '',
    name: raw.ClientName || raw.Clientname || raw.name || '',
    email: raw.Email || raw.Emailname || raw.email || '',
    plan,
    price: raw.Price || '',
    country: raw.country || 'India',
    partnerType: raw.PartnerType || raw.partnerType || 'Partner Channel',
    createdDate: raw.CreatedDt || raw.createdDate || '',
    lastLogin: raw.LastRenewal ? `Renewed on ${raw.LastRenewal}` : (raw.LastLogInTime || raw.lastLogin || 'Active'),
    databasename: raw.Databasename || raw.databasename || '',
    isActive,
    renewalDue: raw.RenewalDue || '',
    renewalStatus: raw.RenewalStatus || 'Active',
    cardEnding: raw.CardEnding || '',
    campaigns: (enriched.campaigns && enriched.campaigns.length > 0) ? enriched.campaigns : defaultCampaigns,
    campaignCount: raw.campaigns || (enriched.campaigns || defaultCampaigns).length,
    totalSent: sent,
    totalDelivered: delivered,
    totalOpened: opened,
    totalClicked: clicked,
    deliveryRate,
    listsUploaded: enriched.listsUploaded || raw.listsUploaded || 0,
    templatesCreated: enriched.templatesCreated || raw.templatesCreated || 0,
    totalCommJobs: enriched.totalCommJobs || raw.campaigns || 0,
    completedJobs: enriched.completedJobs || (raw.RenewalStatus === 'Renewed' ? raw.campaigns : Math.round((raw.campaigns || 0) * 0.75)),
    paidJobs: enriched.paidJobs || (raw.RenewalStatus === 'Renewed' ? raw.campaigns : 0),
    hasUnpaid: enriched.hasUnpaid ?? (raw.RenewalStatus === 'Not Renewed' || raw.RenewalStatus === 'Onhold'),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** All partner accounts, from the manual data file. */
export async function fetchVersiumAccounts() {
  return cachedFetch("all_versium_accounts", async () => {
    return RAW_ONBOARD_ACCOUNTS.map(a => buildAccountShape(a));
  }, 10 * 1000);
}

/** One account by ClientID, from the manual data file. */
export async function fetchVersiumAccountById(clientId) {
  const all = await fetchVersiumAccounts();
  const account = all.find(
    a => String(a.ClientID) === String(clientId) || String(a.id) === String(clientId) ||
      String(a.userId) === String(clientId) || String(a.clientId) === String(clientId)
  );
  if (!account) throw new Error(`Account ${clientId} not found`);
  return account;
}

/** Partner KPIs - totals + plan distribution from the manual data file. */
export async function fetchVersiumPartnerKpis() {
  return cachedFetch("versium_partner_kpis", async () => {
    const sourceData = RAW_ONBOARD_ACCOUNTS;

    const total = sourceData.length;
    const active = sourceData.filter(a => {
      const status = a.RenewalStatus || a.status || '';
      return status === 'Renewed' || status === 'Active' || (!status.toLowerCase().includes('not renewed') && a.SubscribtionType !== 'Inactive');
    }).length;

    const plans = sourceData.reduce((acc, a) => {
      const p = a.SubscribtionType || a.LicenseTypeId || a.plan || 'Essentials';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    const planBreakdown = Object.entries(plans)
      .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    return { total, active, inactive: Math.max(0, total - active), planBreakdown };
  }, 10 * 1000);
}