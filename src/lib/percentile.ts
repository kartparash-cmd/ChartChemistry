/**
 * Percentile system for compatibility scores.
 *
 * Uses a normal distribution centered around 55 (average compatibility)
 * with a standard deviation of 15 to calculate how rare a given score is.
 */

/**
 * Approximate the cumulative distribution function (CDF) of the standard
 * normal distribution using the Abramowitz & Stegun approximation.
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}

export interface PercentileResult {
  /** The percentile value (e.g. 95 means "top 5%") */
  percentile: number;
  /** Human-readable label like "Top 5% — Exceptionally Rare Match!" */
  label: string;
  /** True if the match is in the top 10% */
  isRare: boolean;
}

/**
 * Calculate the percentile for a compatibility score.
 *
 * Uses a normal distribution with mean=55, stddev=15 so that:
 *   - Score 85+ -> ~Top 5%  (rare)
 *   - Score 75+ -> ~Top 9%  (rare)
 *   - Score 70+ -> ~Top 16%
 *   - Score 65+ -> ~Top 25%
 *   - Score 55+ -> ~Top 50%
 *   - Below 55  -> no percentile shown (returns percentile < 50)
 */
export function getPercentile(score: number): PercentileResult {
  const mean = 55;
  const stddev = 15;

  // z-score
  const z = (score - mean) / stddev;

  // CDF gives the probability that a value is <= score
  // Percentile = how many scores you're above = CDF * 100
  const cdf = normalCDF(z);
  const percentile = Math.round(cdf * 100);

  // "Top X%" = 100 - percentile
  const topPercent = Math.max(1, 100 - percentile);

  let label: string;
  let isRare = false;

  if (topPercent <= 5) {
    label = `Top ${topPercent}% — Exceptionally Rare Match!`;
    isRare = true;
  } else if (topPercent <= 10) {
    label = `Top ${topPercent}% — Extremely Rare Match`;
    isRare = true;
  } else if (topPercent <= 15) {
    label = `Top ${topPercent}% — Rare Compatibility`;
    isRare = false;
  } else if (topPercent <= 30) {
    label = `Top ${topPercent}% — Above Average Match`;
    isRare = false;
  } else if (topPercent <= 50) {
    label = `Top ${topPercent}%`;
    isRare = false;
  } else {
    // Below average — no special label
    label = "";
    isRare = false;
  }

  return { percentile, label, isRare };
}
