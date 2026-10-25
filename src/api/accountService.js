import { RAW_ONBOARD_ACCOUNTS } from '../data/mockAccounts';

/**
 * ─────────────────────────────────────────────────────────────
 *  accountService.js  (MANUAL DATA VERSION - no API calls)
 *
 *  All account data now comes from  src/data/mockAccounts.js
 *  To change anything on the dashboard, edit that file.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Health score (0-100), worked out from the account's own data:
 *   start at 50
 *   +20 has run campaigns      +10 has uploaded lists
 *   +10 has created templates  +10 delivery rate is 90% or more
 *   -20 subscription Not Renewed or On hold
 */
export function computeHealth(a) {
  const campaigns = a.campaigns || 0;
  const lists = a.listsUploaded || 0;
  const templates = a.templatesCreated || 0;
  const sent = a.sent || 0;
  const delivered = a.delivered || 0;
  const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : (campaigns > 0 ? 98 : 0);
  const subscriptionIssue = a.RenewalStatus === 'Not Renewed' || a.RenewalStatus === 'Onhold' || a.renewalStatus === 'Not Renewed' || a.renewalStatus === 'Onhold';

  let score = 50;
  if (campaigns > 0) score += 20;
  if (lists > 0) score += 10;
  if (templates > 0) score += 10;
  if (deliveryRate >= 90) score += 10;
  if (subscriptionIssue) score -= 20;
  score = Math.min(100, Math.max(0, score));

  return {
    healthScore: score,
    healthLabel: score >= 75 ? 'green' : score >= 50 ? 'amber' : 'red',
    healthBreakdown: {
      deliveryRate,
      campaignActivity: campaigns > 0 ? 75 : 20,
      templateUsage: templates > 0 ? 70 : 20,
      listGrowth: lists > 0 ? 70 : 20
    }
  };
}

/** Normalise a raw account object to the shape expected by the app. */
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

  const health = computeHealth(raw);
  const defaultHealthScore = raw.healthScore ?? health.healthScore;
  const defaultHealthLabel = raw.healthLabel ?? health.healthLabel;

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
    communicationJobs: raw.communicationJobs,
    campaignDetails: raw.campaignDetails || [],
    healthBreakdown: raw.healthBreakdown || health.healthBreakdown
  };
}

/**
 * Previously this called 5 live APIs per account.
 * Now it works out the health score from the account's own manual data.
 */
export async function populateAccountLive(account) {
  return { ...account, ...computeHealth(account) };
}

/** Returns all accounts from the manual data file */
export async function fetchAccounts() {
  const list = RAW_ONBOARD_ACCOUNTS.map(raw => normalizeAccount(raw));
  list.sort((a, b) =>
    (b.campaigns || 0) - (a.campaigns || 0) ||
    (b.sent || 0) - (a.sent || 0) ||
    (a.name || '').localeCompare(b.name || '')
  );
  return list;
}

/** Fetch a single account by ID */
export async function fetchAccountById(id) {
  const accounts = await fetchAccounts();
  const found = accounts.find(
    x => String(x.id) === String(id) || String(x.clientId) === String(id) || String(x.databasename) === String(id)
  );
  if (found) {
    return await populateAccountLive(found);
  }
  throw new Error(`Account ${id} not found`);
}