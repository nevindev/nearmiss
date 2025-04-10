function uniqueBy<T, K extends keyof T>(arr: T[], key: K): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function parseStringToFloat(str: string | null): number {
  if (str === null) {
    return NaN;
  } else {
    const num = parseFloat(str);
    return Number.isNaN(num) ? NaN : num;
  }
}

export { uniqueBy, parseStringToFloat }