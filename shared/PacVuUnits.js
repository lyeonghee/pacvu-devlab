(function (root) {
  'use strict';

  const MM_PER_INCH = 25.4;
  const INCH_FRACTION_DENOMINATOR = 16;
  const UNITS = Object.freeze({ MM: 'mm', IN: 'in' });
  let activeUnit = UNITS.MM;

  function normalizeUnit(unit) {
    return unit === UNITS.IN ? UNITS.IN : UNITS.MM;
  }

  function setUnit(unit) {
    activeUnit = normalizeUnit(unit);
    return activeUnit;
  }

  function getUnit() {
    return activeUnit;
  }

  function greatestCommonDivisor(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
    while (y) {
      const next = x % y;
      x = y;
      y = next;
    }
    return x || 1;
  }

  function parseFractionalInches(value) {
    if (typeof value === 'number') return value;
    const text = String(value == null ? '' : value).trim().replace(/\s*in(?:ches)?\s*$/i, '');
    if (!text) return NaN;
    const numeric = Number(text);
    if (Number.isFinite(numeric)) return numeric;
    const match = text.match(/^([+-])?(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
    if (!match) return NaN;
    const denominator = Number(match[4]);
    if (!denominator) return NaN;
    const magnitude = Number(match[2] || 0) + Number(match[3]) / denominator;
    return match[1] === '-' ? -magnitude : magnitude;
  }

  function formatFractionalInches(value, denominator) {
    const base = Number(denominator) || INCH_FRACTION_DENOMINATOR;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '';
    const sign = numeric < 0 ? '-' : '';
    const roundedUnits = Math.round(Math.abs(numeric) * base);
    const whole = Math.floor(roundedUnits / base);
    const remainder = roundedUnits % base;
    if (!remainder) return sign + String(whole);
    const divisor = greatestCommonDivisor(remainder, base);
    const fraction = (remainder / divisor) + '/' + (base / divisor);
    return sign + (whole ? whole + ' ' : '') + fraction;
  }

  function toMillimeters(value, unit) {
    const normalized = normalizeUnit(unit == null ? activeUnit : unit);
    const numeric = normalized === UNITS.IN ? parseFractionalInches(value) : Number(value);
    if (!Number.isFinite(numeric)) return NaN;
    return normalized === UNITS.IN
      ? numeric * MM_PER_INCH
      : numeric;
  }

  function fromMillimeters(value, unit) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return NaN;
    return normalizeUnit(unit == null ? activeUnit : unit) === UNITS.IN
      ? numeric / MM_PER_INCH
      : numeric;
  }

  function roundDisplay(value, unit) {
    const normalized = normalizeUnit(unit == null ? activeUnit : unit);
    const precision = normalized === UNITS.IN ? 3 : 2;
    return String(Number(Number(value).toFixed(precision)));
  }

  function formatNumber(valueMm, unit) {
    const normalized = normalizeUnit(unit == null ? activeUnit : unit);
    if (normalized === UNITS.IN) {
      return formatFractionalInches(fromMillimeters(valueMm, normalized));
    }
    return roundDisplay(fromMillimeters(valueMm, normalized), normalized);
  }

  function formatLength(valueMm, unit) {
    const normalized = normalizeUnit(unit == null ? activeUnit : unit);
    return formatNumber(valueMm, normalized) + ' ' + normalized;
  }

  function formatDimension(axis, valueMm, unit) {
    return String(axis || '') + ' ' + formatLength(valueMm, unit);
  }

  function formatSize(widthMm, heightMm, unit) {
    const normalized = normalizeUnit(unit == null ? activeUnit : unit);
    return formatNumber(widthMm, normalized) + ' \u00D7 ' + formatNumber(heightMm, normalized) + ' ' + normalized;
  }

  root.PacVuUnits = Object.freeze({
    MM_PER_INCH,
    INCH_FRACTION_DENOMINATOR,
    UNITS,
    normalizeUnit,
    setUnit,
    getUnit,
    toMillimeters,
    fromMillimeters,
    parseFractionalInches,
    formatFractionalInches,
    formatNumber,
    formatLength,
    formatDimension,
    formatSize
  });
})(window);
