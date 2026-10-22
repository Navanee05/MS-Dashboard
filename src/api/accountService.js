import { cachedFetch } from '../utils/apiCache';
import { RAW_ONBOARD_ACCOUNTS } from '../data/mockAccounts';

/**
 * ─────────────────────────────────────────────────────────────
 *  accountService.js
 *
 *  Fetches Onboard accounts and enriches each with live
 *  campaign, audience, template, channel-breakdown, form, and
 *  communication list data using the account's Databasename.
 *
 *  All API calls go through Vite proxy or direct HTTPS fallback.
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = "/api/campstats/AccountOnboard";
const DIRECT_BASE_URL = "https://campstats.marketingstar.us/AccountOnboard";

/**
 * Robust fetch helper: Tries primary URL (Vite proxy / relative),
 * and if proxy returns index.html or fails, automatically falls back
 * to the direct HTTPS endpoint.
 */
async function safeFetchJson(endpointPath) {
  const proxyUrl = `${BASE_URL}${endpointPath}`;
  const directUrl = `${DIRECT_BASE_URL}${endpointPath}`;

  const fetchWithTimeout = (url, ms = 2500) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal })
      .finally(() => clearTimeout(timer));
  };

  try {
    const res = await fetchWithTimeout(proxyUrl);
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && !contentType.includes("text/html")) {
      return await res.json();
    }
  } catch (e) {
    // Proxy fetch failed or timed out, proceed to direct fallback
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


/** Normalise a raw API account object to the shape expected by the app. */
export function normalizeAccount(raw) {
  const plan = raw.SubscribtionType || raw.plan || (raw.PlanTier ? `Tier ${raw.PlanTier}` : 'Essentials');
  const isTier5 = String(plan).toLowerCase().includes('tier 5') ||
                  String(plan).toLowerCase().includes('tier5') ||
                  String(raw.PlanTier) === '5' ||
                  String(raw.Tier) === '5';
  const country = raw.country || (isTier5 ? "Southeast Asia" : "India");
  const dbName = raw.Databasename || raw.databasename || '';
  const email = raw.Email || raw.email || '';
  const clientName = raw.ClientName || raw.name || 
    (raw.FirstName || raw.LastName ? `${raw.FirstName || ''} ${raw.LastName || ''}`.trim() : 'Account');

  const defaultHealthScore = raw.healthScore ?? (raw.RenewalStatus === 'Renewed' ? 90 : raw.RenewalStatus === 'Not Renewed' ? 45 : 70);
  const defaultHealthLabel = raw.healthLabel ?? (defaultHealthScore >= 75 ? 'green' : defaultHealthScore >= 50 ? 'amber' : 'red');

  return {
    id: String(raw.ClientID || raw.id || raw.userId || raw.UserID || ''),
    userId: String(raw.UserID || raw.userId || ''),
    clientId: String(raw.ClientID || raw.id || ''),
    custId: raw.CustID || raw.custId || '',
    name: clientName,
    email,
    country,
    industry: raw.industry || "Enterprise Services",
    plan,
    status: raw.status || (raw.RenewalStatus === 'Renewed' || raw.RenewalStatus === 'Active' ? 'Active' : raw.RenewalStatus === 'Not Renewed' ? 'Overdue' : 'Active'),
    channel: raw.channel || "Email",
    salesModel: raw.Partner && String(raw.Partner).trim() !== '' ? "Partner" : "Direct",
    campaigns: raw.campaigns || 0,
    listsUploaded: raw.listsUploaded || 0,
    templatesCreated: raw.templatesCreated || 0,
    formsCreated: raw.formsCreated || 0,
    sent: raw.sent || 0,
    delivered: raw.delivered || 0,
    price: raw.Price || '',
    createdDate: raw.CreatedDt || raw.createdDate || '',
    lastRenewal: raw.LastRenewal || '',
    renewalDue: raw.RenewalDue || '',
    cardEnding: raw.CardEnding || '',
    renewalStatus: raw.RenewalStatus || 'Active',
    renewalDays: raw.renewalDays || 30,
    hasIssues: raw.hasIssues ?? (raw.RenewalStatus === 'Not Renewed' || raw.RenewalStatus === 'Onhold'),
    churned: raw.churned ?? (raw.RenewalStatus === 'Not Renewed'),
    newlyOnboarded: raw.newlyOnboarded ?? false,
    healthScore: defaultHealthScore,
    healthLabel: defaultHealthLabel,
    databasename: dbName,
    campaignDetails: raw.campaignDetails || [],
    healthBreakdown: raw.healthBreakdown || {
      deliveryRate: raw.sent > 0 ? Math.round((raw.delivered / raw.sent) * 100) : 95,
      campaignActivity: (raw.campaigns || 0) > 0 ? 80 : 35,
      templateUsage: (raw.templatesCreated || 0) > 0 ? 75 : 35,
      listGrowth: (raw.listsUploaded || 0) > 0 ? 80 : 35
    }
  };
}

/**
 * Fetches all 5 per-account APIs using the account's Databasename.
 */
export async function populateAccountLive(account) {
  const dbName = account.databasename || account.Databasename;
  if (!dbName) return account;

  return cachedFetch(`acc_live_${dbName}`, async () => {
    try {
      const today = new Date();
      const toDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];

      const [audienceRes, templatesRes, channelRes, communicationRes, formsRes] = await Promise.all([
        safeFetchJson(`/GetAudiencelistDetailsAPI?Databasename=${dbName}&FromDate=2025-01-01&ToDate=${toDate}`),
        safeFetchJson(`/GetTemplatelistDetailsAPI?Databasename=${dbName}`),
        safeFetchJson(`/GetChannelwiseBreakdownDetailsAPI?Databasename=${dbName}&FromDate=2025-01-01&ToDate=${toDate}&ChannelType=1`),
        safeFetchJson(`/GetCommunicationListDetailsAPI?&DatabaseName=${dbName}`),
        safeFetchJson(`/GetFormslistDetailsAPI?Databasename=${dbName}`)
      ]);

      const campaignsCount = Array.isArray(channelRes) ? channelRes.length : 0;

      const listsCount = Array.isArray(audienceRes) 
        ? audienceRes.filter(x => String(x.StatusID).toLowerCase() === 'completed').length 
        : 0;

      const templatesCount = Array.isArray(templatesRes) 
        ? templatesRes.filter(x => String(x.StatusID).toLowerCase() === 'active').length 
        : 0;

      const commJobs = Array.isArray(communicationRes) ? communicationRes : [];
      const paidCommJobs = commJobs.filter(
        x => String(x.IsPaymentDone).toLowerCase() === 'paid' && String(x.statusID).toLowerCase() === 'completed'
      ).length;
      const totalCommJobs = commJobs.length;
      const hasUnpaidCampaigns = commJobs.some(x => String(x.IsPaymentDone).toLowerCase() === 'not paid');

      const formsCount = Array.isArray(formsRes) ? formsRes.length : 0;

      let sentSum = 0;
      let deliveredSum = 0;
      const campaignDetails = [];

      if (Array.isArray(channelRes)) {
        channelRes.forEach((c, idx) => {
          const sentVal = Number(c.Sent || 0);
          const deliveredVal = Number(c.Delivered || 0);
          sentSum += sentVal;
          deliveredSum += deliveredVal;

          let displayDate = c.SentOn || "";
          if (displayDate) {
            const match = displayDate.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+)/);
            if (match) {
              displayDate = `${match[3]} ${match[2]} ${match[4]}`;
            }
          }

          const campaignName = c.CampaignName || c.Campaignname || c.Campaign || c.Name || c.CampaignTitle || '';
          const campaignType = c.CampaignType || c.Type || 'Email Campaign';

          campaignDetails.push({
            id: `c-live-${idx + 1}`,
            name: campaignName || campaignType || `Campaign #${idx + 1}`,
            type: campaignType,
            channel: "Email",
            status: "Sent",
            sentDate: displayDate || "Recent",
            sent: sentVal,
            delivered: deliveredVal,
            opens: Number(c.Opens || 0),
            clicks: Number(c.Clicks || 0),
            bounces: Number(c.Bounced || 0),
            unsubscribes: Number(c.Unsubscribes || 0),
            deliveryRate: sentVal > 0 ? Math.round((deliveredVal / sentVal) * 100) : 0,
            openRate: deliveredVal > 0 ? Math.round((Number(c.Opens || 0) / deliveredVal) * 100) : 0,
            clickRate: deliveredVal > 0 ? Math.round((Number(c.Clicks || 0) / deliveredVal) * 100) : 0
          });
        });
      }

      const deliveryRate = sentSum > 0 ? Math.round((deliveredSum / sentSum) * 100) : (campaignsCount > 0 ? 98 : 0);

      let calculatedScore = 50;
      if (campaignsCount > 0) calculatedScore += 20;
      if (listsCount > 0) calculatedScore += 10;
      if (templatesCount > 0) calculatedScore += 10;
      if (deliveryRate >= 90) calculatedScore += 10;
      if (hasUnpaidCampaigns) calculatedScore -= 20;

      const updatedScore = Math.min(100, Math.max(0, calculatedScore));
      const updatedLabel = updatedScore >= 75 ? 'green' : updatedScore >= 50 ? 'amber' : 'red';

      return {
        ...account,
        campaigns: campaignsCount,
        listsUploaded: listsCount,
        templatesCreated: templatesCount,
        formsCreated: formsCount,
        communicationJobs: {
          total: totalCommJobs,
          paid: paidCommJobs,
          hasUnpaid: hasUnpaidCampaigns
        },
        sent: sentSum,
        delivered: deliveredSum,
        campaignDetails: campaignDetails,
        healthBreakdown: {
          deliveryRate: deliveryRate,
          campaignActivity: campaignsCount > 0 ? 75 : 20,
          templateUsage: templatesCount > 0 ? 70 : 20,
          listGrowth: listsCount > 0 ? 70 : 20
        },
        healthScore: updatedScore,
        healthLabel: updatedLabel
      };
    } catch (err) {
      console.warn(`Failed to fetch live API details for ${account.name} (${dbName}):`, err);
      return account;
    }
  }, 10 * 1000);
}

