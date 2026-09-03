export function inr(n: number): string {
  if (Math.abs(n) >= 100000) {
    return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")}L`;
  }
  return `₹${n.toLocaleString("en-IN")}`;
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}
