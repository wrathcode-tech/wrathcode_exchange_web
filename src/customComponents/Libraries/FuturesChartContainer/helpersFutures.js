/**
 * Helpers for symbol parsing, resolution mapping and exchange meta.
 * Uses Binance USDT-M Futures endpoints.
 */

export function parseFuturesSymbol(input) {
  // Expect "BTCUSDT_PERP", allow "BTC/USDT_PERP"
  const cleaned = input.replace('/', '').toUpperCase();
  const isPerp = cleaned.endsWith('_PERP');
  const raw = cleaned.replace('_PERP', ''); // "BTCUSDT"
  // crude split: base is everything before last 4 letters if quote is USDT/USDC/BUSD etc.
  // Since we're using USDT-M, assume quote = USDT by default if endswith USDT
  let base = raw;
  let quote = 'USDT';
  if (raw.endsWith('USDT')) {
    base = raw.slice(0, -4);
    quote = 'USDT';
  } else if (raw.endsWith('USDC')) {
    base = raw.slice(0, -4);
    quote = 'USDC';
  } // extend if needed

  return { base, quote, raw, isPerp };
}

export function intervalToBinance(resolution) {
  // TV resolutions we support: '1','5','15','30','60','D','W','M'
  if (resolution === 'D') return '1d';
  if (resolution === 'W') return '1w';
  if (resolution === 'M') return '1M';
  if (resolution === '60') return '1h';
  if (resolution === '30') return '30m';
  if (resolution === '15') return '15m';
  if (resolution === '5') return '5m';
  if (resolution === '1') return '1m';
  // fallback
  return '1m';
}

export function getPriceScaleFromTickSize(tickSize) {
  // tickSize is a string like "0.01000000"
  if (!tickSize) return 100; // default
  const dot = tickSize.indexOf('.');
  if (dot === -1) return 1; // integer tick
  const decimals = tickSize.slice(dot + 1).search(/[^0]/) === -1
    ? tickSize.length - dot - 1
    : tickSize.slice(dot + 1).length; // conservative
  const scale = Math.pow(10, decimals);
  // Clamp to reasonable max
  return Math.min(scale, 100000000);
}

export async function fetchExchangeInfo(symbolRaw) {
  // Binance Futures exchangeInfo: https://fapi.binance.com/fapi/v1/exchangeInfo
  const url = 'https://fapi.binance.com/fapi/v1/exchangeInfo';
  const resp = await fetch(url);
  const json = await resp.json();
  const s = json.symbols?.find(x => x.symbol === symbolRaw);
  if (!s) return { priceScale: 100 };

  const priceFilter = (s.filters || []).find(f => f.filterType === 'PRICE_FILTER');
  const lotFilter   = (s.filters || []).find(f => f.filterType === 'LOT_SIZE');

  const tickSize = priceFilter?.tickSize || '0.01';
  const stepSize = lotFilter?.stepSize || '0.001';

  return {
    priceScale: getPriceScaleFromTickSize(tickSize),
    minQty: stepSize,
    tickSizeDecimalPlaces: tickSize,
  };
}
