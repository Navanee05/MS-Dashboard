/**
 * Country and Flag Helpers
 * Normalizes country strings and returns the appropriate flag and formatted label.
 */

export function getCountryFlag(country) {
  if (!country) return '🇮🇳';
  const c = String(country).trim().toLowerCase();
  if (c === 'in' || c === 'ind' || c.includes('india')) return '🇮🇳';
  if (c === 'us' || c === 'usa' || c.includes('united states') || c.includes('america')) return '🇺🇸';
  if (c === 'sg' || c.includes('singapore')) return '🇸🇬';
  if (c === 'my' || c.includes('malaysia')) return '🇲🇾';
  if (c === 'id' || c.includes('indonesia')) return '🇮🇩';
  if (c === 'ph' || c.includes('philippines')) return '🇵🇭';
  if (c === 'vn' || c.includes('vietnam')) return '🇻🇳';
  if (c === 'th' || c.includes('thailand')) return '🇹🇭';
  if (c === 'uk' || c === 'gb' || c.includes('united kingdom') || c.includes('britain')) return '🇬🇧';
  if (c === 'ae' || c.includes('uae') || c.includes('dubai')) return '🇦🇪';
  if (c === 'ca' || c.includes('canada')) return '🇨🇦';
  if (c === 'au' || c.includes('australia')) return '🇦🇺';
  if (c.includes('sea')) return '🌏';
  return '🇮🇳';
}

export function getCountryName(country) {
  if (!country) return 'India';
  const c = String(country).trim().toLowerCase();
  if (c === 'in' || c === 'ind' || c.includes('india')) return 'India';
  if (c === 'us' || c === 'usa' || c.includes('united states') || c.includes('america')) return 'USA';
  if (c === 'sg' || c.includes('singapore')) return 'Singapore';
  if (c === 'my' || c.includes('malaysia')) return 'Malaysia';
  if (c === 'id' || c.includes('indonesia')) return 'Indonesia';
  if (c === 'ph' || c.includes('philippines')) return 'Philippines';
  if (c === 'vn' || c.includes('vietnam')) return 'Vietnam';
  if (c === 'th' || c.includes('thailand')) return 'Thailand';
  if (c === 'uk' || c === 'gb' || c.includes('united kingdom')) return 'UK';
  if (c === 'ae' || c.includes('uae')) return 'UAE';
  if (c === 'ca' || c.includes('canada')) return 'Canada';
  if (c === 'au' || c.includes('australia')) return 'Australia';
  if (c.includes('sea')) return 'Southeast Asia';
  return country;
}

export function formatCountryWithFlag(country) {
  const flag = getCountryFlag(country);
  const name = getCountryName(country);
  return `${flag} ${name}`;
}
