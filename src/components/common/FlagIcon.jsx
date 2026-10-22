import React, { useState } from 'react';

/**
 * High-quality Flag Component that works on all operating systems (including Windows,
 * where unicode flag emojis render as letters like 'IN' and 'US').
 */

export const FlagIndia = ({ size = 24, className = '', style = {} }) => {
  const height = Math.round(size * 0.68);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 640 480"
      className={className}
      style={{
        borderRadius: '3px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    >
      <path fill="#FF9933" d="M0 0h640v160H0z" />
      <path fill="#FFFFFF" d="M0 160h640v160H0z" />
      <path fill="#128807" d="M0 320h640v160H0z" />
      <circle cx="320" cy="240" r="48" fill="#000088" />
      <circle cx="320" cy="240" r="40" fill="#FFFFFF" />
      <circle cx="320" cy="240" r="12" fill="#000088" />
      <g stroke="#000088" strokeWidth="2.5">
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
          <line
            key={deg}
            x1="320"
            y1="240"
            x2={320 + 38 * Math.sin((deg * Math.PI) / 180)}
            y2={240 - 38 * Math.cos((deg * Math.PI) / 180)}
          />
        ))}
      </g>
    </svg>
  );
};

export const FlagUSA = ({ size = 24, className = '', style = {} }) => {
  const height = Math.round(size * 0.68);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 640 480"
      className={className}
      style={{
        borderRadius: '3px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    >
      <path fill="#B22234" d="M0 0h640v480H0z" />
      <path
        stroke="#FFFFFF"
        strokeWidth="37"
        d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"
      />
      <path fill="#3C3B6E" d="M0 0h260v258.5H0z" />
      <g fill="#FFFFFF">
        {[
          [35, 30], [85, 30], [135, 30], [185, 30], [235, 30],
          [60, 65], [110, 65], [160, 65], [210, 65],
          [35, 100], [85, 100], [135, 100], [185, 100], [235, 100],
          [60, 135], [110, 135], [160, 135], [210, 135],
          [35, 170], [85, 170], [135, 170], [185, 170], [235, 170],
          [60, 205], [110, 205], [160, 205], [210, 205],
          [35, 235], [85, 235], [135, 235], [185, 235], [235, 235]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" />
        ))}
      </g>
    </svg>
  );
};

export const FlagSEA = ({ size = 24, className = '', style = {} }) => {
  const height = Math.round(size * 0.68);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 640 480"
      className={className}
      style={{
        borderRadius: '3px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    >
      <rect width="640" height="480" fill="#003399" />
      <circle cx="320" cy="240" r="145" fill="#FFFFFF" />
      <circle cx="320" cy="240" r="130" fill="#CC0000" />
      <circle cx="320" cy="240" r="95" fill="#FFCC00" />
      <path
        d="M295 170 Q320 140 345 170 Q335 240 345 310 Q320 320 295 310 Q305 240 295 170 Z"
        fill="#996600"
      />
    </svg>
  );
};

export const FlagSingapore = ({ size = 24, style = {} }) => {
  const height = Math.round(size * 0.68);
  return (
    <svg width={size} height={height} viewBox="0 0 640 480" style={{ borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.18)', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <path fill="#ED2939" d="M0 0h640v240H0z" />
      <path fill="#FFFFFF" d="M0 240h640v240H0z" />
      <circle cx="150" cy="120" r="70" fill="#FFFFFF" />
      <circle cx="170" cy="120" r="70" fill="#ED2939" />
    </svg>
  );
};

export const FlagMalaysia = ({ size = 24, style = {} }) => {
  const height = Math.round(size * 0.68);
  return (
    <svg width={size} height={height} viewBox="0 0 640 480" style={{ borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.18)', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <path fill="#CC0000" d="M0 0h640v480H0z" />
      <path stroke="#FFFFFF" strokeWidth="34" d="M0 51.4h640M0 119.9h640M0 188.4h640M0 256.9h640M0 325.4h640M0 393.9h640M0 462.4h640" />
      <path fill="#000066" d="M0 0h320v240H0z" />
      <circle cx="140" cy="120" r="60" fill="#FFCC00" />
      <circle cx="155" cy="120" r="50" fill="#000066" />
    </svg>
  );
};

export const FlagIndonesia = ({ size = 24, style = {} }) => {
  const height = Math.round(size * 0.68);
  return (
    <svg width={size} height={height} viewBox="0 0 640 480" style={{ borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.18)', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <path fill="#CE1126" d="M0 0h640v240H0z" />
      <path fill="#FFFFFF" d="M0 240h640v240H0z" />
    </svg>
  );
};

/**
 * Universal Country Flag Component
 * Given any country name or code, returns the proper SVG flag.
 */
export const CountryFlag = ({ country, size = 24, style = {}, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const c = String(country || '').trim().toLowerCase();

  let countryCode = 'in';
  if (c === 'us' || c === 'usa' || c.includes('united states') || c.includes('america')) {
    countryCode = 'us';
  } else if (c === 'sg' || c.includes('singapore')) {
    countryCode = 'sg';
  } else if (c === 'my' || c.includes('malaysia')) {
    countryCode = 'my';
  } else if (c === 'id' || c.includes('indonesia')) {
    countryCode = 'id';
  } else if (c === 'ph' || c.includes('philippines')) {
    countryCode = 'ph';
  } else if (c === 'vn' || c.includes('vietnam')) {
    countryCode = 'vn';
  } else if (c === 'th' || c.includes('thailand')) {
    countryCode = 'th';
  } else if (c === 'uk' || c === 'gb' || c.includes('united kingdom')) {
    countryCode = 'gb';
  } else if (c === 'ca' || c.includes('canada')) {
    countryCode = 'ca';
  } else if (c === 'au' || c.includes('australia')) {
    countryCode = 'au';
  } else if (c === 'in' || c === 'ind' || c.includes('india') || !c) {
    countryCode = 'in';
  }

  // If SEA general cluster
  if (c.includes('sea') || c.includes('southeast')) {
    return <FlagSEA size={size} style={style} className={className} />;
  }

  // Try FlagCDN first, fallback to crisp inline SVGs
  if (!imgError && countryCode) {
    const height = Math.round(size * 0.68);
    return (
      <img
        src={`https://flagcdn.com/w80/${countryCode}.png`}
        srcSet={`https://flagcdn.com/w160/${countryCode}.png 2x`}
        alt={country || countryCode}
        width={size}
        height={height}
        onError={() => setImgError(true)}
        className={className}
        style={{
          borderRadius: '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          display: 'inline-block',
          verticalAlign: 'middle',
          objectFit: 'cover',
          flexShrink: 0,
          ...style
        }}
      />
    );
  }

  if (countryCode === 'us') return <FlagUSA size={size} style={style} className={className} />;
  if (countryCode === 'sg') return <FlagSingapore size={size} style={style} className={className} />;
  if (countryCode === 'my') return <FlagMalaysia size={size} style={style} className={className} />;
  if (countryCode === 'id') return <FlagIndonesia size={size} style={style} className={className} />;
  return <FlagIndia size={size} style={style} className={className} />;
};

export default CountryFlag;