/** Fetch all accounts directly from live API / DB endpoints with automatic caching */
export async function fetchAccounts() {
  return cachedFetch("all_onboard_accounts", async () => {
    try {
      const rawList = await safeFetchJson("/Get_OnBoardInfoAPI");

      if (Array.isArray(rawList) && rawList.length > 0) {
        const filtered = rawList.filter(
          x => (!x.Partner || String(x.Partner).trim() === '') &&
               String(x.DiscountCode).trim() !== 'DXACC01'
        );

        const normalizedList = filtered.map(raw => normalizeAccount(raw));
        normalizedList.sort((a, b) => (b.campaigns || 0) - (a.campaigns || 0) || (b.sent || 0) - (a.sent || 0) || (a.name || '').localeCompare(b.name || ''));
        return normalizedList;
      }
    } catch (err) {
      console.warn("Failed to fetch live accounts from Get_OnBoardInfoAPI:", err);
    }
    
    // Fall back to seed accounts if upstream API is offline
    const fallbackList = RAW_ONBOARD_ACCOUNTS.map(raw => normalizeAccount(raw));
    fallbackList.sort((a, b) => (b.campaigns || 0) - (a.campaigns || 0) || (b.sent || 0) - (a.sent || 0) || (a.name || '').localeCompare(b.name || ''));
    return fallbackList;
  }, 10 * 1000);
}

/** Fetch a single account by ID, fully enriched with live data */
export async function fetchAccountById(id) {
  const accounts = await fetchAccounts();
  const found = accounts.find(
    x => String(x.id) === String(id) || String(x.ClientID) === String(id) || String(x.databasename) === String(id)
  );
  if (found) {
    return await populateAccountLive(found);
  }
  throw new Error(`Account ${id} not found`);
}

