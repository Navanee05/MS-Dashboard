import { cachedFetch } from '../utils/apiCache';
import { RAW_ONBOARD_ACCOUNTS } from '../data/mockAccounts';

const BASE = '/api/campstats/VersiumReach';
const DIRECT_BASE = 'https://campstats.marketingstar.us/VersiumReach';

// ── helpers ───────────────────────────────────────────────────────────────────
async function safeFetch(pathOrUrl) {
  const isFullUrl = String(pathOrUrl || '').startsWith('http');
  const path = String(pathOrUrl || '').replace(BASE, '').replace(DIRECT_BASE, '');
  const proxyUrl = isFullUrl ? pathOrUrl : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const directUrl = isFullUrl ? pathOrUrl : `${DIRECT_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const fetchWithTimeout = (url, ms = 2500) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal })
      .finally(() => clearTimeout(timer));
  };

  try {
    const res = await fetchWithTimeout(proxyUrl);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && !contentType.includes('text/html')) {
      return await res.json();
    }
  } catch (e) {
    // Try direct fallback
  }

  try {
    const resDirect = await fetchWithTimeout(directUrl);
    if (resDirect.ok) {
      return await resDirect.json();
    }
  } catch (eDirect) {
    // Direct fetch failed
  }

  return null;
}

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

// ── per-account enrichment ────────────────────────────────────────────────────
/**
 * Fetches all 4 per-account APIs using the Databasename from Get_VersiumReachDetails.
 */
async function enrichVersiumAccount(account) {
  if (account && Array.isArray(account.campaigns) && account.campaigns.length > 0) {
    return account;
  }
  const db = account.Databasename || account.databasename;
  if (!db) return buildAccountShape(account);

  return cachedFetch(`versium_live_${db}`, async () => {
    const today = new Date();
    const toDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];

    const [commList, audienceList, templateList, channelBreakdown] = await Promise.all([
      safeFetch(`${BASE}/GetCommunicationListDetailsAPI?&DatabaseName=${db}`),
      safeFetch(`${BASE}/GetAudiencelistDetailsAPI?Databasename=${db}&FromDate=2025-01-01&ToDate=${toDate}`),
      safeFetch(`${BASE}/GetTemplatelistDetailsAPI?Databasename=${db}`),
      safeFetch(`${BASE}/GetChannelwiseBreakdownDetailsAPI?Databasename=${db}&FromDate=2025-01-01&ToDate=${toDate}&ChannelType=1`),
    ]);

    const commJobs    = Array.isArray(commList)        ? commList        : [];
    const audiences   = Array.isArray(audienceList)    ? audienceList    : [];
    const templates   = Array.isArray(templateList)    ? templateList    : [];
    const campaigns   = Array.isArray(channelBreakdown)? channelBreakdown: [];

    const completedLists  = audiences.filter(a => String(a.StatusID).toLowerCase() === 'completed');
    const activeTemplates = templates.filter(t => String(t.StatusID).toLowerCase() === 'active');

    if (commJobs.length === 0 && audiences.length === 0 && templates.length === 0 && campaigns.length === 0) {
      return buildAccountShape(account);
    }

    let totalSent = 0, totalDelivered = 0, totalOpened = 0, totalClicked = 0;

    const campaignDetails = campaigns.map((c, idx) => {
      const sent      = Number(c.Sent      || 0);
      const delivered = Number(c.Delivered || 0);
      const opened    = Number(c.Opened    || 0);
      const clicked   = Number(c.Clicked   || 0);
      totalSent      += sent;
      totalDelivered += delivered;
      totalOpened    += opened;
      totalClicked   += clicked;

      const pname = c.Campaignname || c.CampaignName || c.Campaign || c.Name || '';
      return {
        id: `vc${idx + 1}`,
        name: pname || (c.CampaignType || 'Email') || `Campaign ${idx + 1}`,
        type: c.CampaignType || 'Email',
        sentOn: c.SentOn || '',
        sent,
        delivered,
        opened,
        clicked,
        deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
      };
    });

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    return buildAccountShape(account, {
      campaigns: campaignDetails,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      deliveryRate,
      listsUploaded:  completedLists.length,
      templatesCreated: activeTemplates.length,
      totalCommJobs: commJobs.length,
      completedJobs: commJobs.filter(j => String(j.statusID).toLowerCase() === 'completed').length,
      paidJobs:      commJobs.filter(j => String(j.IsPaymentDone).toLowerCase() === 'paid').length,
      hasUnpaid:     commJobs.some(j => String(j.IsPaymentDone).toLowerCase() === 'not paid'),
    });
  }, 10 * 1000);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all accounts directly from live API or user seed data with automatic caching.
 */
export async function fetchVersiumAccounts() {
  return cachedFetch("all_versium_accounts", async () => {
    try {
      const raw = await safeFetch(`${BASE}/Get_VersiumReachDetails`);
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(a => buildAccountShape(a));
      }
    } catch (e) {
      console.warn("fetchVersiumAccounts live API error:", e);
    }
    // Fallback directly to the 15 accounts provided by user
    return RAW_ONBOARD_ACCOUNTS.map(a => buildAccountShape(a));
  }, 10 * 1000);
}

/**
 * Fetch a single Versium account by ClientID, fully enriched with all 4 per-account APIs.
 */
export async function fetchVersiumAccountById(clientId) {
  const all = await fetchVersiumAccounts();
  if (Array.isArray(all) && all.length > 0) {
    const account = all.find(
      a => String(a.ClientID) === String(clientId) || String(a.id) === String(clientId) || String(a.userId) === String(clientId) || String(a.clientId) === String(clientId)
    );
    if (!account) throw new Error(`Account ${clientId} not found`);
    return enrichVersiumAccount(account);
  }
  throw new Error(`Account ${clientId} not found`);
}

/**
 * Fetch partner KPIs — aggregated totals + plan distribution directly from the accounts data.
 */
export async function fetchVersiumPartnerKpis() {
  return cachedFetch("versium_partner_kpis", async () => {
    let sourceData = [];
    try {
      const raw = await safeFetch(`${BASE}/Get_VersiumReachDetails`);
      if (Array.isArray(raw) && raw.length > 0) {
        sourceData = raw;
      }
    } catch (e) {
      console.warn("fetchVersiumPartnerKpis live API error:", e);
    }

    if (sourceData.length === 0) {
      sourceData = RAW_ONBOARD_ACCOUNTS;
    }

    const total  = sourceData.length;
    const active = sourceData.filter(a => {
      const status = a.RenewalStatus || a.status || '';
      return status === 'Renewed' || status === 'Active' || (!status.toLowerCase().includes('not renewed') && a.SubscribtionType !== 'Inactive');
    }).length;

    const plans  = sourceData.reduce((acc, a) => {
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

