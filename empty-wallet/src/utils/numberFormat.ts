/**
 * Formats a raw input string with thousands comma separators live.
 * Handles decimals, empty strings, and arithmetic operators (+, -).
 */
export function formatLiveNumber(val: string): string {
  if (!val) return '';

  // Check if expression contains arithmetic operators (+ or -)
  if (val.includes('+') || (val.includes('-') && val.indexOf('-') > 0)) {
    return val
      .split(/([+-])/)
      .map((part) => {
        if (part === '+' || part === '-') return ` ${part} `;
        const trimmed = part.trim();
        if (!trimmed) return '';
        const [intPart, decPart] = trimmed.split('.');
        const cleanInt = intPart.replace(/[^\d]/g, '');
        const formattedInt = cleanInt ? Number(cleanInt).toLocaleString('en-US') : '';
        return decPart !== undefined ? `${formattedInt}.${decPart.replace(/[^\d]/g, '')}` : formattedInt;
      })
      .join('');
  }

  // Standard single number format
  const [intPart, decPart] = val.split('.');
  const cleanInt = intPart.replace(/[^\d]/g, '');
  if (!cleanInt && decPart === undefined) return '';

  const formattedInt = cleanInt ? Number(cleanInt).toLocaleString('en-US') : '0';
  return decPart !== undefined ? `${formattedInt}.${decPart.replace(/[^\d]/g, '')}` : formattedInt;
}

/**
 * Strips formatting/commas and evaluates simple arithmetic expressions (+, -).
 */
export function parseNumberInput(input: string): number {
  if (!input) return 0;
  try {
    const cleanExpr = input.replace(/,/g, '').trim();
    if (!cleanExpr) return 0;

    if (cleanExpr.includes('+') || (cleanExpr.includes('-') && cleanExpr.indexOf('-') > 0)) {
      const tokens = cleanExpr.split(/([+-])/).map((s) => s.trim()).filter(Boolean);
      let total = 0;
      let currentOp = '+';

      for (const token of tokens) {
        if (token === '+' || token === '-') {
          currentOp = token;
        } else {
          const num = parseFloat(token) || 0;
          if (currentOp === '+') total += num;
          else if (currentOp === '-') total -= num;
        }
      }
      return Math.max(0, total);
    }

    return Math.max(0, parseFloat(cleanExpr) || 0);
  } catch {
    return 0;
  }
}
