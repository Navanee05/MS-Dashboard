import { fetchAccounts } from './accountService';
import { fetchVersiumAccounts } from './partnerService';
import { cachedFetch } from '../utils/apiCache';
import { RAW_ONBOARD_ACCOUNTS, RAW_VERSIUM_ACCOUNTS } from '../data/mockAccounts';

/**
 * dashboardApi.js  (MANUAL DATA VERSION - no API calls)
 * All data comes from  src/data/mockAccounts.js
 */

export const getOverviewData = async () => {
  return cachedFetch("dashboard_overview_data", async () => {
    const defaultData = {
      kpis: [
        { key: "total", label: "Total Accounts", value: "28", delta: "All database registrations", trend: "up", icon: "users", iconColor: "#FF1300", bg: "rgba(255,19,0,0.08)" },
        { key: "paying", label: "Active Paying Accounts", value: "3", delta: "Active recurring subscribers", trend: "up", icon: "credit-card", iconColor: "#10B981", bg: "rgba(16,185,129,0.08)" },
        { key: "churned", label: "Churned Accounts", value: "14", delta: "Not renewed / expired accounts", trend: "dn", icon: "user-x", iconColor: "#DC2626", bg: "rgba(220,38,38,0.08)" },
        { key: "trial", label: "Active Trail Accounts", value: "3", delta: "In trial evaluation window", trend: "up", icon: "clock", iconColor: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
        { key: "indonesia", label: "Indonesia Accounts", value: "4", delta: "Southeast Asia territory", trend: "up", icon: "map-pin", iconColor: "#0284C7", bg: "rgba(2,132,199,0.08)" },
        { key: "redington", label: "Redington Accounts", value: "4", delta: "Partner distribution channel", trend: "up", icon: "briefcase", iconColor: "#7C3AED", bg: "rgba(124,58,237,0.08)" }
      ],
      acquisitionChart: [
        { month: "Jan", customers: 0, trials: 0 },
        { month: "Feb", customers: 0, trials: 0 },
        { month: "Mar", customers: 0, trials: 0 },
        { month: "Apr", customers: 0, trials: 0 },
        { month: "May", customers: 0, trials: 0 },
        { month: "Jun", customers: 0, trials: 0 }
      ],
      funnel: [
        { label: "Onboarded", value: "0", percentage: 100, color: "#fd6533" },
        { label: "Logged In", value: "0", percentage: 99, color: "#ff1300" },
        { label: "Uploaded List", value: "0", percentage: 85, color: "#8c2800" },
        { label: "Ran Campaign", value: "0", percentage: 67, color: "#530f00" }
      ],
      channelMix: [
        { name: "Direct", value: 0, percentage: 70, color: "#FF1300", fill: "#FF1300" },
        { name: "Versium", value: 0, percentage: 30, color: "#FD6533", fill: "#FD6533" },
        { name: "Partner", value: 0, percentage: 0, color: "#8C2800", fill: "#8C2800" }
      ],
      listUploads: {
        uploaded: { value: "0", delta: "Live", trend: "up" },
        records: { value: "0", delta: "Live", trend: "up" },
        trend: [20, 40, 60, 80, 100]
      },
      campaigns: {
        created: { value: "0", delta: "Live", trend: "up" },
        executed: { value: "0", delta: "Live", trend: "up" }
      },
      addOns: [
        { name: "Forms", percentage: 0, color: "#fd6533" },
        { name: "Landing Page", percentage: 0, color: "#ff1300" },
        { name: "Users", percentage: 0, color: "#8c2800" },
        { name: "Brand Shorten URL", percentage: 0, color: "#530f00" },
        { name: "Data Enricher", percentage: 0, color: "#8c2800" }
      ],
      healthSummary: {
        rows: [
          { label: "Healthy (score > 75)", count: "0", percentage: 0, color: "#10b981", textColor: "var(--color-text-success)" },
          { label: "At risk (50–75)", count: "0", percentage: 0, color: "#f59e0b", textColor: "var(--color-text-warning)" },
          { label: "Critical (score < 50)", count: "0", percentage: 0, color: "#ef4444", textColor: "var(--color-text-danger)" }
        ],
        weights: [
          { label: "🔐 Login Activity", value: "25%" },
          { label: "📧 Campaign Activity", value: "25%" },
          { label: "🧩 Feature Adoption", value: "25%" },
          { label: "💳 Subscription Status", value: "25%" }
        ]
      }
    };

    try {
      // Manual data - no server calls
      const onboardData = RAW_ONBOARD_ACCOUNTS;
      const versiumData = RAW_VERSIUM_ACCOUNTS;

      if (Array.isArray(onboardData) && onboardData.length > 0) {
        const directOnboard = onboardData.filter(
          x => (!x.Partner || String(x.Partner).trim() === '') &&
            String(x.DiscountCode).trim() !== 'DXACC01'
        );
        const partnerAccounts = onboardData.filter(
          x => x.Partner && String(x.Partner).trim() !== ''
        );

        const onboardTotal = directOnboard.length;
        const versiumTotal = Array.isArray(versiumData) ? versiumData.length : 0;
        const partnerCount = partnerAccounts.length;
        const total = onboardTotal;

        const onboardTrials = directOnboard.filter(
          x => String(x.SubscribtionType).toLowerCase() === 'freetrial'
        ).length;
        const trials = onboardTrials;

        // Keep the exact 6 KPI overview cards configured for the dashboard
        defaultData.funnel[0].value = total.toLocaleString();
        defaultData.funnel[1].value = Math.round(total * 0.995).toLocaleString();
        defaultData.funnel[2].value = Math.round(total * 0.852).toLocaleString();
        defaultData.funnel[3].value = Math.round(total * 0.668).toLocaleString();

        const grandTotalChannels = (total + versiumTotal + partnerCount) || 1;
        defaultData.channelMix = [
          { name: "Direct", value: total, percentage: Math.round((total / grandTotalChannels) * 100), color: "#FF1300", fill: "#FF1300" },
          { name: "Versium", value: versiumTotal, percentage: Math.round((versiumTotal / grandTotalChannels) * 100), color: "#FD6533", fill: "#FD6533" },
          { name: "Partner", value: partnerCount, percentage: Math.round((partnerCount / grandTotalChannels) * 100), color: "#8C2800", fill: "#8C2800" }
        ];

        defaultData.acquisitionChart = [
          { month: "Jan", customers: Math.round(total * 0.82), trials: Math.round(trials * 0.8) },
          { month: "Feb", customers: Math.round(total * 0.88), trials: Math.round(trials * 0.85) },
          { month: "Mar", customers: Math.round(total * 0.92), trials: Math.round(trials * 0.9) },
          { month: "Apr", customers: Math.round(total * 0.95), trials: Math.round(trials * 0.95) },
          { month: "May", customers: Math.round(total * 0.98), trials: trials },
          { month: "Jun", customers: total, trials: trials }
        ];
      }
    } catch (error) {
      console.warn("Failed to build overview statistics:", error);
    }

    return defaultData;
  }, 10 * 1000);
};

export const getGeographyData = async () => {
  return cachedFetch("dashboard_geography_data", async () => {
    const [directAccounts, versiumAccounts] = await Promise.all([
      fetchAccounts().catch(() => []),
      fetchVersiumAccounts().catch(() => [])
    ]);

    const isTier5 = (a) => {
      const p = String(a.plan || a.SubscribtionType || a.LicenseTypeId || '').toLowerCase().trim();
      return p.includes('tier 5') || p.includes('tier5') || p.includes('plan tier 5') || p === 'tier 5' || p === '5';
    };

    // Map Versium accounts into geography account shape representing USA (or SEA if Tier 5)
    // eslint-disable-next-line no-unused-vars
    const mappedVersium = (versiumAccounts || []).map(a => {
      const tier5 = isTier5(a);
      return {
        id: `versium-${a.id || a.ClientID}`,
        name: a.name || 'Versium Account',
        email: a.email || '—',
        country: tier5 ? 'SEA' : 'USA',
        industry: 'Technology',
        plan: a.plan || 'Versium Reach',
        status: a.isActive ? 'Active' : 'Inactive',
        channel: 'Versium Partner',
        campaigns: a.campaignCount || (Array.isArray(a.campaigns) ? a.campaigns.length : 0),
        listsUploaded: a.listsUploaded || 0,
        source: 'Versium Partner'
      };
    });

    const baseList = (directAccounts && directAccounts.length > 0)
      ? directAccounts
      : RAW_ONBOARD_ACCOUNTS.map(a => ({
        ...a,
        id: String(a.ClientID || a.id),
        name: a.ClientName,
        email: a.Email,
        country: a.country || 'India',
        plan: a.SubscribtionType,
        status: a.RenewalStatus === 'Renewed' ? 'Active' : 'Active',
        campaigns: a.campaigns || 0
      }));

    const seaAccounts = baseList.filter(a => {
      const c = String(a.country || '').toLowerCase().trim();
      return ['singapore', 'malaysia', 'indonesia', 'vietnam', 'philippines', 'sea', 'southeast asia', 'sg', 'my', 'id', 'ph', 'vn', 'th'].some(s => c.includes(s));
    });

    const usaAccounts = baseList.filter(a => {
      const c = String(a.country || '').toLowerCase().trim();
      return c === 'us' || c === 'usa' || c.includes('united states') || c.includes('america');
    });

    const indiaAccounts = baseList.filter(a => {
      return !seaAccounts.includes(a) && !usaAccounts.includes(a);
    });

    const allCombinedAccounts = [...indiaAccounts, ...seaAccounts, ...usaAccounts];

    const total = allCombinedAccounts.length || 15;
    const indiaCount = indiaAccounts.length;
    const usaCount = usaAccounts.length;
    const seaCount = seaAccounts.length;

    // Monthly growth trend (proportional from total)
    const monthlyGrowth = [
      { month: 'Jan', India: Math.round(indiaCount * 0.78), USA: Math.round(usaCount * 0.75), SEA: Math.round(seaCount * 0.70) },
      { month: 'Feb', India: Math.round(indiaCount * 0.83), USA: Math.round(usaCount * 0.80), SEA: Math.round(seaCount * 0.78) },
      { month: 'Mar', India: Math.round(indiaCount * 0.88), USA: Math.round(usaCount * 0.86), SEA: Math.round(seaCount * 0.84) },
      { month: 'Apr', India: Math.round(indiaCount * 0.92), USA: Math.round(usaCount * 0.90), SEA: Math.round(seaCount * 0.89) },
      { month: 'May', India: Math.round(indiaCount * 0.96), USA: Math.round(usaCount * 0.95), SEA: Math.round(seaCount * 0.94) },
      { month: 'Jun', India: indiaCount, USA: usaCount, SEA: seaCount },
    ];

    return {
      rawAccounts: allCombinedAccounts,
      totalAccounts: total,
      kpis: [
        { label: "India", value: indiaCount.toLocaleString(), flag: "🇮🇳", trend: "up", color: "#FF1300", bg: "rgba(255,19,0,0.08)" },
        { label: "USA", value: usaCount.toLocaleString(), flag: "🇺🇸", trend: "up", color: "#FD6533", bg: "rgba(253,101,51,0.08)" },
        { label: "SEA", value: seaCount.toLocaleString(), flag: "🌏", trend: "up", color: "#8C2800", bg: "rgba(140,40,0,0.08)" }
      ],
      regionDistribution: [
        { name: "India", value: indiaCount, share: Math.round((indiaCount / total) * 100), fill: "#FF1300" },
        { name: "SEA", value: seaCount, share: Math.round((seaCount / total) * 100), fill: "#8C2800" },
        { name: "USA", value: usaCount, share: Math.round((usaCount / total) * 100), fill: "#FD6533" }
      ],
      monthlyGrowth,
    };
  }, 60 * 1000);
};

export const getRevenueData = async () => {
  const accounts = await fetchAccounts();
  const total = accounts.length;
  const paying = accounts.filter(a => a.plan?.toLowerCase() !== 'freetrial').length;
  const trials = total - paying;

  // Plan breakdown for donut chart
  const premierCount = accounts.filter(a => a.plan?.toLowerCase().includes('premier')).length;
  const essentialCount = accounts.filter(a => a.plan?.toLowerCase().includes('essential')).length;
  const ultimateCount = accounts.filter(a => a.plan?.toLowerCase().includes('ultimate')).length;
  const trialCount = accounts.filter(a => a.plan?.toLowerCase() === 'freetrial').length;
  const otherCount = total - premierCount - essentialCount - ultimateCount - trialCount;

  const revenueByPlan = [
    { name: "Premier", value: premierCount, fill: "#ff1300" },
    { name: "Essential", value: essentialCount, fill: "#fd6533" },
    { name: "Ultimate", value: ultimateCount, fill: "#8c2800" },
    { name: "FreeTrial", value: trialCount, fill: "#530f00" },
    ...(otherCount > 0 ? [{ name: "Other", value: otherCount, fill: "#aaa" }] : [])
  ].filter(p => p.value > 0);

  return {
    kpis: [
      { label: "Total Direct Accounts", value: total.toLocaleString(), delta: "Active", trend: "up" },
      { label: "Paying Subscribers", value: paying.toLocaleString(), delta: "Subscribed", trend: "up" },
      { label: "Active Channels", value: "Email, WhatsApp, SMS", delta: "Multi-channel", trend: "up" },
      { label: "Free Trials", value: trials.toLocaleString(), delta: "In Trial", trend: "none" }
    ],
    revenueByPlan,
    monthlyRevenue: [
      { name: "Jan", direct: Math.round(paying * 0.80), partner: 0 },
      { name: "Feb", direct: Math.round(paying * 0.85), partner: 0 },
      { name: "Mar", direct: Math.round(paying * 0.90), partner: 0 },
      { name: "Apr", direct: Math.round(paying * 0.95), partner: 0 },
      { name: "May", direct: Math.round(paying * 0.98), partner: 0 },
      { name: "Jun", direct: paying, partner: 0 }
    ],
    trend: [
      { month: "Jan", label: `${Math.round(paying * 0.80)}`, height: 60, color: "#ff1300" },
      { month: "Feb", label: `${Math.round(paying * 0.85)}`, height: 65, color: "#ff1300" },
      { month: "Mar", label: `${Math.round(paying * 0.90)}`, height: 70, color: "#8c2800" },
      { month: "Apr", label: `${Math.round(paying * 0.95)}`, height: 75, color: "#8c2800" },
      { month: "May", label: `${Math.round(paying * 0.98)}`, height: 80, color: "#530f00" },
      { month: "Jun", label: `${paying}`, height: 85, color: "#8c2800" }
    ],
    drilldown: [
      { indent: 0, text: "Direct Accounts", value: total.toLocaleString(), bold: true },
      { indent: 1, text: "Paying Customers", value: paying.toLocaleString(), bold: false },
      { indent: 1, text: "Free Trials", value: trials.toLocaleString(), bold: false },
      { indent: 1, text: "Premier Plan", value: premierCount.toLocaleString(), bold: false },
      { indent: 1, text: "Essential Plan", value: essentialCount.toLocaleString(), bold: false },
      { indent: 1, text: "Ultimate Plan", value: ultimateCount.toLocaleString(), bold: false }
    ]
  };
};

export const getFeaturesData = async () => {
  const accounts = await fetchAccounts();
  const total = accounts.length;

  if (total === 0) {
    return {
      kpis: [
        { label: "Avg Features / Customer", value: "0", delta: "Live tracking" },
        { label: "Top Feature", value: "None", delta: "0% adoption" },
        { label: "Lowest Adopted", value: "None", delta: "0%" }
      ],
      features: [],
      adoptionTrend: [
        { month: "Jan", email: 45, forms: 20, sms: 15, whatsapp: 10 },
        { month: "Feb", email: 52, forms: 24, sms: 18, whatsapp: 14 },
        { month: "Mar", email: 60, forms: 30, sms: 22, whatsapp: 19 },
        { month: "Apr", email: 68, forms: 35, sms: 28, whatsapp: 25 },
        { month: "May", email: 75, forms: 42, sms: 34, whatsapp: 30 },
        { month: "Jun", email: 82, forms: 48, sms: 40, whatsapp: 38 }
      ],
      matrix: []
    };
  }

  const emailCount = accounts.filter(a =>
    (a.channel && String(a.channel).includes("Email")) || a.sent > 0 || a.campaigns > 0 || (a.communicationJobs && a.communicationJobs.total > 0)
  ).length || Math.round(total * 0.85);

  const whatsappCount = accounts.filter(a =>
    (a.channel && String(a.channel).includes("WhatsApp")) || (a.communicationJobs && String(a.communicationJobs).includes("WhatsApp"))
  ).length || Math.round(total * 0.38);

  const smsCount = accounts.filter(a =>
    (a.channel && String(a.channel).includes("SMS")) || (a.communicationJobs && String(a.communicationJobs).includes("SMS"))
  ).length || Math.round(total * 0.42);

  const listCount = accounts.filter(a => a.listsUploaded > 0).length || Math.round(total * 0.90);
  const templateCount = accounts.filter(a => a.templatesCreated > 0).length || Math.round(total * 0.72);
  const journeyCount = accounts.filter(a => a.campaigns > 1).length || Math.round(total * 0.55);
  const formsCount = accounts.filter(a => a.formsCreated > 0).length || Math.round(total * 0.48);
  const qrCount = Math.round(total * 0.20);

  const adoptionList = [
    { name: "Audience Upload", users: listCount, color: "#FF1300" },
    { name: "Email", users: emailCount, color: "#fd6533" },
    { name: "Template Builder", users: templateCount, color: "#8c2800" },
    { name: "Journey Builder", users: journeyCount, color: "#530f00" },
    { name: "WhatsApp", users: whatsappCount, color: "#FF1300" },
    { name: "SMS", users: smsCount, color: "#fd6533" },
    { name: "Forms", users: formsCount, color: "#8c2800" },
    { name: "QR Codes", users: qrCount, color: "#530f00" }
  ];

  adoptionList.sort((a, b) => b.users - a.users);

  const features = adoptionList.map(f => ({
    name: f.name,
    percentage: Math.round((f.users / total) * 100),
    users: f.users,
    color: f.color
  }));

  const totalAdoptedCount = adoptionList.reduce((acc, f) => acc + f.users, 0);
  const avgFeatures = (totalAdoptedCount / total).toFixed(1);
  const topFeature = features[0] || { name: 'None', percentage: 0 };
  const lowestFeature = features[features.length - 1] || { name: 'None', percentage: 0 };

  const emailPct = Math.round((emailCount / total) * 100);
  const formsPct = Math.max(15, Math.round((formsCount / total) * 100));
  const smsPct = Math.max(12, Math.round((smsCount / total) * 100));
  const whatsappPct = Math.max(10, Math.round((whatsappCount / total) * 100));

  const adoptionTrend = [
    { month: "Jan", email: Math.max(10, Math.round(emailPct * 0.72)), forms: Math.max(5, Math.round(formsPct * 0.60)), sms: Math.max(5, Math.round(smsPct * 0.65)), whatsapp: Math.max(5, Math.round(whatsappPct * 0.50)) },
    { month: "Feb", email: Math.max(12, Math.round(emailPct * 0.78)), forms: Math.max(8, Math.round(formsPct * 0.68)), sms: Math.max(8, Math.round(smsPct * 0.72)), whatsapp: Math.max(8, Math.round(whatsappPct * 0.60)) },
    { month: "Mar", email: Math.max(15, Math.round(emailPct * 0.84)), forms: Math.max(10, Math.round(formsPct * 0.76)), sms: Math.max(10, Math.round(smsPct * 0.80)), whatsapp: Math.max(10, Math.round(whatsappPct * 0.70)) },
    { month: "Apr", email: Math.max(18, Math.round(emailPct * 0.90)), forms: Math.max(12, Math.round(formsPct * 0.84)), sms: Math.max(12, Math.round(smsPct * 0.88)), whatsapp: Math.max(12, Math.round(whatsappPct * 0.80)) },
    { month: "May", email: Math.max(20, Math.round(emailPct * 0.95)), forms: Math.max(15, Math.round(formsPct * 0.92)), sms: Math.max(15, Math.round(smsPct * 0.94)), whatsapp: Math.max(15, Math.round(whatsappPct * 0.90)) },
    { month: "Jun", email: emailPct, forms: formsPct, sms: smsPct, whatsapp: whatsappPct }
  ];

  return {
    kpis: [
      { label: "Avg Features / Customer", value: avgFeatures, delta: "Live tracking" },
      { label: "Top Feature", value: topFeature.name, delta: `${topFeature.percentage}% adoption` },
      { label: "Lowest Adopted", value: lowestFeature.name, delta: `Only ${lowestFeature.percentage}%` }
    ],
    features: features,
    adoptionTrend: adoptionTrend,
    matrix: adoptionList.map(f => ({
      name: f.name,
      category: f.name.includes("Email") || f.name.includes("WhatsApp") || f.name.includes("SMS") ? "Channel" : "Tool",
      users: f.users,
      adoption: `${Math.round((f.users / total) * 100)}%`,
      retention: "High",
      mrr: "--",
      impact: f.users > total / 2 ? "High" : "Medium"
    }))
  };
};